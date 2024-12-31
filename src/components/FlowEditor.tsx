import { useCallback, useState, MouseEvent, useMemo } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyEdgeChanges,
  applyNodeChanges,
  NodeChange,
  EdgeChange,
  Connection,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
  ConnectionMode,
  OnConnectStart,
  OnConnectEnd,
  Node,
  NodeMouseHandler,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useStore } from '../store/useStore';
import { Toolbar } from './Toolbar';
import { ContextMenu } from './ContextMenu';
import { ConnectionState, HandleType, FlowNode, FlowEdge, isDynamicNode, isRecipeNode } from '../types';
import { NODE_TYPES } from '../nodeTypes';

function Flow() {
  const { nodes, edges, setNodes, setEdges } = useStore();
  const { screenToFlowPosition } = useReactFlow();
  
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    nodeId: null,
    handleId: null,
    handleType: null,
    sourceItemName: null,
  });
  const [contextMenu, setContextMenu] = useState<{
    type: 'canvas' | 'node' | 'edge';
    node?: FlowNode;
    edge?: FlowEdge;
    position: { x: number; y: number } | null;
  }>({
    type: 'canvas',
    position: null,
  });

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes(applyNodeChanges(changes, nodes));
    },
    [nodes, setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      // Find deleted edges BEFORE applying changes
      const deletedEdges = changes
        .filter(change => change.type === 'remove')
        .map(change => edges.find(edge => edge.id === change.id))
        .filter((edge): edge is FlowEdge => edge !== undefined);

      // Apply the changes to get the new edges
      const newEdges = applyEdgeChanges(changes, edges);

      // For each deleted edge, check affected nodes
      if (deletedEdges.length > 0) {
        const newNodes = nodes.map(node => {
          // Only process dynamic nodes (splerger or sink)
          if (!node.data || !('type' in node.data) || !['splerger', 'sink'].includes(node.data.type)) {
            return node;
          }

          // Check if this node was connected to any of the deleted edges
          const wasConnected = deletedEdges.some(
            edge => edge.source === node.id || edge.target === node.id
          );

          if (!wasConnected) {
            return node;
          }

          // Check if the node still has any remaining connections
          const hasRemainingConnections = newEdges.some(
            edge => edge.source === node.id || edge.target === node.id
          );

          // Reset the type if no connections remain
          if (!hasRemainingConnections) {
            return {
              ...node,
              data: {
                ...node.data,
                itemType: null,
              },
            };
          }

          return node;
        });

        setNodes(newNodes);
      }

      setEdges(newEdges);
    },
    [edges, nodes, setNodes]
  );

  const validateConnection = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target || !connection.sourceHandle || !connection.targetHandle) {
      return false;
    }

    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);

    if (!sourceNode || !targetNode) {
      return false;
    }

    // Handle dynamic nodes
    if ('type' in sourceNode.data || 'type' in targetNode.data) {
      const dynamicSource = 'type' in sourceNode.data;
      const dynamicTarget = 'type' in targetNode.data;
      const dynamicSourceNode = dynamicSource ? sourceNode.data : null;
      const dynamicTargetNode = dynamicTarget ? targetNode.data : null;

      // If both nodes are dynamic, allow the connection
      if (dynamicSource && dynamicTarget) {
        return true;
      }

      // If source is dynamic, check if it has an item type set
      if (dynamicSource && dynamicSourceNode) {
        if (!dynamicSourceNode.itemType) {
          return true; // Allow connection to set the item type
        }
        // If target is a recipe node, check if the item type matches
        if (targetNode.data.recipe) {
          const targetInputIndex = parseInt(connection.targetHandle.split('-')[1] || '0');
          const targetInput = targetNode.data.recipe.inputs[targetInputIndex];
          return dynamicSourceNode.itemType === targetInput?.name;
        }
      }

      // If target is dynamic, check if it has an item type set
      if (dynamicTarget && dynamicTargetNode) {
        if (!dynamicTargetNode.itemType) {
          return true; // Allow connection to set the item type
        }
        // If source is a recipe node, check if the item type matches
        if (sourceNode.data.recipe) {
          const sourceOutputIndex = parseInt(connection.sourceHandle.split('-')[1] || '0');
          const sourceOutput = sourceNode.data.recipe.outputs[sourceOutputIndex];
          return dynamicTargetNode.itemType === sourceOutput?.name;
        }
      }

      return true;
    }

    // Regular recipe node validation
    if (!sourceNode.data.recipe || !targetNode.data.recipe) {
      return false;
    }

    const sourceOutputIndex = parseInt(connection.sourceHandle.split('-')[1] || '0');
    const targetInputIndex = parseInt(connection.targetHandle.split('-')[1] || '0');

    const sourceOutput = sourceNode.data.recipe.outputs[sourceOutputIndex];
    const targetInput = targetNode.data.recipe.inputs[targetInputIndex];

    return sourceOutput?.name === targetInput?.name;
  }, [nodes]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!validateConnection(connection)) {
        return;
      }

      const sourceNode = nodes.find(n => n.id === connection.source);
      const targetNode = nodes.find(n => n.id === connection.target);

      if (!sourceNode || !targetNode) {
        return;
      }

      // Update item types for dynamic nodes
      if ('type' in sourceNode.data || 'type' in targetNode.data) {
        const newNodes = nodes.map(node => {
          if (node.id === connection.source && 'type' in node.data && !node.data.itemType) {
            // Set source node item type from target node
            const targetNodeData = targetNode.data;
            let itemType = null;
            if ('recipe' in targetNodeData && targetNodeData.recipe) {
              const targetInputIndex = parseInt(connection.targetHandle?.split('-')[1] || '0');
              itemType = targetNodeData.recipe.inputs[targetInputIndex]?.name || null;
            } else if ('type' in targetNodeData) {
              itemType = targetNodeData.itemType;
            }
            return {
              ...node,
              data: {
                ...node.data,
                itemType,
              },
            };
          }
          if (node.id === connection.target && 'type' in node.data && !node.data.itemType) {
            // Set target node item type from source node
            const sourceNodeData = sourceNode.data;
            let itemType = null;
            if ('recipe' in sourceNodeData && sourceNodeData.recipe) {
              const sourceOutputIndex = parseInt(connection.sourceHandle?.split('-')[1] || '0');
              itemType = sourceNodeData.recipe.outputs[sourceOutputIndex]?.name || null;
            } else if ('type' in sourceNodeData) {
              itemType = sourceNodeData.itemType;
            }
            return {
              ...node,
              data: {
                ...node.data,
                itemType,
              },
            };
          }
          return node;
        });
        setNodes(newNodes);
      }

      setEdges(edges => addEdge(connection, edges));
    },
    [nodes, validateConnection]
  );

  const onConnectStart: OnConnectStart = useCallback((_, { nodeId, handleId, handleType }) => {
    if (!nodeId || !handleId || !handleType) return;

    // Get the source node and item
    const sourceNode = nodes.find(n => n.id === nodeId);
    if (!sourceNode) return;

    const sourceIndex = parseInt(handleId.split('-')[1] || '');
    if (isNaN(sourceIndex)) return;

    let sourceItemName = null;

    if ('recipe' in sourceNode.data && sourceNode.data.recipe) {
      // For recipe nodes, get the item name from the specific input/output
      const sourceItems = handleType === HandleType.Source ? 
        sourceNode.data.recipe.outputs : 
        sourceNode.data.recipe.inputs;
      const sourceItem = sourceItems[sourceIndex];
      if (sourceItem) {
        sourceItemName = sourceItem.name;
      }
    } else if ('type' in sourceNode.data) {
      // For dynamic nodes, use the node's item type or '*' if untyped
      sourceItemName = sourceNode.data.itemType || '*';
    }

    setConnectionState({
      nodeId,
      handleId,
      handleType: handleType as HandleType,
      sourceItemName,
    });
  }, [nodes]);

  const onConnectEnd: OnConnectEnd = useCallback(() => {
    setConnectionState({
      nodeId: null,
      handleId: null,
      handleType: null,
      sourceItemName: null,
    });
  }, []);

  const onContextMenu = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();

      const target = event.target as HTMLElement;
      const isNode = target.closest('.react-flow__node');
      const isEdge = target.closest('.react-flow__edge');

      if (isNode || isEdge) {
        return;
      }

      screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setContextMenu({
        type: 'canvas',
        position: { x: event.clientX, y: event.clientY },
      });
    },
    [screenToFlowPosition]
  );

  const onNodeContextMenu: NodeMouseHandler = useCallback(
    (event: MouseEvent, node: Node) => {
      event.preventDefault();
      event.stopPropagation();

      setContextMenu({
        type: 'node',
        node: node as FlowNode,
        position: { x: event.clientX, y: event.clientY },
      });
    },
    []
  );

  const onEdgeContextMenu = useCallback(
    (event: MouseEvent, edge: FlowEdge) => {
      event.preventDefault();
      event.stopPropagation();

      setContextMenu({
        type: 'edge',
        edge,
        position: { x: event.clientX, y: event.clientY },
      });
    },
    []
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes(nodes.filter(n => n.id !== nodeId));
      setEdges(edges.filter(e => e.source !== nodeId && e.target !== nodeId));
    },
    [nodes, edges, setNodes, setEdges]
  );

  const deleteEdge = useCallback(
    (edgeId: string) => {
      // Find the edge that's being deleted
      const deletedEdge = edges.find(e => e.id === edgeId);

      if (deletedEdge) {
        // Get new edges state after deletion
        const newEdges = edges.filter(e => e.id !== edgeId);

        // Update nodes if necessary
        const newNodes = nodes.map(node => {
          // Only process dynamic nodes (splerger or sink)
          if (!node.data || !('type' in node.data) || !['splerger', 'sink'].includes(node.data.type)) {
            return node;
          }

          // Check if this node was connected to the deleted edge
          const wasConnected = deletedEdge.source === node.id || deletedEdge.target === node.id;

          if (!wasConnected) {
            return node;
          }

          // Check if the node still has any remaining connections
          const hasRemainingConnections = newEdges.some(
            edge => edge.source === node.id || edge.target === node.id
          );

          // Reset the type if no connections remain
          if (!hasRemainingConnections) {
            return {
              ...node,
              data: {
                ...node.data,
                itemType: null,
              },
            };
          }

          return node;
        });

        setNodes(newNodes);
        setEdges(newEdges);
      }
    },
    [edges, nodes, setNodes, setEdges]
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, position: null }));
  }, []);

  const isValidConnection = useCallback((node: FlowNode, connectionState: ConnectionState) => {
    if (connectionState.nodeId === null || connectionState.nodeId === node.id) {
      return false;
    }

    const isDraggingFromSource = connectionState.handleType === HandleType.Source;

    // For recipe nodes
    if (isRecipeNode(node.data)) {
      if (!node.data.recipe) return false;
      
      // When dragging from a source handle (output), highlight valid input handles
      if (isDraggingFromSource) {
        return node.data.recipe.inputs.some((input: { name: string }) => 
          input.name === connectionState.sourceItemName || connectionState.sourceItemName === '*'
        );
      }
      
      // When dragging from a target handle (input), highlight valid output handles
      return node.data.recipe.outputs.some((output: { name: string }) => 
        output.name === connectionState.sourceItemName || connectionState.sourceItemName === '*'
      );
    }

    // For dynamic nodes (splerger/sink)
    if (isDynamicNode(node.data)) {
      // Skip the node we're dragging from
      if (node.id === connectionState.nodeId) {
        return false;
      }

      // If this node has no type yet, it can accept any connection
      if (node.data.itemType === null) {
        return true;
      }

      // If dragging from a source handle (output), highlight valid input handles
      if (isDraggingFromSource) {
        return node.data.itemType === connectionState.sourceItemName;
      }
      
      // If dragging from a target handle (input), highlight valid output handles
      return node.data.itemType === connectionState.sourceItemName;
    }

    return false;
  }, []);

  const enhancedNodes = useMemo(() => 
    nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        isConnecting: connectionState.nodeId !== null,
        isValidConnection: isValidConnection(node, connectionState),
        connectionState,
      },
    })), [nodes, connectionState]
  );

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={enhancedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onContextMenu={onContextMenu}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        onPaneClick={closeContextMenu}
        nodeTypes={NODE_TYPES}
        connectionMode={ConnectionMode.Strict}
        snapToGrid
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
      <Toolbar />
      <ContextMenu
        type={contextMenu.type}
        node={contextMenu.node}
        edge={contextMenu.edge}
        position={contextMenu.position}
        onClose={closeContextMenu}
        onDeleteNode={deleteNode}
        onDeleteEdge={deleteEdge}
      />
    </div>
  );
}

export function FlowEditor() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}

export const isValidConnection = (node: FlowNode, connectionState: ConnectionState): boolean => {
  if (connectionState.nodeId === null || connectionState.nodeId === node.id) {
    return false;
  }

  const isDraggingFromSource = connectionState.handleType === HandleType.Source;

  // For recipe nodes
  if (isRecipeNode(node.data)) {
    if (!node.data.recipe) return false;
    
    // When dragging from a source handle (output), highlight valid input handles
    if (isDraggingFromSource) {
      return node.data.recipe.inputs.some((input: { name: string }) => 
        input.name === connectionState.sourceItemName || connectionState.sourceItemName === '*'
      );
    }
    
    // When dragging from a target handle (input), highlight valid output handles
    return node.data.recipe.outputs.some((output: { name: string }) => 
      output.name === connectionState.sourceItemName || connectionState.sourceItemName === '*'
    );
  }

  // For dynamic nodes (splerger/sink)
  if (isDynamicNode(node.data)) {
    // Skip the node we're dragging from
    if (node.id === connectionState.nodeId) {
      return false;
    }

    // If this node has no type yet, it can accept any connection
    if (node.data.itemType === null) {
      return true;
    }

    // If dragging from a source handle (output), highlight valid input handles
    if (isDraggingFromSource) {
      return node.data.itemType === connectionState.sourceItemName;
    }
    
    // If dragging from a target handle (input), highlight valid output handles
    return node.data.itemType === connectionState.sourceItemName;
  }

  return false;
};

export const getValidHandles = (sourceNode: FlowNode, targetNode: FlowNode, handleType: HandleType): string[] => {
  const validHandles: string[] = [];

  if (handleType === HandleType.Source) {
    if (isRecipeNode(sourceNode.data)) {
      const outputs = sourceNode.data.recipe?.outputs || [];
      for (const output of outputs) {
        if (isRecipeNode(targetNode.data)) {
          const inputs = targetNode.data.recipe?.inputs || [];
          if (inputs.some((input: { name: string }) => input.name === output.name)) {
            validHandles.push(output.name);
          }
        } else if (isDynamicNode(targetNode.data)) {
          if (targetNode.data.itemType === null || targetNode.data.itemType === output.name) {
            validHandles.push(output.name);
          }
        }
      }
    } else if (isDynamicNode(sourceNode.data) && sourceNode.data.type === 'splerger') {
      const sourceItemType = sourceNode.data.itemType;
      if (sourceItemType !== null) {
        if (isRecipeNode(targetNode.data)) {
          const inputs = targetNode.data.recipe?.inputs || [];
          if (inputs.some((input: { name: string }) => input.name === sourceItemType)) {
            validHandles.push(sourceItemType);
          }
        } else if (isDynamicNode(targetNode.data)) {
          if (targetNode.data.itemType === null || targetNode.data.itemType === sourceItemType) {
            validHandles.push(sourceItemType);
          }
        }
      }
    }
  }

  return validHandles;
}; 
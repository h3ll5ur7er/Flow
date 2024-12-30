import { useCallback, useState, MouseEvent } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyEdgeChanges,
  applyNodeChanges,
  NodeChange,
  EdgeChange,
  Connection,
  addEdge,
  Edge,
  Node,
  useReactFlow,
  ReactFlowProvider,
  ConnectionMode,
  getConnectedEdges,
  OnConnectStart,
  OnConnectEnd,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useStore } from '../store/useStore';
import { Toolbar } from './Toolbar';
import { RecipeNode } from './nodes/RecipeNode';
import { SubgraphNode } from './nodes/SubgraphNode';
import { ContextMenu } from './ContextMenu';

const nodeTypes = {
  recipe: RecipeNode,
  subgraph: SubgraphNode,
};

interface ConnectionState {
  nodeId: string | null;
  handleId: string | null;
  handleType: 'source' | 'target' | null;
  validHandles: Set<string>;
  sourceItemName: string | null;
}

function Flow() {
  const { nodes, edges, setNodes, setEdges } = useStore();
  const { project } = useReactFlow();
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    nodeId: null,
    handleId: null,
    handleType: null,
    validHandles: new Set(),
    sourceItemName: null,
  });
  const [contextMenu, setContextMenu] = useState<{
    type: 'canvas' | 'node' | 'edge';
    node?: Node;
    edge?: Edge;
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
      setEdges(applyEdgeChanges(changes, edges));
    },
    [edges, setEdges]
  );

  const getItemTypeFromHandle = (nodeId: string, handleId: string, isOutput: boolean) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node?.data.recipe) return null;

    // Handle ID format is 'source-0' or 'target-0'
    const parts = handleId.split('-');
    if (parts.length !== 2) return null;
    
    const index = parseInt(parts[1]);
    if (isNaN(index)) return null;

    const items = isOutput ? node.data.recipe.outputs : node.data.recipe.inputs;
    if (!items || index >= items.length) return null;

    // Access the name property of the RecipeItem
    return items[index]?.name || null;
  };

  const validateConnection = (connection: Connection) => {
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);

    if (!sourceNode?.data.recipe || !targetNode?.data.recipe) {
      return false;
    }

    // Extract item types from the source output and target input
    const sourceOutputIndex = parseInt(connection.sourceHandle?.split('-')[1] || '0');
    const targetInputIndex = parseInt(connection.targetHandle?.split('-')[1] || '0');

    const sourceOutput = sourceNode.data.recipe.outputs[sourceOutputIndex];
    const targetInput = targetNode.data.recipe.inputs[targetInputIndex];

    // Check if the item types match
    return sourceOutput?.name === targetInput?.name;
  };

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!validateConnection(connection)) {
        return;
      }

      setEdges(edges => addEdge(connection, edges));
    },
    [nodes]
  );

  const getValidHandles = (nodeId: string, handleId: string, handleType: 'source' | 'target') => {
    console.log('getValidHandles called with:', { nodeId, handleId, handleType });
    
    const validHandles = new Set<string>();
    const sourceNode = nodes.find(n => n.id === nodeId);
    if (!sourceNode?.data.recipe) return validHandles;

    // Get the source item type
    const sourceIndex = parseInt(handleId.split('-')[1] || '');
    console.log('Source index:', sourceIndex);
    if (isNaN(sourceIndex)) return validHandles;

    // Get the item we're dragging from
    const sourceItems = handleType === 'source' ? sourceNode.data.recipe.outputs : sourceNode.data.recipe.inputs;
    const sourceItem = sourceItems[sourceIndex];
    console.log('Source item:', sourceItem);
    if (!sourceItem) return validHandles;

    // Create a map of valid item names to their handle IDs
    const validItemHandles = new Map<string, Set<string>>();

    // Check each node for valid connections
    nodes.forEach(targetNode => {
      if (targetNode.id === nodeId || !targetNode.data.recipe) return;
      console.log('Checking target node:', targetNode.id);

      // When dragging from a source (output), look at target (input) handles
      // When dragging from a target (input), look at source (output) handles
      const targetItems = handleType === 'source' ? targetNode.data.recipe.inputs : targetNode.data.recipe.outputs;
      console.log('Target items:', targetItems);
      
      targetItems.forEach((targetItem: { name: string; quantity: number }, index: number) => {
        console.log('Comparing items:', { sourceItem: sourceItem.name, targetItem: targetItem.name });
        if (targetItem.name === sourceItem.name) {
          // When dragging from source (output), highlight input handles
          // When dragging from target (input), highlight output handles
          const targetHandleId = handleType === 'source' ? `input-${index}` : `output-${index}`;
          console.log('Adding valid handle:', targetHandleId);
          
          // Add to the map of valid item handles
          if (!validItemHandles.has(targetItem.name)) {
            validItemHandles.set(targetItem.name, new Set());
          }
          validItemHandles.get(targetItem.name)?.add(targetHandleId);
          validHandles.add(targetHandleId);
        }
      });
    });

    console.log('Valid handles:', Array.from(validHandles));
    console.log('Valid item handles:', Object.fromEntries(validItemHandles));
    return validHandles;
  };

  const onConnectStart: OnConnectStart = useCallback((_, { nodeId, handleId, handleType }) => {
    console.log('onConnectStart:', { nodeId, handleId, handleType });
    if (!nodeId || !handleId || !handleType) return;

    // Get the source node and item
    const sourceNode = nodes.find(n => n.id === nodeId);
    if (!sourceNode?.data.recipe) return;

    const sourceIndex = parseInt(handleId.split('-')[1] || '');
    if (isNaN(sourceIndex)) return;

    const sourceItems = handleType === 'source' ? sourceNode.data.recipe.outputs : sourceNode.data.recipe.inputs;
    const sourceItem = sourceItems[sourceIndex];
    if (!sourceItem) return;

    // Find all valid handles that match this item type
    const validHandles = new Set<string>();
    nodes.forEach(targetNode => {
      if (targetNode.id === nodeId || !targetNode.data.recipe) return;

      const targetItems = handleType === 'source' ? targetNode.data.recipe.inputs : targetNode.data.recipe.outputs;
      targetItems.forEach((targetItem: { name: string; quantity: number }, index: number) => {
        if (targetItem.name === sourceItem.name) {
          const targetHandleId = handleType === 'source' ? `input-${index}` : `output-${index}`;
          validHandles.add(targetHandleId);
        }
      });
    });

    setConnectionState({
      nodeId,
      handleId,
      handleType: handleType as 'source' | 'target',
      validHandles,
      sourceItemName: sourceItem.name,
    });
  }, [nodes]);

  const onConnectEnd: OnConnectEnd = useCallback(() => {
    setConnectionState({
      nodeId: null,
      handleId: null,
      handleType: null,
      validHandles: new Set(),
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

      const bounds = target.closest('.react-flow')?.getBoundingClientRect();
      if (bounds) {
        const position = project({
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        });

        setContextMenu({
          type: 'canvas',
          position: { x: event.clientX, y: event.clientY },
        });
      }
    },
    [project]
  );

  const onNodeContextMenu = useCallback(
    (event: MouseEvent, node: Node) => {
      event.preventDefault();
      event.stopPropagation();

      setContextMenu({
        type: 'node',
        node,
        position: { x: event.clientX, y: event.clientY },
      });
    },
    []
  );

  const onEdgeContextMenu = useCallback(
    (event: MouseEvent, edge: Edge) => {
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
      setEdges(edges.filter(e => e.id !== edgeId));
    },
    [edges, setEdges]
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, position: null }));
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            isConnecting: connectionState.nodeId !== null,
            isValidConnection: connectionState.nodeId !== node.id && node.data.recipe !== null,
            validHandles: connectionState.validHandles,
            connectionState: {
              nodeId: connectionState.nodeId,
              handleId: connectionState.handleId,
              handleType: connectionState.handleType,
              sourceItemName: connectionState.sourceItemName,
            },
          },
        }))}
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
        nodeTypes={nodeTypes}
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
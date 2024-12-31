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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useStore } from '../store/useStore';
import { Toolbar } from './Toolbar';
import { ContextMenu } from './ContextMenu';
import { ConnectionState, HandleType, FlowNode, FlowEdge } from '../types';
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
      setEdges(applyEdgeChanges(changes, edges));
    },
    [edges, setEdges]
  );

  const validateConnection = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target || !connection.sourceHandle || !connection.targetHandle) {
      return false;
    }

    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);

    if (!sourceNode?.data.recipe || !targetNode?.data.recipe) {
      return false;
    }

    // Extract item types from the source output and target input
    const sourceOutputIndex = parseInt(connection.sourceHandle.split('-')[1] || '0');
    const targetInputIndex = parseInt(connection.targetHandle.split('-')[1] || '0');

    const sourceOutput = sourceNode.data.recipe.outputs[sourceOutputIndex];
    const targetInput = targetNode.data.recipe.inputs[targetInputIndex];

    // Check if the item types match
    return sourceOutput?.name === targetInput?.name;
  }, [nodes]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!validateConnection(connection)) {
        return;
      }

      setEdges(edges => addEdge(connection, edges));
    },
    [validateConnection]
  );

  const onConnectStart: OnConnectStart = useCallback((_, { nodeId, handleId, handleType }) => {
    if (!nodeId || !handleId || !handleType) return;

    // Get the source node and item
    const sourceNode = nodes.find(n => n.id === nodeId);
    if (!sourceNode?.data.recipe) return;

    const sourceIndex = parseInt(handleId.split('-')[1] || '');
    if (isNaN(sourceIndex)) return;

    const sourceItems = handleType === HandleType.Source ? sourceNode.data.recipe.outputs : sourceNode.data.recipe.inputs;
    const sourceItem = sourceItems[sourceIndex];
    if (!sourceItem) return;

    setConnectionState({
      nodeId,
      handleId,
      handleType: handleType as HandleType,
      sourceItemName: sourceItem.name,
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

  const onNodeContextMenu = useCallback(
    (event: MouseEvent, node: FlowNode) => {
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
      setEdges(edges.filter(e => e.id !== edgeId));
    },
    [edges, setEdges]
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, position: null }));
  }, []);

  const enhancedNodes = useMemo(() => 
    nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        isConnecting: connectionState.nodeId !== null,
        isValidConnection: connectionState.nodeId !== node.id && node.data.recipe !== null,
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
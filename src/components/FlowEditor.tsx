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

function Flow() {
  const { nodes, edges, setNodes, setEdges } = useStore();
  const { project } = useReactFlow();
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

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges(edges => addEdge(connection, edges));
    },
    [setEdges]
  );

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
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
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
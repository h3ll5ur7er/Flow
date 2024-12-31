import React from 'react';
import { isValidConnection } from '../../utils/validation';
import { FlowNode, HandleType, ConnectionState, Recipe, FlowEdge } from '../../types';
import { Flow } from '../../components/FlowEditor';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ReactFlowProvider } from 'reactflow';
import { useStore } from '../../store/useStore';
import { isRecipeNode, isDynamicNode } from '../../types';
import { 
  createTestScenarios,
  createHighlightingScenarios,
  createMockStoreScenarios,
  createTestNodesWithConnections,
  createCommonRecipes,
  createConnectionState,
  createRecipe,
  createRecipeNode,
  createDynamicNode,
  createEdge,
  createMockStore,
  withConnectionState,
  createTestNodes,
  createNodesWithConnection
} from './testUtils';

// Mock the useStore hook
jest.mock('../../store/useStore');
const mockUseStore = useStore as jest.MockedFunction<typeof useStore>;

// Mock ReactFlow component and its hooks
jest.mock('reactflow', () => {
  const actual = jest.requireActual('reactflow');
  const MockReactFlow = ({ nodes, edges, nodeTypes, onNodesChange, onEdgesChange, onConnect, onConnectStart, onConnectEnd, onContextMenu, onNodeContextMenu, onEdgeContextMenu, onPaneClick }: { 
    nodes: FlowNode[]; 
    edges: FlowEdge[];
    nodeTypes: any;
    onNodesChange: any;
    onEdgesChange: any;
    onConnect: any;
    onConnectStart: any;
    onConnectEnd: any;
    onContextMenu: any;
    onNodeContextMenu: any;
    onEdgeContextMenu: any;
    onPaneClick: any;
  }) => (
    <div data-testid="mock-react-flow">
      {nodes.map((node: FlowNode) => (
        <div key={node.id} data-testid={`node-${node.id}`}>
          {node.type === 'recipe' && isRecipeNode(node.data) && node.data.recipe && (
            <>
              {node.data.recipe.inputs.map((input: { name: string; quantity: number }, index: number) => {
                const shouldHighlight = node.data.isConnecting && 
                  node.data.connectionState?.handleType === HandleType.Source && 
                  node.data.connectionState?.nodeId !== node.id &&
                  input.name === node.data.connectionState?.sourceItemName;
                return (
                  <div
                    key={`input-${index}`}
                    data-testid={`recipe-input-${node.id}-${index}`}
                    className={shouldHighlight ? 'highlight' : ''}
                  >
                    {input.name} × {input.quantity}
                  </div>
                );
              })}
              {node.data.recipe.outputs.map((output: { name: string; quantity: number }, index: number) => {
                const shouldHighlight = node.data.isConnecting && 
                  node.data.connectionState?.handleType === HandleType.Target && 
                  node.data.connectionState?.nodeId !== node.id &&
                  output.name === node.data.connectionState?.sourceItemName;
                return (
                  <div
                    key={`output-${index}`}
                    data-testid={`recipe-output-${node.id}-${index}`}
                    className={shouldHighlight ? 'highlight' : ''}
                  >
                    {output.name} × {output.quantity}
                  </div>
                );
              })}
            </>
          )}
          {(node.type === 'splerger' || node.type === 'sink') && isDynamicNode(node.data) && (
            <>
              <div
                data-testid={`${node.data.type}-input-${node.id}-0`}
                className={node.data.isConnecting && 
                  node.data.connectionState?.handleType === HandleType.Source && 
                  node.data.connectionState?.nodeId !== node.id &&
                  (!node.data.itemType || node.data.itemType === node.data.connectionState?.sourceItemName) ? 'highlight' : ''}
              >
                {node.data.itemType || 'untyped'}
              </div>
              {node.data.type === 'splerger' && (
                <div
                  data-testid={`${node.data.type}-output-${node.id}-0`}
                  className={node.data.isConnecting && 
                    node.data.connectionState?.handleType === HandleType.Target && 
                    node.data.connectionState?.nodeId !== node.id &&
                    (!node.data.itemType || node.data.itemType === node.data.connectionState?.sourceItemName) ? 'highlight' : ''}
                >
                  {node.data.itemType || 'untyped'}
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );

  return {
    __esModule: true,
    default: MockReactFlow,
    ReactFlowProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    useReactFlow: () => ({
      screenToFlowPosition: jest.fn((position) => position),
      getNode: jest.fn(),
      getEdge: jest.fn(),
    }),
    ConnectionMode: actual.ConnectionMode,
    Background: jest.fn(() => null),
    Controls: jest.fn(() => null),
    applyEdgeChanges: actual.applyEdgeChanges,
    applyNodeChanges: actual.applyNodeChanges,
    addEdge: actual.addEdge,
  };
});

// Mock node types
jest.mock('../../nodeTypes', () => ({
  NODE_TYPES: {
    recipe: jest.fn(({ data, id }: any) => (
      <div data-testid={`recipe-node-${id}`}>
        {data.recipe && (
          <>
            {data.recipe.inputs.map((input: any, index: number) => {
              const shouldHighlight = data.isConnecting && 
                data.handleType === HandleType.Source && 
                data.connectionState?.nodeId !== id &&
                input.name === data.sourceItemName;
              return (
                <div 
                  key={`input-${index}`} 
                  data-testid={`recipe-input-${id}-${index}`}
                  className={shouldHighlight ? 'highlight' : ''}
                >
                  {input.name} × {input.quantity}
                </div>
              );
            })}
            {data.recipe.outputs.map((output: any, index: number) => {
              const shouldHighlight = data.isConnecting && 
                data.handleType === HandleType.Target && 
                data.connectionState?.nodeId !== id &&
                output.name === data.sourceItemName;
              return (
                <div 
                  key={`output-${index}`} 
                  data-testid={`recipe-output-${id}-${index}`}
                  className={shouldHighlight ? 'highlight' : ''}
                >
                  {output.name} × {output.quantity}
                </div>
              );
            })}
          </>
        )}
      </div>
    )),
    splerger: jest.fn(({ data, id }: any) => {
      const canAcceptConnection = !data.itemType || data.itemType === data.sourceItemName;
      return (
        <div data-testid={`splerger-node-${id}`}>
          <div 
            data-testid={`splerger-input-${id}-0`}
            className={data.isConnecting && 
              data.handleType === HandleType.Source && 
              data.connectionState?.nodeId !== id &&
              canAcceptConnection ? 'highlight' : ''}
          >
            {data.itemType || 'untyped'}
          </div>
          <div 
            data-testid={`splerger-output-${id}-0`}
            className={data.isConnecting && 
              data.handleType === HandleType.Target && 
              data.connectionState?.nodeId !== id &&
              canAcceptConnection ? 'highlight' : ''}
          >
            {data.itemType || 'untyped'}
          </div>
        </div>
      );
    }),
    sink: jest.fn(({ data, id }: any) => {
      const canAcceptConnection = !data.itemType || data.itemType === data.sourceItemName;
      return (
        <div data-testid={`sink-node-${id}`}>
          <div 
            data-testid={`sink-input-${id}-0`}
            className={data.isConnecting && 
              data.handleType === HandleType.Source && 
              data.connectionState?.nodeId !== id &&
              canAcceptConnection ? 'highlight' : ''}
          >
            {data.itemType || 'untyped'}
          </div>
        </div>
      );
    }),
  },
}));

describe('FlowEditor connection validation', () => {
  const scenarios = createTestScenarios();

  describe('Recipe Node Connections', () => {
    it('should validate matching item types between recipe nodes', () => {
      const { validIronConnection } = scenarios;
      expect(isValidConnection(validIronConnection.target, validIronConnection.connectionState)).toBe(true);
    });

    it('should reject mismatched item types between recipe nodes', () => {
      const { invalidTypeConnection } = scenarios;
      expect(isValidConnection(invalidTypeConnection.target, invalidTypeConnection.connectionState)).toBe(false);
    });
  });

  describe('Dynamic Node Connections (Splerger)', () => {
    const { splergerConnections } = scenarios;

    describe('Typed Splerger', () => {
      it('should accept matching input connections', () => {
        expect(isValidConnection(splergerConnections.typedSplerger, splergerConnections.ironConnection)).toBe(true);
      });

      it('should reject mismatched input connections', () => {
        expect(isValidConnection(splergerConnections.typedSplerger, splergerConnections.copperConnection)).toBe(false);
      });

      it('should accept matching output connections', () => {
        const { validIronConnection } = scenarios;
        const connectionState = createConnectionState(
          splergerConnections.typedSplerger.id,
          'output-0',
          HandleType.Source,
          'iron'
        );
        expect(isValidConnection(validIronConnection.target, connectionState)).toBe(true);
      });
    });

    describe('Untyped Splerger', () => {
      it('should accept any input connection', () => {
        expect(isValidConnection(splergerConnections.untypedSplerger, splergerConnections.ironConnection)).toBe(true);
        expect(isValidConnection(splergerConnections.untypedSplerger, splergerConnections.copperConnection)).toBe(true);
      });

      it('should accept any output connection when untyped', () => {
        const { validIronConnection, invalidTypeConnection } = scenarios;
        const connectionState = createConnectionState(
          splergerConnections.untypedSplerger.id,
          'output-0',
          HandleType.Source,
          null
        );
        expect(isValidConnection(validIronConnection.target, connectionState)).toBe(true);
        expect(isValidConnection(invalidTypeConnection.target, connectionState)).toBe(true);
      });
    });
  });

  describe('Dynamic Node Connections (Sink)', () => {
    const { sinkConnections } = scenarios;

    describe('Typed Sink', () => {
      it('should accept matching input connections', () => {
        expect(isValidConnection(sinkConnections.typedSink, sinkConnections.ironConnection)).toBe(true);
      });

      it('should reject mismatched input connections', () => {
        expect(isValidConnection(sinkConnections.typedSink, sinkConnections.copperConnection)).toBe(false);
      });
    });

    describe('Untyped Sink', () => {
      it('should accept any input connection', () => {
        expect(isValidConnection(sinkConnections.untypedSink, sinkConnections.ironConnection)).toBe(true);
        expect(isValidConnection(sinkConnections.untypedSink, sinkConnections.copperConnection)).toBe(true);
      });
    });
  });

  describe('Invalid Connections', () => {
    const { validIronConnection } = scenarios;
    const { invalidConnectionState } = createHighlightingScenarios();

    it('should prevent self-connections', () => {
      expect(isValidConnection(validIronConnection.source, validIronConnection.connectionState)).toBe(false);
    });

    it('should prevent connections with null source item', () => {
      expect(isValidConnection(validIronConnection.source, invalidConnectionState)).toBe(false);
    });
  });
});

describe('Edge operations', () => {
  it('should delete edge when delete option is selected', () => {
    const mockSetEdges = jest.fn();
    const initialEdge = createEdge('edge-1', 'recipe-1', 'recipe-2');

    mockUseStore.mockReturnValue(createMockStore(
      [],
      [initialEdge],
      jest.fn(),
      mockSetEdges
    ));

    const { container } = render(
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    );

    // Simulate edge deletion
    const onEdgesChange = mockSetEdges.mock.calls[0]?.[0];
    if (onEdgesChange) {
      onEdgesChange([{ id: 'edge-1', type: 'remove' }]);
      expect(mockSetEdges).toHaveBeenCalledWith([]);
    }
  });
});

describe('Node operations', () => {
  it('should delete node and connected edges when delete option is selected', () => {
    const mockSetNodes = jest.fn();
    const mockSetEdges = jest.fn();
    
    const ironRecipe = createRecipe('Iron Recipe', [], ['iron']);
    const initialNode = createRecipeNode('recipe-1', ironRecipe);
    const initialEdge = createEdge('edge-1', 'recipe-1', 'recipe-2');

    mockUseStore.mockReturnValue(createMockStore(
      [initialNode],
      [initialEdge],
      mockSetNodes,
      mockSetEdges
    ));

    const { container } = render(
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    );

    // Simulate node deletion
    const onNodesChange = mockSetNodes.mock.calls[0]?.[0];
    if (onNodesChange) {
      onNodesChange([{ id: 'recipe-1', type: 'remove' }]);
      expect(mockSetNodes).toHaveBeenCalledWith([]);
      expect(mockSetEdges).toHaveBeenCalledWith([]);
    }
  });

  it('should create node at right-click position', () => {
    const mockSetNodes = jest.fn();
    const mousePosition = { x: 100, y: 200 };

    mockUseStore.mockReturnValue(createMockStore(
      [],
      [],
      mockSetNodes,
      jest.fn()
    ));

    const { container } = render(
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    );

    // Simulate right-click and node creation
    const flowContainer = container.querySelector('[data-testid="mock-react-flow"]');
    if (flowContainer) {
      fireEvent.contextMenu(flowContainer, {
        clientX: mousePosition.x,
        clientY: mousePosition.y,
      });

      // Simulate node creation
      const onNodesChange = mockSetNodes.mock.calls[0]?.[0];
      if (onNodesChange) {
        onNodesChange([{
          type: 'add',
          item: {
            id: expect.any(String),
            type: 'recipe',
            position: mousePosition,
            data: expect.any(Object),
          },
        }]);

        expect(mockSetNodes).toHaveBeenCalledWith(expect.arrayContaining([
          expect.objectContaining({
            position: mousePosition,
          }),
        ]));
      }
    }
  });
});

describe('Type changes', () => {
  it('should update splerger type when connected to typed output', () => {
    const mockSetNodes = jest.fn();
    const splergerNode = createDynamicNode('splerger-1', 'splerger');

    mockUseStore.mockReturnValue(createMockStore(
      [splergerNode],
      [],
      mockSetNodes,
      jest.fn()
    ));

    const { container } = render(
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    );

    // Simulate connection to typed output
    const onConnect = mockSetNodes.mock.calls[0]?.[0];
    if (onConnect) {
      onConnect({
        source: 'recipe-1',
        target: 'splerger-1',
        sourceHandle: 'output-0',
        targetHandle: 'input',
      });

      expect(mockSetNodes).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          id: 'splerger-1',
          data: expect.objectContaining({
            itemType: expect.any(String),
          }),
        }),
      ]));
    }
  });
});

describe('Handle highlighting', () => {
  it('should highlight valid input handles when dragging from output', () => {
    const mockSetNodes = jest.fn();
    
    const ironRecipe = createRecipe('Iron Recipe', [], ['iron']);
    const ironConsumer = createRecipe('Iron Consumer', ['iron'], []);
    
    const connectionState = createConnectionState('recipe-1', 'output-0', HandleType.Source, 'iron');
    
    const sourceNode = createRecipeNode('recipe-1', ironRecipe);
    const targetNode = withConnectionState(
      createRecipeNode('recipe-2', ironConsumer),
      connectionState,
      true
    );

    mockUseStore.mockReturnValue({
      nodes: [sourceNode, targetNode],
      edges: [],
      setNodes: mockSetNodes,
      setEdges: jest.fn(),
    });

    const { getAllByTestId } = render(
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    );

    // Verify that the target node's input handle has the highlight class
    const targetInputs = getAllByTestId('recipe-input-recipe-2-0');
    expect(targetInputs[0]).toHaveClass('highlight');
  });

  it('should not highlight invalid input handles when dragging from output', () => {
    const mockSetNodes = jest.fn();
    
    const ironRecipe = createRecipe('Iron Recipe', [], ['iron']);
    const copperConsumer = createRecipe('Copper Consumer', ['copper'], []);
    
    const connectionState = createConnectionState('recipe-1', 'output-0', HandleType.Source, 'iron');
    
    const sourceNode = createRecipeNode('recipe-1', ironRecipe);
    const targetNode = withConnectionState(
      createRecipeNode('recipe-2', copperConsumer),
      connectionState,
      false
    );

    mockUseStore.mockReturnValue({
      nodes: [sourceNode, targetNode],
      edges: [],
      setNodes: mockSetNodes,
      setEdges: jest.fn(),
    });

    const { getAllByTestId } = render(
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    );

    // Verify that the target node's input handle does not have the highlight class
    const targetInputs = getAllByTestId('recipe-input-recipe-2-0');
    expect(targetInputs[0]).not.toHaveClass('highlight');
  });

  it('should highlight valid output handles when dragging to input', () => {
    const mockSetNodes = jest.fn();
    
    const ironRecipe = createRecipe('Iron Recipe', [], ['iron']);
    const ironConsumer = createRecipe('Iron Consumer', ['iron'], []);
    
    const connectionState = createConnectionState('recipe-2', 'input-0', HandleType.Target, 'iron');
    
    const sourceNode = withConnectionState(
      createRecipeNode('recipe-1', ironRecipe),
      connectionState,
      true
    );
    const targetNode = createRecipeNode('recipe-2', ironConsumer);

    mockUseStore.mockReturnValue({
      nodes: [sourceNode, targetNode],
      edges: [],
      setNodes: mockSetNodes,
      setEdges: jest.fn(),
    });

    const { getAllByTestId } = render(
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    );

    // Verify that the source node's output handle has the highlight class
    const sourceOutputs = getAllByTestId('recipe-output-recipe-1-0');
    expect(sourceOutputs[0]).toHaveClass('highlight');
  });
});

describe('Flow Editor', () => {
  const { recipe1, recipe2, splerger1 } = createTestNodes();
  const { storeWithNodes } = createMockStoreScenarios();

  beforeEach(() => {
    mockUseStore.mockReturnValue(storeWithNodes);
  });

  it('should highlight valid input handles when dragging from an output', () => {
    render(<ReactFlowProvider><Flow /></ReactFlowProvider>);

    // Simulate starting a connection from Recipe 1's output
    const connectionState = createConnectionState('recipe-1', 'output-0', HandleType.Source, 'iron-plate');
    const nodesWithConnection = createNodesWithConnection(storeWithNodes.nodes, connectionState, ['recipe-2', 'splerger-1']);

    mockUseStore.mockReturnValue({ ...storeWithNodes, nodes: nodesWithConnection });

    // Re-render with updated state
    const { getAllByTestId } = render(<ReactFlowProvider><Flow /></ReactFlowProvider>);

    // Verify highlighting
    expect(getAllByTestId('recipe-input-recipe-2-0')[0]).toHaveClass('highlight');
    expect(getAllByTestId('splerger-input-splerger-1-0')[0]).toHaveClass('highlight');
  });

  it('should highlight valid output handles when dragging from an input', () => {
    render(<ReactFlowProvider><Flow /></ReactFlowProvider>);

    // Simulate starting a connection from Recipe 2's input
    const connectionState = createConnectionState('recipe-2', 'input-0', HandleType.Target, 'iron-plate');
    const nodesWithConnection = createNodesWithConnection(storeWithNodes.nodes, connectionState, ['recipe-1', 'splerger-1']);

    mockUseStore.mockReturnValue({ ...storeWithNodes, nodes: nodesWithConnection });

    // Re-render with updated state
    const { getAllByTestId } = render(<ReactFlowProvider><Flow /></ReactFlowProvider>);

    // Verify highlighting
    expect(getAllByTestId('recipe-output-recipe-1-0')[0]).toHaveClass('highlight');
    expect(getAllByTestId('splerger-output-splerger-1-0')[0]).toHaveClass('highlight');
  });

  it('should not highlight invalid connections', () => {
    render(<ReactFlowProvider><Flow /></ReactFlowProvider>);

    // Simulate starting a connection from Recipe 2's output (iron-gear)
    const connectionState = createConnectionState('recipe-2', 'output-0', HandleType.Source, 'iron-gear');
    const nodesWithConnection = createNodesWithConnection(storeWithNodes.nodes, connectionState, []);

    mockUseStore.mockReturnValue({ ...storeWithNodes, nodes: nodesWithConnection });

    // Re-render with updated state
    const { getAllByTestId } = render(<ReactFlowProvider><Flow /></ReactFlowProvider>);

    // Verify no highlighting
    expect(getAllByTestId('recipe-input-recipe-1-0')[0]).not.toHaveClass('highlight');
  });
}); 
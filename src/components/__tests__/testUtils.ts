import { FlowNode, Recipe, HandleType, ConnectionState, FlowEdge } from '../../types';
import { FlowState } from '../../store/types';
import { isRecipeNode, isDynamicNode } from '../../types';

export const createRecipe = (name: string, inputs: string[], outputs: string[]): Recipe => ({
  name,
  inputs: inputs.map(name => ({ name, quantity: 1 })),
  outputs: outputs.map(name => ({ name, quantity: 1 })),
});

export const createRecipeNode = (
  id: string,
  recipe: Recipe,
  position = { x: 0, y: 0 },
  connectionState?: ConnectionState
): FlowNode => ({
  id,
  type: 'recipe',
  position,
  data: {
    recipe,
    isConnecting: !!connectionState,
    isValidConnection: false,
    connectionState,
  },
});

export const createDynamicNode = (
  id: string,
  type: 'splerger' | 'sink',
  itemType: string | null = null,
  position = { x: 0, y: 0 },
  connectionState?: ConnectionState
): FlowNode => ({
  id,
  type,
  position,
  data: {
    type,
    itemType,
    label: `${itemType || 'Untyped'} ${type}`,
    isConnecting: !!connectionState,
    isValidConnection: false,
    connectionState,
  },
});

export const createConnectionState = (
  nodeId: string,
  handleId: string,
  handleType: HandleType,
  sourceItemName: string | null
): ConnectionState => ({
  nodeId,
  handleId,
  handleType,
  sourceItemName,
});

export const withConnectionState = (
  node: FlowNode,
  connectionState: ConnectionState,
  isValid: boolean
): FlowNode => ({
  ...node,
  data: {
    ...node.data,
    isConnecting: true,
    isValidConnection: isValid,
    connectionState: {
      ...connectionState,
      nodeId: node.id,
      handleId: connectionState.handleType === HandleType.Source ? 
        (isRecipeNode(node.data) ? `output-0` : `${(node.data as any).type}-output-0`) :
        (isRecipeNode(node.data) ? `input-0` : `${(node.data as any).type}-input-0`),
    },
  },
});

export const createEdge = (
  id: string,
  source: string,
  target: string,
  sourceHandle = 'output-0',
  targetHandle = 'input-0'
): FlowEdge => ({
  id,
  source,
  target,
  sourceHandle,
  targetHandle,
  type: 'default',
});

export const createMockStore = (
  nodes: FlowNode[] = [],
  edges: FlowEdge[] = [],
  setNodes = jest.fn(),
  setEdges = jest.fn()
): FlowState => ({
  nodes,
  edges,
  setNodes,
  setEdges,
});

export const createTestNodes = () => {
  const ironRecipe = createRecipe('Iron Recipe', ['iron-ore'], ['iron-plate']);
  const ironConsumer = createRecipe('Iron Consumer', ['iron-plate'], ['iron-gear']);
  const copperRecipe = createRecipe('Copper Recipe', ['copper-ore'], ['copper-plate']);

  return {
    recipe1: createRecipeNode('recipe-1', ironRecipe, { x: 0, y: 0 }),
    recipe2: createRecipeNode('recipe-2', ironConsumer, { x: 200, y: 0 }),
    recipe3: createRecipeNode('recipe-3', copperRecipe, { x: 400, y: 0 }),
    splerger1: createDynamicNode('splerger-1', 'splerger', null, { x: 600, y: 0 }),
    splerger2: createDynamicNode('splerger-2', 'splerger', 'iron-plate', { x: 800, y: 0 }),
    sink1: createDynamicNode('sink-1', 'sink', null, { x: 1000, y: 0 }),
  };
};

// Common test recipes
export const createCommonRecipes = () => ({
  ironRecipe: createRecipe('Iron Recipe', ['iron-ore'], ['iron-plate']),
  ironConsumer: createRecipe('Iron Consumer', ['iron-plate'], ['iron-gear']),
  copperRecipe: createRecipe('Copper Recipe', ['copper-ore'], ['copper-plate']),
  simpleIronRecipe: createRecipe('Iron Recipe', [], ['iron']),
  simpleIronConsumer: createRecipe('Iron Consumer', ['iron'], []),
  simpleCopperRecipe: createRecipe('Copper Recipe', [], ['copper']),
  simpleCopperConsumer: createRecipe('Copper Consumer', ['copper'], []),
});

// Common test nodes with connection states
export const createTestNodesWithConnections = () => {
  const nodes = createTestNodes();
  const connectionState = createConnectionState('recipe-1', 'output-0', HandleType.Source, 'iron-plate');
  
  return {
    ...nodes,
    connectedRecipe1: withConnectionState(nodes.recipe1, connectionState, true),
    connectedRecipe2: withConnectionState(nodes.recipe2, connectionState, true),
    connectedSplerger: withConnectionState(nodes.splerger1, connectionState, true),
  };
};

// Common test scenarios
export const createTestScenarios = () => {
  const recipes = createCommonRecipes();
  
  return {
    validIronConnection: {
      source: createRecipeNode('recipe-1', recipes.simpleIronRecipe),
      target: createRecipeNode('recipe-2', recipes.simpleIronConsumer),
      connectionState: createConnectionState('recipe-1', 'output-0', HandleType.Source, 'iron'),
    },
    invalidTypeConnection: {
      source: createRecipeNode('recipe-1', recipes.simpleIronRecipe),
      target: createRecipeNode('recipe-2', recipes.simpleCopperConsumer),
      connectionState: createConnectionState('recipe-1', 'output-0', HandleType.Source, 'iron'),
    },
    splergerConnections: {
      typedSplerger: createDynamicNode('splerger-1', 'splerger', 'iron'),
      untypedSplerger: createDynamicNode('splerger-2', 'splerger'),
      ironConnection: createConnectionState('recipe-1', 'output-0', HandleType.Source, 'iron'),
      copperConnection: createConnectionState('recipe-3', 'output-0', HandleType.Source, 'copper'),
    },
    sinkConnections: {
      typedSink: createDynamicNode('sink-1', 'sink', 'iron'),
      untypedSink: createDynamicNode('sink-2', 'sink'),
      ironConnection: createConnectionState('recipe-1', 'output-0', HandleType.Source, 'iron'),
      copperConnection: createConnectionState('recipe-3', 'output-0', HandleType.Source, 'copper'),
    },
  };
};

// Mock store scenarios
export const createMockStoreScenarios = () => {
  const nodes = createTestNodes();
  const edges = [createEdge('edge-1', 'recipe-1', 'recipe-2')];
  const setNodes = jest.fn();
  const setEdges = jest.fn();

  return {
    emptyStore: createMockStore([], [], setNodes, setEdges),
    storeWithNodes: createMockStore(Object.values(nodes), [], setNodes, setEdges),
    storeWithNodesAndEdges: createMockStore(Object.values(nodes), edges, setNodes, setEdges),
    storeWithEdgesOnly: createMockStore([], edges, setNodes, setEdges),
  };
};

// Highlighting test scenarios
export const createHighlightingScenarios = () => {
  const recipes = createCommonRecipes();
  
  const validHighlighting = {
    source: createRecipeNode('recipe-1', recipes.simpleIronRecipe),
    target: withConnectionState(
      createRecipeNode('recipe-2', recipes.simpleIronConsumer),
      createConnectionState('recipe-1', 'output-0', HandleType.Source, 'iron'),
      true
    ),
  };

  const invalidHighlighting = {
    source: createRecipeNode('recipe-1', recipes.simpleIronRecipe),
    target: withConnectionState(
      createRecipeNode('recipe-2', recipes.simpleCopperConsumer),
      createConnectionState('recipe-1', 'output-0', HandleType.Source, 'iron'),
      false
    ),
  };

  return {
    validHighlighting,
    invalidHighlighting,
    validConnectionState: createConnectionState('recipe-1', 'output-0', HandleType.Source, 'iron'),
    invalidConnectionState: createConnectionState('recipe-1', 'output-0', HandleType.Source, null),
  };
};

// Helper for creating nodes with connection states
export const createNodesWithConnection = (
  nodes: FlowNode[],
  connectionState: ConnectionState,
  validNodeIds: string[]
) => nodes.map(node => ({
  ...node,
  data: {
    ...node.data,
    isConnecting: true,
    isValidConnection: validNodeIds.includes(node.id),
    connectionState: {
      ...connectionState,
      nodeId: node.id,
      handleId: connectionState.handleType === HandleType.Source ? 
        (isRecipeNode(node.data) ? `output-0` : `${(node.data as any).type}-output-0`) :
        (isRecipeNode(node.data) ? `input-0` : `${(node.data as any).type}-input-0`),
      handleType: connectionState.handleType === HandleType.Source ? HandleType.Target : HandleType.Source,
    },
  },
})); 
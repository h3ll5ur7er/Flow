import { create } from 'zustand';
import { Node, Edge } from 'reactflow';

export interface GameMetadata {
  name: string;
  version: string;
  machines: Machine[];
  items: Item[];
  recipes: Recipe[];
}

export interface Machine {
  name: string;
  inputs: number;
  outputs: number;
}

export interface Item {
  name: string;
  stackSize: number;
}

export interface RecipeItem {
  name: string;
  quantity: number;
}

export interface Recipe {
  name: string;
  inputs: RecipeItem[];
  outputs: RecipeItem[];
  machine: string;
}

interface FlowState {
  nodes: Node[];
  edges: Edge[];
  flowName: string;
  gameMetadata: GameMetadata;
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
  setFlowName: (name: string) => void;
  setGameMetadata: (metadata: GameMetadata) => void;
}

// Load game metadata from localStorage
const loadGameMetadata = (): GameMetadata => {
  try {
    const persistedMetadata = localStorage.getItem('flowGameMetadata');
    if (persistedMetadata) {
      return JSON.parse(persistedMetadata);
    }
  } catch (err) {
    console.error('Failed to load game metadata:', err);
  }
  return {
    name: 'New Game',
    version: '1.0.0',
    machines: [],
    items: [],
    recipes: [],
  };
};

// Load flow graph state from localStorage
const loadFlowGraph = () => {
  try {
    const persistedGraph = localStorage.getItem('flowGraphState');
    if (persistedGraph) {
      return JSON.parse(persistedGraph);
    }
  } catch (err) {
    console.error('Failed to load flow graph:', err);
  }
  return {
    nodes: [],
    edges: [],
    flowName: 'New Flow',
  };
};

// Save game metadata to localStorage
const persistGameMetadata = (metadata: GameMetadata) => {
  try {
    localStorage.setItem('flowGameMetadata', JSON.stringify(metadata));
  } catch (err) {
    console.error('Failed to persist game metadata:', err);
  }
};

// Save flow graph to localStorage
const persistFlowGraph = (nodes: Node[], edges: Edge[], flowName: string) => {
  try {
    const persistedGraph = {
      nodes,
      edges,
      flowName,
    };
    localStorage.setItem('flowGraphState', JSON.stringify(persistedGraph));
  } catch (err) {
    console.error('Failed to persist flow graph:', err);
  }
};

const initialMetadata = loadGameMetadata();
const initialGraph = loadFlowGraph();

export const useStore = create<FlowState>((set) => ({
  nodes: initialGraph.nodes,
  edges: initialGraph.edges,
  flowName: initialGraph.flowName,
  gameMetadata: initialMetadata,
  setNodes: (nodes) => set((state) => {
    const newNodes = typeof nodes === 'function' ? nodes(state.nodes) : nodes;
    persistFlowGraph(newNodes, state.edges, state.flowName);
    return { nodes: newNodes };
  }),
  setEdges: (edges) => set((state) => {
    const newEdges = typeof edges === 'function' ? edges(state.edges) : edges;
    persistFlowGraph(state.nodes, newEdges, state.flowName);
    return { edges: newEdges };
  }),
  setFlowName: (flowName) => set((state) => {
    persistFlowGraph(state.nodes, state.edges, flowName);
    return { flowName };
  }),
  setGameMetadata: (metadata) => set(() => {
    persistGameMetadata(metadata);
    return { gameMetadata: metadata };
  }),
})); 
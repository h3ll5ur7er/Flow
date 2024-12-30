import { create } from 'zustand';
import { Node, Edge } from 'reactflow';

interface GameMetadata {
  name: string;
  machines: Machine[];
  items: Item[];
  recipes: Recipe[];
}

interface Machine {
  name: string;
  inputs: number;
  outputs: number;
}

interface Item {
  name: string;
  stackSize: number;
}

interface RecipeItem {
  name: string;
  quantity: number;
}

interface Recipe {
  name: string;
  inputs: RecipeItem[];
  outputs: RecipeItem[];
  machine: string;
}

interface FlowState {
  nodes: Node[];
  edges: Edge[];
  gameMetadata: GameMetadata | null;
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
  setGameMetadata: (metadata: GameMetadata) => void;
}

// Load game metadata from localStorage
const loadGameMetadata = () => {
  try {
    const persistedMetadata = localStorage.getItem('flowGameMetadata');
    if (persistedMetadata) {
      return JSON.parse(persistedMetadata);
    }
  } catch (err) {
    console.error('Failed to load game metadata:', err);
  }
  return null;
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
  };
};

// Save game metadata to localStorage
const persistGameMetadata = (metadata: GameMetadata | null) => {
  try {
    if (metadata) {
      localStorage.setItem('flowGameMetadata', JSON.stringify(metadata));
    } else {
      localStorage.removeItem('flowGameMetadata');
    }
  } catch (err) {
    console.error('Failed to persist game metadata:', err);
  }
};

// Save flow graph to localStorage
const persistFlowGraph = (nodes: Node[], edges: Edge[]) => {
  try {
    const persistedGraph = {
      nodes,
      edges,
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
  gameMetadata: initialMetadata,
  setNodes: (nodes) => set((state) => {
    const newNodes = typeof nodes === 'function' ? nodes(state.nodes) : nodes;
    persistFlowGraph(newNodes, state.edges);
    return { nodes: newNodes };
  }),
  setEdges: (edges) => set((state) => {
    const newEdges = typeof edges === 'function' ? edges(state.edges) : edges;
    persistFlowGraph(state.nodes, newEdges);
    return { edges: newEdges };
  }),
  setGameMetadata: (metadata) => set((state) => {
    persistGameMetadata(metadata);
    return { gameMetadata: metadata };
  }),
})); 
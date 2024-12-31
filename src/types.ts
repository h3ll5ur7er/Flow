import { Node, Edge } from 'reactflow';

export enum HandleType {
  Source = 'source',
  Target = 'target'
}

export interface RecipeItem {
  name: string;
  quantity: number;
}

export interface Recipe {
  name: string;
  machine: string;
  inputs: RecipeItem[];
  outputs: RecipeItem[];
}

export interface ConnectionState {
  nodeId: string | null;
  handleId: string | null;
  handleType: HandleType | null;
  sourceItemName: string | null;
}

export interface RecipeNodeData {
  label: string;
  recipe: Recipe | null;
  isConnecting: boolean;
  connectionState: ConnectionState;
}

export interface SubgraphNodeData {
  label: string;
  flowId: string;
}

export type FlowNode = Node<RecipeNodeData | SubgraphNodeData>;
export type FlowEdge = Edge; 
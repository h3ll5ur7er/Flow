import { Node, Edge } from 'reactflow';

export enum HandleType {
  Source = 'source',
  Target = 'target',
}

export interface ConnectionState {
  nodeId: string | null;
  handleId: string | null;
  handleType: HandleType | null;
  sourceItemName: string | null;
}

export interface Recipe {
  name: string;
  inputs: Array<{
    name: string;
    quantity: number;
  }>;
  outputs: Array<{
    name: string;
    quantity: number;
  }>;
}

export interface RecipeNodeData {
  recipe: Recipe | null;
  isConnecting?: boolean;
  isValidConnection?: boolean;
  connectionState?: ConnectionState;
}

export interface DynamicNodeData {
  type: 'splerger' | 'sink';
  itemType: string | null;
  label?: string;
  isConnecting?: boolean;
  isValidConnection?: boolean;
  connectionState?: ConnectionState;
}

export type FlowNodeData = RecipeNodeData | DynamicNodeData;

export type FlowNode = Node<FlowNodeData>;
export type FlowEdge = Edge;

export const isDynamicNode = (data: FlowNodeData): data is DynamicNodeData => 
  'type' in data && (data.type === 'splerger' || data.type === 'sink');

export const isRecipeNode = (data: FlowNodeData): data is RecipeNodeData => 
  'recipe' in data; 
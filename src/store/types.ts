import { Node, Edge } from 'reactflow';
import { FlowNode, FlowEdge } from '../types';

export interface FlowState {
  nodes: FlowNode[];
  edges: FlowEdge[];
  setNodes: (nodes: FlowNode[]) => void;
  setEdges: (edges: FlowEdge[]) => void;
} 
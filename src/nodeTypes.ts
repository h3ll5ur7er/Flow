import { RecipeNode } from './components/nodes/RecipeNode';
import { SubgraphNode } from './components/nodes/SubgraphNode';
import { NodeTypes } from 'reactflow';

export const NODE_TYPES = {
  recipe: RecipeNode,
  subgraph: SubgraphNode,
} as const satisfies NodeTypes; 
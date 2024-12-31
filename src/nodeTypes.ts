import { RecipeNode } from './components/nodes/RecipeNode';
import { SubgraphNode } from './components/nodes/SubgraphNode';
import { DynamicNode } from './components/nodes/DynamicNode';
import { NodeTypes } from 'reactflow';

export const NODE_TYPES = {
  recipe: RecipeNode,
  subgraph: SubgraphNode,
  splerger: DynamicNode,
  sink: DynamicNode,
} as const satisfies NodeTypes; 
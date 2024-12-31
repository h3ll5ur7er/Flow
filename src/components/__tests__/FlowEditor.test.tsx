import { describe, it, expect } from '@jest/globals';
import { Node as FlowNode, Edge as FlowEdge } from 'reactflow';
import { FlowNodeData, HandleType } from '../../types';
import { getValidHandles } from '../FlowEditor';

describe('FlowEditor', () => {
  const createNode = (id: string, type: string, data: any): FlowNode<FlowNodeData> => ({
    id,
    type,
    data,
    position: { x: 0, y: 0 },
  });

  const createEdge = (source: string, target: string): FlowEdge => ({
    id: `${source}-${target}`,
    source,
    target,
  });

  describe('getValidHandles', () => {
    it('should return valid handles for recipe nodes', () => {
      const sourceNode = createNode('source', 'recipe', {
        recipe: {
          outputs: [{ name: 'iron' }],
        },
      });
      const targetNode = createNode('target', 'recipe', {
        recipe: {
          inputs: [{ name: 'iron' }],
        },
      });

      const validHandles = getValidHandles(sourceNode, targetNode, HandleType.Source);
      expect(validHandles).toContain('iron');
    });
  });
}); 
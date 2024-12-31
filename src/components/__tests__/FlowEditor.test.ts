import { describe, it, expect } from '@jest/globals';
import { isValidConnection } from '../FlowEditor';
import { FlowNode, HandleType, ConnectionState } from '../../types';

describe('FlowEditor connection validation', () => {
  // Test data
  const recipeNode = {
    id: '1',
    type: 'recipe',
    data: {
      recipe: {
        inputs: [{ name: 'iron' }],
        outputs: [{ name: 'iron' }],
      },
    },
  } as FlowNode;

  const splergerNode = {
    id: '2',
    type: 'splerger',
    data: {
      type: 'splerger',
      itemType: 'iron',
    },
  } as FlowNode;

  const untypedSplerger = {
    id: '3',
    type: 'splerger',
    data: {
      type: 'splerger',
      itemType: null,
    },
  } as FlowNode;

  describe('isValidConnection', () => {
    it('should validate connections between recipe nodes', () => {
      const connectionState: ConnectionState = {
        nodeId: recipeNode.id,
        handleId: 'output-0',
        handleType: HandleType.Source,
        sourceItemName: 'iron',
      };

      const isValid = isValidConnection(recipeNode, connectionState);
      expect(isValid).toBe(true);
    });

    it('should validate connections to dynamic nodes', () => {
      const connectionState: ConnectionState = {
        nodeId: recipeNode.id,
        handleId: 'output-0',
        handleType: HandleType.Source,
        sourceItemName: 'iron',
      };

      const isValid = isValidConnection(untypedSplerger, connectionState);
      expect(isValid).toBe(true);
    });
  });
}); 
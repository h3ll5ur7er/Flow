import { ConnectionState, FlowNode } from '../types';

export function isValidConnection(node: FlowNode, connectionState: ConnectionState): boolean {
  if (connectionState.nodeId === null || connectionState.nodeId === node.id) {
    return false;
  }

  const isDraggingFromSource = connectionState.handleType === 'source';

  // For recipe nodes
  if ('recipe' in node.data) {
    if (!node.data.recipe) return false;
    
    // When dragging from a source handle (output), highlight valid input handles
    if (isDraggingFromSource) {
      return node.data.recipe.inputs.some((input: { name: string }) => 
        input.name === connectionState.sourceItemName || connectionState.sourceItemName === '*'
      );
    }
    
    // When dragging from a target handle (input), highlight valid output handles
    return node.data.recipe.outputs.some((output: { name: string }) => 
      output.name === connectionState.sourceItemName || connectionState.sourceItemName === '*'
    );
  }

  // For dynamic nodes (splerger/sink)
  if ('type' in node.data) {
    // Skip the node we're dragging from
    if (node.id === connectionState.nodeId) {
      return false;
    }

    // If this node has no type yet, it can accept any connection
    if (!node.data.itemType) {
      return true;
    }

    // If dragging from a source handle (output), highlight valid input handles
    if (isDraggingFromSource) {
      return node.data.itemType === connectionState.sourceItemName;
    }
    
    // If dragging from a target handle (input), highlight valid output handles
    return node.data.itemType === connectionState.sourceItemName;
  }

  return false;
} 
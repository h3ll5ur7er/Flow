import { ConnectionState, FlowNode } from '../types';

export function isValidConnection(node: FlowNode, connectionState: ConnectionState): boolean {
  console.log('Validating connection:', {
    node,
    connectionState,
    isDraggingFromSource: connectionState.handleType === 'source'
  });

  // Prevent self-connections
  if (connectionState.nodeId === null || connectionState.nodeId === node.id) {
    console.log('Rejecting self-connection');
    return false;
  }

  const isDraggingFromSource = connectionState.handleType === 'source';

  // For recipe nodes
  if ('recipe' in node.data) {
    console.log('Validating recipe node');
    if (!node.data.recipe) {
      console.log('No recipe data');
      return false;
    }

    // Allow connections from untyped nodes
    if (connectionState.sourceItemName === null) {
      console.log('Allowing untyped connection');
      return true;
    }
    
    // When dragging from a source handle (output), check target's inputs
    if (isDraggingFromSource) {
      console.log('Checking target inputs:', node.data.recipe.inputs);
      // We're checking if this node's inputs can accept the source item
      const result = node.data.recipe.inputs.some(input => 
        input.name === connectionState.sourceItemName
      );
      console.log('Input validation result:', result);
      return result;
    } else {
      console.log('Checking target outputs:', node.data.recipe.outputs);
      // When dragging from a target handle (input), check target's outputs
      const result = node.data.recipe.outputs.some(output => 
        output.name === connectionState.sourceItemName
      );
      console.log('Output validation result:', result);
      return result;
    }
  }

  // For dynamic nodes (splerger/sink)
  if ('type' in node.data) {
    console.log('Validating dynamic node');
    // Skip the node we're dragging from
    if (node.id === connectionState.nodeId) {
      console.log('Rejecting self-connection');
      return false;
    }

    // If this node has no type yet, it can accept any connection
    if (!node.data.itemType) {
      console.log('Allowing untyped dynamic node');
      return true;
    }

    // If the source item is null (from an untyped node), allow the connection
    if (connectionState.sourceItemName === null) {
      console.log('Allowing null source item');
      return true;
    }

    // If dragging from a source handle (output), validate against item type
    if (isDraggingFromSource) {
      console.log('Checking dynamic node input type');
      return node.data.itemType === connectionState.sourceItemName;
    }
    
    // If dragging from a target handle (input), validate against item type
    console.log('Checking dynamic node output type');
    return node.data.itemType === connectionState.sourceItemName;
  }

  console.log('No validation rules matched');
  return false;
} 
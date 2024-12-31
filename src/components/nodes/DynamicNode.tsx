import { memo } from 'react';
import { Handle, Position, NodeProps, Connection } from 'reactflow';
import { Box, Typography } from '@mui/material';
import { DynamicNodeData, HandleType } from '../../types';

const getHandleStyle = (isConnecting: boolean, isValidConnection: boolean) => ({
  width: 16,
  height: 16,
  background: isConnecting
    ? (isValidConnection ? '#4caf50' : '#f44336')
    : '#555',
  borderRadius: '50%',
  border: '2px solid #333',
  left: -8,  // Offset by half width to position center at edge
});

const getRightHandleStyle = (isConnecting: boolean, isValidConnection: boolean) => ({
  ...getHandleStyle(isConnecting, isValidConnection),
  left: 'auto',
  right: -8,  // Offset by half width to position center at edge
});

export const DynamicNode = memo(({ id, data }: NodeProps<DynamicNodeData>) => {
  console.log('DynamicNode render:', {
    id,
    type: data.type,
    itemType: data.itemType,
    isConnecting: data.isConnecting,
    connectionState: data.connectionState,
    handleId: data.connectionState?.handleId,
    handleType: data.connectionState?.handleType,
    sourceItemName: data.connectionState?.sourceItemName,
    nodeId: data.connectionState?.nodeId,
  });

  const isValidInput = !!data.isConnecting && 
    data.connectionState?.handleType === HandleType.Source &&
    data.connectionState?.nodeId !== id &&
    (data.connectionState?.sourceItemName === '*' || !data.itemType || data.itemType === data.connectionState?.sourceItemName);

  const isValidOutput = !!data.isConnecting && 
    data.connectionState?.handleType === HandleType.Target &&
    data.connectionState?.nodeId !== id &&
    (data.connectionState?.sourceItemName === '*' || !data.itemType || data.itemType === data.connectionState?.sourceItemName);

  console.log('DynamicNode validation:', {
    id,
    isValidInput,
    isValidOutput,
    conditions: {
      isConnecting: !!data.isConnecting,
      handleType: data.connectionState?.handleType,
      notSelf: data.connectionState?.nodeId !== id,
      itemTypeCheck: data.connectionState?.sourceItemName === '*' || !data.itemType || data.itemType === data.connectionState?.sourceItemName
    }
  });

  const validateConnection = (connection: Connection) => {
    console.log('validateConnection called:', {
      connection,
      nodeId: id,
      isSource: connection.source === id,
      isTarget: connection.target === id,
      handleId: connection.sourceHandle || connection.targetHandle,
      handleType: data.connectionState?.handleType,
      isValidInput,
      isValidOutput,
      itemType: data.itemType
    });

    // If we're the source node starting the connection
    if (id === data.connectionState?.nodeId) {
      // If we're untyped, allow connection to any target
      if (!data.itemType) {
        return true;
      }
      // If we're typed, let the target node decide if the connection is valid
      return true;
    }
    
    // If we're the target node
    if (data.connectionState?.handleType === HandleType.Source) {
      // If we're untyped or the source is untyped, allow the connection
      if (!data.itemType || data.connectionState?.sourceItemName === '*') {
        return true;
      }
      // Otherwise check if types match
      return data.itemType === data.connectionState?.sourceItemName;
    } else {
      // Similar logic for when we're checking output handles
      if (!data.itemType || data.connectionState?.sourceItemName === '*') {
        return true;
      }
      return data.itemType === data.connectionState?.sourceItemName;
    }
  };

  return (
    <Box sx={{
      background: '#333',
      color: '#fff',
      border: 'none',
      borderRadius: 1,
      p: 1,
      minWidth: 120,
      fontSize: '0.8rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: 60,
      position: 'relative',
    }}>
      {data.type === 'splerger' && (
        <Handle
          type="target"
          position={Position.Left}
          style={getHandleStyle(!!data.isConnecting, isValidInput)}
          id={`input-0`}
          className={isValidInput ? 'highlight' : ''}
          data-testid={`${data.type}-input-${id}-0`}
          isConnectable={true}
          isValidConnection={validateConnection}
        />
      )}
      <Typography variant="caption" align="center">
        {data.type === 'splerger' ? 'Splitter/Merger' : 'Sink'}
        {data.itemType && (
          <Typography variant="caption" display="block" sx={{ opacity: 0.7, fontSize: '0.7rem' }}>
            {data.itemType}
          </Typography>
        )}
      </Typography>
      {data.type === 'splerger' && (
        <Handle
          type="source"
          position={Position.Right}
          style={getRightHandleStyle(!!data.isConnecting, isValidOutput)}
          id={`output-0`}
          className={isValidOutput ? 'highlight' : ''}
          data-testid={`${data.type}-output-${id}-0`}
          isConnectable={true}
          isValidConnection={validateConnection}
        />
      )}
      {data.type === 'sink' && (
        <Handle
          type="target"
          position={Position.Left}
          style={getHandleStyle(!!data.isConnecting, isValidInput)}
          id={`input-0`}
          className={isValidInput ? 'highlight' : ''}
          data-testid={`${data.type}-input-${id}-0`}
          isConnectable={true}
          isValidConnection={validateConnection}
        />
      )}
    </Box>
  );
}); 
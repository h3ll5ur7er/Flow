import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Box, Typography } from '@mui/material';
import { DynamicNodeData } from '../../types';

const getHandleStyle = (isConnecting: boolean, isValidConnection: boolean) => ({
  width: 10,
  height: 10,
  background: isConnecting
    ? (isValidConnection ? '#4caf50' : '#f44336')
    : '#555',
  borderRadius: '50%',
});

export const DynamicNode = memo(({ id, data }: NodeProps<DynamicNodeData>) => {
  const handleStyle = getHandleStyle(data.isConnecting ?? false, data.isValidConnection ?? false);

  const commonStyles = {
    background: '#333',
    color: '#fff',
    border: 'none',
    borderRadius: 1,
    p: 1,
    minWidth: 120,
    fontSize: '0.8rem',
  };

  switch (data.type) {
    case 'splerger':
      return (
        <Box sx={commonStyles}>
          <Handle
            type="target"
            position={Position.Left}
            style={handleStyle}
            id={`${id}-input-0`}
          />
          <Typography variant="caption" align="center" display="block">
            {data.label}
          </Typography>
          <Typography variant="caption" align="center" display="block" sx={{ opacity: 0.7, fontSize: '0.7rem' }}>
            {data.itemType || 'Any Item'}
          </Typography>
          <Handle
            type="source"
            position={Position.Right}
            style={handleStyle}
            id={`${id}-output-0`}
          />
        </Box>
      );

    case 'sink':
      return (
        <Box sx={commonStyles}>
          <Handle
            type="target"
            position={Position.Left}
            style={handleStyle}
            id={`${id}-input-0`}
          />
          <Typography variant="caption" align="center" display="block">
            {data.label}
          </Typography>
          <Typography variant="caption" align="center" display="block" sx={{ opacity: 0.7, fontSize: '0.7rem' }}>
            Accepts Any Item
          </Typography>
        </Box>
      );

    default:
      return null;
  }
}); 
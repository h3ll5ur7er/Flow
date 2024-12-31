import { memo, useMemo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Box, Typography } from '@mui/material';
import { RecipeNodeData } from '../../types';

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

export const RecipeNode = memo(({ id, data }: NodeProps<RecipeNodeData>) => {
  const isValidConnection = useMemo(() => {
    if (!data.isConnecting || !data.connectionState?.sourceItemName) return true;

    const recipe = data.recipe;
    if (!recipe) return false;

    const isDraggingFromSource = data.connectionState?.handleId?.startsWith('output-');
    const itemName = isDraggingFromSource
      ? recipe.inputs[parseInt(data.connectionState?.handleId?.split('-')[1] || '0')]?.name
      : recipe.outputs[parseInt(data.connectionState?.handleId?.split('-')[1] || '0')]?.name;

    if (!itemName) return false;

    return itemName === data.connectionState?.sourceItemName;
  }, [data.isConnecting, data.connectionState?.sourceItemName, data.connectionState?.handleId]);

  const leftHandleStyle = getHandleStyle(data.isConnecting ?? false, isValidConnection);
  const rightHandleStyle = getRightHandleStyle(data.isConnecting ?? false, isValidConnection);

  // Show placeholder if no recipe is selected
  if (!data.recipe) {
    return (
      <Box sx={{
        background: '#333',
        color: '#fff',
        border: '2px dashed #666',
        borderRadius: 1,
        p: 1,
        minWidth: 120,
        fontSize: '0.8rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
      }}>
        <Typography variant="caption" align="center">
          Right-click to select recipe
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      background: '#333',
      color: '#fff',
      border: 'none',
      borderRadius: 1,
      minWidth: 120,
      fontSize: '0.8rem',
      position: 'relative',
    }}>
      <Box sx={{ display: 'flex', gap: 1, p: 1 }}>
        <Box sx={{ flex: 1 }}>
          {data.recipe.inputs.map((input, index) => (
            <Box key={`input-${index}`} sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 0.5,
              position: 'relative',
              height: 24,
            }}>
              <Handle
                type="target"
                position={Position.Left}
                style={leftHandleStyle}
                id={`input-${index}`}
              />
              <Typography variant="caption" sx={{ ml: 2 }}>
                {input.name} × {input.quantity}
              </Typography>
            </Box>
          ))}
        </Box>
        <Box sx={{ flex: 1, textAlign: 'right' }}>
          {data.recipe.outputs.map((output, index) => (
            <Box key={`output-${index}`} sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'flex-end', 
              mb: 0.5,
              position: 'relative',
              height: 24,
            }}>
              <Typography variant="caption" sx={{ mr: 2 }}>
                {output.name} × {output.quantity}
              </Typography>
              <Handle
                type="source"
                position={Position.Right}
                style={rightHandleStyle}
                id={`output-${index}`}
              />
            </Box>
          ))}
        </Box>
      </Box>
      <Typography variant="caption" align="center" display="block" sx={{ opacity: 0.7, fontSize: '0.7rem', mt: 0.5, mb: 1 }}>
        {data.recipe.name}
      </Typography>
    </Box>
  );
}); 
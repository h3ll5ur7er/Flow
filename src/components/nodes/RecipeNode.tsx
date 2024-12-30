import { Handle, Position, useStore as useReactFlowStore } from 'reactflow';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { Recipe } from '../../store/useStore';

interface NodeData {
  label: string;
  recipe: Recipe | null;
  isConnecting: boolean;
  validHandles: Set<string>;
  connectionState: {
    nodeId: string | null;
    handleId: string | null;
    handleType: 'source' | 'target' | null;
    sourceItemName: string | null;
  };
}

export function RecipeNode({ data }: { data: NodeData }) {
  const isHandleValid = (handleId: string, itemName: string) => {
    if (!data.isConnecting || !data.connectionState.sourceItemName) return true;
    
    // If we're dragging from a source (output), only highlight matching input handles
    // If we're dragging from a target (input), only highlight matching output handles
    const isInput = handleId.startsWith('input-');
    const isDraggingFromSource = data.connectionState.handleId?.startsWith('output-');

    // Only validate if we're looking at the right type of handle
    if (isInput !== isDraggingFromSource) return false;

    console.log('Validating handle:', {
      handleId,
      itemName,
      sourceItemName: data.connectionState.sourceItemName,
      isInput,
      isDraggingFromSource
    });

    // Check if the item types match
    return itemName === data.connectionState.sourceItemName;
  };

  const getHandleStyle = (handleId: string, type: 'source' | 'target', itemName: string) => {
    const isValid = isHandleValid(handleId, itemName);
    const isConnecting = data.isConnecting;

    const baseStyle = {
      width: '16px',
      height: '16px',
      background: isConnecting ? (isValid ? '#4CAF50' : '#666') : '#666',
      border: isConnecting ? (isValid ? '2px solid #2E7D32' : '1px solid #888') : '1px solid #888',
      [type === 'source' ? 'right' : 'left']: '-8px',
      top: '50%',
      transform: 'translateY(-50%)',
      borderRadius: '8px',
      cursor: isConnecting ? (isValid ? 'pointer' : 'not-allowed') : 'pointer',
      zIndex: 1,
      opacity: isConnecting ? (isValid ? 1 : 0.2) : 1,
      boxShadow: isConnecting && isValid ? '0 0 8px #4CAF50' : 'none',
      transition: 'all 0.2s ease',
    };

    return baseStyle;
  };

  return (
    <Card sx={{ 
      backgroundColor: '#1e1e1e',
      color: '#fff',
      border: '1px solid #333',
      display: 'flex',
      minWidth: 300,
      position: 'relative',
      overflow: 'visible'
    }}>
      {/* Input Column */}
      <Box sx={{ 
        width: 120, 
        borderRight: '1px solid #333',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {data.recipe && data.recipe.inputs.map((input, index, array) => (
          <Box
            key={`input-${index}`}
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              position: 'relative',
              p: 1,
              borderBottom: index !== array.length - 1 ? '1px solid #333' : 'none',
              minHeight: 40,
              '& .react-flow__handle': {
                opacity: 1,
                zIndex: 3
              }
            }}
          >
            <Typography variant="body2" sx={{ pr: 2 }}>
              {input.quantity > 1 ? `${input.quantity}x ` : ''}{input.name}
            </Typography>
            <Handle
              type="target"
              position={Position.Left}
              id={`input-${index}`}
              style={getHandleStyle(`input-${index}`, 'target', input.name)}
              data-item={input.name}
            />
          </Box>
        ))}
      </Box>

      {/* Content Column */}
      <CardContent sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        p: 2,
        '&:last-child': { pb: 2 }
      }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'inherit' }}>
          {data.label}
        </Typography>
        {data.recipe ? (
          <Typography color="text.secondary" variant="body2">
            Machine: {data.recipe.machine}
          </Typography>
        ) : (
          <Typography color="text.secondary" variant="body2">
            Right-click to set recipe
          </Typography>
        )}
      </CardContent>

      {/* Output Column */}
      <Box sx={{ 
        width: 120, 
        borderLeft: '1px solid #333',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {data.recipe && data.recipe.outputs.map((output, index, array) => (
          <Box
            key={`output-${index}`}
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              p: 1,
              borderBottom: index !== array.length - 1 ? '1px solid #333' : 'none',
              minHeight: 40,
              '& .react-flow__handle': {
                opacity: 1,
                zIndex: 3
              }
            }}
          >
            <Typography variant="body2" sx={{ pl: 2 }}>
              {output.quantity > 1 ? `${output.quantity}x ` : ''}{output.name}
            </Typography>
            <Handle
              type="source"
              position={Position.Right}
              id={`output-${index}`}
              style={getHandleStyle(`output-${index}`, 'source', output.name)}
              data-item={output.name}
            />
          </Box>
        ))}
      </Box>
    </Card>
  );
} 
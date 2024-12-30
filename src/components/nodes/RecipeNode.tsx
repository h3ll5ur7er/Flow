import { Handle, Position } from 'reactflow';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { Recipe } from '../../store/useStore';

interface NodeData {
  label: string;
  recipe: Recipe | null;
}

export function RecipeNode({ data }: { data: NodeData }) {
  // Get the machine configuration if a recipe is set
  const machine = data.recipe ? 
    data.recipe.machine : null;

  return (
    <Card sx={{ 
      backgroundColor: '#1e1e1e',
      color: '#fff',
      border: '1px solid #333',
      display: 'flex',
      minWidth: 300
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
              minHeight: 40
            }}
          >
            <Typography variant="body2" sx={{ pr: 2 }}>
              {input.quantity > 1 ? `${input.quantity}x ` : ''}{input.name}
            </Typography>
            <Handle
              type="target"
              position={Position.Left}
              id={`input-${index}`}
              style={{
                width: '8px',
                height: '8px',
                background: '#666',
                border: '1px solid #888',
                left: 0,
                transform: 'translateX(-50%)'
              }}
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
              minHeight: 40
            }}
          >
            <Typography variant="body2" sx={{ pl: 2 }}>
              {output.quantity > 1 ? `${output.quantity}x ` : ''}{output.name}
            </Typography>
            <Handle
              type="source"
              position={Position.Right}
              id={`output-${index}`}
              style={{
                width: '8px',
                height: '8px',
                background: '#666',
                border: '1px solid #888',
                right: 0,
                transform: 'translateX(50%)'
              }}
            />
          </Box>
        ))}
      </Box>
    </Card>
  );
} 
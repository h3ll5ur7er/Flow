import { Handle, Position } from 'reactflow';
import { Card, CardContent, Typography } from '@mui/material';

export function SubgraphNode({ data }: { data: { label: string } }) {
  return (
    <Card sx={{ minWidth: 200, backgroundColor: 'rgba(0, 0, 0, 0.1)' }}>
      <Handle type="target" position={Position.Left} />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          Subgraph
        </Typography>
        <Typography variant="body1">{data.label}</Typography>
      </CardContent>
      <Handle type="source" position={Position.Right} />
    </Card>
  );
} 
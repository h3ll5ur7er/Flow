import {
  List,
  ListItem,
  IconButton,
  TextField,
  Button,
  Box,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Machine } from '../../store/useStore';

interface Props {
  machines: Machine[];
  onChange: (machines: Machine[]) => void;
}

export function MachinesEditor({ machines, onChange }: Props) {
  const handleAdd = () => {
    onChange([
      ...machines,
      { name: 'New Machine', inputs: 1, outputs: 1 },
    ]);
  };

  const handleDelete = (index: number) => {
    onChange(machines.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof Machine, value: string | number) => {
    const newMachines = [...machines];
    newMachines[index] = {
      ...newMachines[index],
      [field]: field === 'name' ? value : Number(value),
    };
    onChange(newMachines);
  };

  return (
    <Box>
      <List>
        {machines.map((machine, index) => (
          <ListItem
            key={index}
            sx={{
              gap: 2,
              '& .MuiTextField-root': { minWidth: 120 },
            }}
          >
            <TextField
              label="Name"
              value={machine.name}
              onChange={(e) => handleChange(index, 'name', e.target.value)}
            />
            <TextField
              label="Inputs"
              type="number"
              value={machine.inputs}
              onChange={(e) => handleChange(index, 'inputs', e.target.value)}
            />
            <TextField
              label="Outputs"
              type="number"
              value={machine.outputs}
              onChange={(e) => handleChange(index, 'outputs', e.target.value)}
            />
            <IconButton onClick={() => handleDelete(index)} color="error">
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
      {machines.length === 0 && (
        <Typography color="text.secondary" sx={{ textAlign: 'center', my: 2 }}>
          No machines added yet
        </Typography>
      )}
      <Button
        startIcon={<AddIcon />}
        onClick={handleAdd}
        variant="outlined"
        sx={{ mt: 2 }}
      >
        Add Machine
      </Button>
    </Box>
  );
} 
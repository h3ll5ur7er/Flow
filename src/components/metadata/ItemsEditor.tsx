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
import { Item } from '../../store/useStore';

interface Props {
  items: Item[];
  onChange: (items: Item[]) => void;
}

export function ItemsEditor({ items, onChange }: Props) {
  const handleAdd = () => {
    onChange([
      ...items,
      { name: 'New Item', stackSize: 100 },
    ]);
  };

  const handleDelete = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof Item, value: string | number) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'name' ? value : Number(value),
    };
    onChange(newItems);
  };

  return (
    <Box>
      <List>
        {items.map((item, index) => (
          <ListItem
            key={index}
            sx={{
              gap: 2,
              '& .MuiTextField-root': { minWidth: 120 },
            }}
          >
            <TextField
              label="Name"
              value={item.name}
              onChange={(e) => handleChange(index, 'name', e.target.value)}
            />
            <TextField
              label="Stack Size"
              type="number"
              value={item.stackSize}
              onChange={(e) => handleChange(index, 'stackSize', e.target.value)}
            />
            <IconButton onClick={() => handleDelete(index)} color="error">
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
      {items.length === 0 && (
        <Typography color="text.secondary" sx={{ textAlign: 'center', my: 2 }}>
          No items added yet
        </Typography>
      )}
      <Button
        startIcon={<AddIcon />}
        onClick={handleAdd}
        variant="outlined"
        sx={{ mt: 2 }}
      >
        Add Item
      </Button>
    </Box>
  );
} 
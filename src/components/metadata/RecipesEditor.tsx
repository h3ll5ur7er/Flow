import {
  List,
  ListItem,
  IconButton,
  TextField,
  Button,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Recipe, Machine, Item, RecipeItem } from '../../store/useStore';

interface Props {
  recipes: Recipe[];
  machines: Machine[];
  items: Item[];
  onChange: (recipes: Recipe[]) => void;
}

const MouseEventBlocker = ({ children }: { children: React.ReactNode }) => (
  <Box onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
    {children}
  </Box>
);

export function RecipesEditor({ recipes, machines, items, onChange }: Props) {
  const handleAdd = () => {
    onChange([
      ...recipes,
      {
        name: 'New Recipe',
        inputs: [],
        outputs: [],
        machine: machines[0]?.name || '',
      },
    ]);
  };

  const handleDelete = (index: number) => {
    onChange(recipes.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof Recipe, value: any) => {
    const newRecipes = [...recipes];
    newRecipes[index] = {
      ...newRecipes[index],
      [field]: value,
    };
    onChange(newRecipes);
  };

  const handleItemRemove = (recipeIndex: number, field: 'inputs' | 'outputs', itemIndex: number) => {
    const newRecipes = [...recipes];
    newRecipes[recipeIndex] = {
      ...newRecipes[recipeIndex],
      [field]: newRecipes[recipeIndex][field].filter((_, i: number) => i !== itemIndex),
    };
    onChange(newRecipes);
  };

  const handleQuantityChange = (
    recipeIndex: number,
    field: 'inputs' | 'outputs',
    itemIndex: number,
    quantity: number
  ) => {
    const newRecipes = [...recipes];
    newRecipes[recipeIndex] = {
      ...newRecipes[recipeIndex],
      [field]: newRecipes[recipeIndex][field].map((item: RecipeItem, i: number) =>
        i === itemIndex ? { ...item, quantity: Math.max(1, quantity) } : item
      ),
    };
    onChange(newRecipes);
  };

  return (
    <Box>
      <List>
        {recipes.map((recipe, index) => (
          <ListItem
            key={index}
            sx={{
              flexDirection: 'column',
              alignItems: 'stretch',
              gap: 2,
              py: 2,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <TextField
                label="Name"
                value={recipe.name}
                onChange={(e) => handleChange(index, 'name', e.target.value)}
              />
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Machine</InputLabel>
                <Select
                  value={recipe.machine}
                  label="Machine"
                  onChange={(e) => handleChange(index, 'machine', e.target.value)}
                >
                  {machines.map((machine) => (
                    <MenuItem key={machine.name} value={machine.name}>
                      {machine.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <IconButton onClick={() => handleDelete(index)} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Inputs</InputLabel>
                <Select
                  multiple
                  value={recipe.inputs.map(i => i.name)}
                  label="Inputs"
                  onChange={(e) => {
                    const value = e.target.value as string[];
                    const newInputs = value.map(itemName => {
                      const existing = recipe.inputs.find(i => i.name === itemName);
                      return existing || { name: itemName, quantity: 1 };
                    });
                    handleChange(index, 'inputs', newInputs);
                  }}
                  renderValue={() => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {recipe.inputs.map((item, itemIndex) => (
                        <Box key={itemIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={`${item.name} (${item.quantity})`}
                            onDelete={(e) => {
                              e.stopPropagation();
                              handleItemRemove(index, 'inputs', itemIndex);
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                          />
                          <MouseEventBlocker>
                            <TextField
                              type="number"
                              size="small"
                              value={item.quantity}
                              onChange={(e) => {
                                handleQuantityChange(index, 'inputs', itemIndex, parseInt(e.target.value) || 1);
                              }}
                              sx={{ width: 60 }}
                            />
                          </MouseEventBlocker>
                        </Box>
                      ))}
                    </Box>
                  )}
                >
                  {items.map((item) => (
                    <MenuItem key={item.name} value={item.name}>
                      {item.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Outputs</InputLabel>
                <Select
                  multiple
                  value={recipe.outputs.map(i => i.name)}
                  label="Outputs"
                  onChange={(e) => {
                    const value = e.target.value as string[];
                    const newOutputs = value.map(itemName => {
                      const existing = recipe.outputs.find(i => i.name === itemName);
                      return existing || { name: itemName, quantity: 1 };
                    });
                    handleChange(index, 'outputs', newOutputs);
                  }}
                  renderValue={() => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {recipe.outputs.map((item, itemIndex) => (
                        <Box key={itemIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={`${item.name} (${item.quantity})`}
                            onDelete={(e) => {
                              e.stopPropagation();
                              handleItemRemove(index, 'outputs', itemIndex);
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                          />
                          <MouseEventBlocker>
                            <TextField
                              type="number"
                              size="small"
                              value={item.quantity}
                              onChange={(e) => {
                                handleQuantityChange(index, 'outputs', itemIndex, parseInt(e.target.value) || 1);
                              }}
                              sx={{ width: 60 }}
                            />
                          </MouseEventBlocker>
                        </Box>
                      ))}
                    </Box>
                  )}
                >
                  {items.map((item) => (
                    <MenuItem key={item.name} value={item.name}>
                      {item.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </ListItem>
        ))}
      </List>
      {recipes.length === 0 && (
        <Typography color="text.secondary" sx={{ textAlign: 'center', my: 2 }}>
          No recipes added yet
        </Typography>
      )}
      <Button
        startIcon={<AddIcon />}
        onClick={handleAdd}
        variant="outlined"
        sx={{ mt: 2 }}
        disabled={machines.length === 0 || items.length === 0}
      >
        Add Recipe
      </Button>
    </Box>
  );
} 
import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Box,
  Button,
  DialogActions,
} from '@mui/material';
import { useStore } from '../../store/useStore';
import { MachinesEditor } from './MachinesEditor';
import { ItemsEditor } from './ItemsEditor';
import { RecipesEditor } from './RecipesEditor';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function GameMetadataEditor({ open, onClose }: Props) {
  const [tab, setTab] = useState(0);
  const { gameMetadata, setGameMetadata } = useStore();
  const [localMetadata, setLocalMetadata] = useState(gameMetadata || {
    name: 'New Game',
    machines: [],
    items: [],
    recipes: [],
  });

  const handleSave = () => {
    setGameMetadata(localMetadata);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Game Metadata Editor</DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
            <Tab label="Machines" />
            <Tab label="Items" />
            <Tab label="Recipes" />
          </Tabs>
        </Box>
        <Box sx={{ py: 2 }}>
          {tab === 0 && (
            <MachinesEditor
              machines={localMetadata.machines}
              onChange={machines => setLocalMetadata({ ...localMetadata, machines })}
            />
          )}
          {tab === 1 && (
            <ItemsEditor
              items={localMetadata.items}
              onChange={items => setLocalMetadata({ ...localMetadata, items })}
            />
          )}
          {tab === 2 && (
            <RecipesEditor
              recipes={localMetadata.recipes}
              machines={localMetadata.machines}
              items={localMetadata.items}
              onChange={recipes => setLocalMetadata({ ...localMetadata, recipes })}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
} 
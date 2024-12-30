import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Box,
  Button,
  DialogActions,
  TextField,
  Typography,
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
  const { gameMetadata, setGameMetadata, nodes, edges, flowName, setFlowName, setNodes, setEdges } = useStore();
  const [localMetadata, setLocalMetadata] = useState(gameMetadata);

  // Reset local metadata when the dialog opens
  useEffect(() => {
    if (open) {
      setLocalMetadata(gameMetadata);
    }
  }, [open, gameMetadata]);

  const handleSave = () => {
    setGameMetadata(localMetadata);
    onClose();
  };

  const handleExportMetadata = () => {
    const blob = new Blob([JSON.stringify(gameMetadata, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${gameMetadata.name || 'game'}.meta.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportFlow = () => {
    const flowState = {
      nodes,
      edges,
      name: flowName,
    };
    const blob = new Blob([JSON.stringify(flowState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${flowName || 'flow'}.flow.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportMetadata = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.gameMetadata) {
          setLocalMetadata(data.gameMetadata);
        }
      } catch (error) {
        console.error('Failed to parse imported metadata:', error);
      }
    };
    reader.readAsText(file);
  };

  const handleImportFlow = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.flow.json')) {
      alert('Please select a valid flow file (.flow.json)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const flowState = JSON.parse(content);
        setNodes(flowState.nodes);
        setEdges(flowState.edges);
        setFlowName(flowState.name);
      } catch (error) {
        console.error('Error importing flow:', error);
        alert('Error importing flow file. Please check the file format.');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset the input
  };

  const handleImportGameMetadata = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.meta.json')) {
      alert('Please select a valid game metadata file (.meta.json)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const metadata = JSON.parse(content);
        setGameMetadata(metadata);
      } catch (error) {
        console.error('Error importing game metadata:', error);
        alert('Error importing game metadata file. Please check the file format.');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset the input
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Game Metadata Editor</DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
            <Tab label="Flow" />
            <Tab label="Game" />
            <Tab label="Machines" />
            <Tab label="Items" />
            <Tab label="Recipes" />
          </Tabs>
        </Box>
        <Box sx={{ py: 2 }}>
          {tab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>Flow Settings</Typography>
              <TextField
                fullWidth
                label="Flow Name"
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <Button variant="outlined" onClick={handleExportFlow}>
                  Export Flow
                </Button>
                <Button
                  variant="outlined"
                  component="label"
                >
                  Import Flow
                  <input
                    type="file"
                    hidden
                    accept=".json"
                    onChange={handleImportFlow}
                  />
                </Button>
              </Box>
              <Typography variant="h6" gutterBottom>Flow Statistics</Typography>
              <Typography>Nodes: {nodes.length}</Typography>
              <Typography>Edges: {edges.length}</Typography>
              <Typography>Recipes Used: {new Set(nodes.filter(n => n.type === 'recipe').map(n => n.data.recipe?.name)).size}</Typography>
              <Typography>Subgraphs: {nodes.filter(n => n.type === 'subgraph').length}</Typography>
            </Box>
          )}
          {tab === 1 && (
            <Box>
              <TextField
                fullWidth
                label="Game Name"
                value={localMetadata.name}
                onChange={(e) => setLocalMetadata({ ...localMetadata, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Game Version"
                value={localMetadata.version}
                onChange={(e) => setLocalMetadata({ ...localMetadata, version: e.target.value })}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" onClick={handleExportMetadata}>
                  Export Game Metadata
                </Button>
                <Button
                  variant="outlined"
                  component="label"
                >
                  Import Game Metadata
                  <input
                    type="file"
                    hidden
                    accept=".json"
                    onChange={handleImportGameMetadata}
                  />
                </Button>
              </Box>
            </Box>
          )}
          {tab === 2 && (
            <MachinesEditor
              machines={localMetadata.machines}
              onChange={machines => setLocalMetadata({ ...localMetadata, machines })}
            />
          )}
          {tab === 3 && (
            <ItemsEditor
              items={localMetadata.items}
              onChange={items => setLocalMetadata({ ...localMetadata, items })}
            />
          )}
          {tab === 4 && (
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
import { useState, useEffect, useMemo } from 'react';
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
import { useStore, Machine, Item, Recipe } from '../../store/useStore';
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
  const [localMetadata, setLocalMetadata] = useState(gameMetadata ?? {
    name: 'New Game',
    version: '1.0.0',
    machines: [],
    items: [],
    recipes: [],
  });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '' });

  // Memoize flow statistics
  const flowStats = useMemo(() => ({
    nodeCount: nodes.length,
    edgeCount: edges.length,
    recipeCount: new Set(nodes.filter(n => n.type === 'recipe').map(n => n.data.recipe?.name)).size,
    subgraphCount: nodes.filter(n => n.type === 'subgraph').length,
  }), [nodes, edges]);

  // Reset local metadata when the dialog opens
  useEffect(() => {
    if (open && gameMetadata) {
      setLocalMetadata(gameMetadata);
    }
  }, [open, gameMetadata]);

  const handleSave = () => {
    setGameMetadata(localMetadata);
    onClose();
  };

  const handleExportMetadata = () => {
    const blob = new Blob([JSON.stringify(localMetadata, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${localMetadata.name}_v${localMetadata.version}.meta.json`;
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
      game: {
        name: localMetadata.name,
        version: localMetadata.version,
      },
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

        // Check game compatibility
        if (!flowState.game) {
          alert('Warning: This flow file does not contain game metadata. It might not be compatible with the current game.');
        } else if (flowState.game.name !== localMetadata.name) {
          alert(`Error: This flow was created for game "${flowState.game.name}" and cannot be used with "${localMetadata.name}".`);
          return;
        } else if (flowState.game.version !== localMetadata.version) {
          const proceed = window.confirm(
            `Warning: This flow was created with game version ${flowState.game.version}, ` +
            `but you are using version ${localMetadata.version}. There might be breaking changes. ` +
            `Do you want to proceed?`
          );
          if (!proceed) return;
        }

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
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      aria-hidden={false}
      disablePortal
    >
      <DialogTitle>Game Metadata Editor</DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={tab} 
            onChange={(_, newValue) => setTab(newValue)}
            aria-hidden={true}
          >
            <Tab label="Flow" aria-hidden={true} />
            <Tab label="Game" aria-hidden={true} />
            <Tab label="Machines" aria-hidden={true} />
            <Tab label="Items" aria-hidden={true} />
            <Tab label="Recipes" aria-hidden={true} />
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
                inputProps={{ 'aria-hidden': true }}
                InputLabelProps={{ 'aria-hidden': true }}
              />
              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <Button 
                  variant="outlined" 
                  color="error" 
                  onClick={() => setConfirmDialog({
                    open: true,
                    type: 'flow',
                  })}
                  aria-hidden={true}
                >
                  New Flow
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={handleExportFlow}
                  aria-hidden={true}
                >
                  Export Flow
                </Button>
                <Button
                  variant="outlined"
                  component="label"
                  aria-hidden={true}
                >
                  Import Flow
                  <input
                    type="file"
                    hidden
                    accept=".flow.json"
                    onChange={handleImportFlow}
                  />
                </Button>
              </Box>
              <Typography variant="h6" gutterBottom>Flow Statistics</Typography>
              <Typography>Nodes: {flowStats.nodeCount}</Typography>
              <Typography>Edges: {flowStats.edgeCount}</Typography>
              <Typography>Recipes Used: {flowStats.recipeCount}</Typography>
              <Typography>Subgraphs: {flowStats.subgraphCount}</Typography>
            </Box>
          )}
          {tab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <Button variant="outlined" color="error" onClick={() => setConfirmDialog({
                  open: true,
                  type: 'game',
                })}>
                  New Game
                </Button>
              </Box>
              <TextField
                fullWidth
                label="Game Name"
                value={localMetadata.name}
                onChange={(e) => setLocalMetadata({ ...localMetadata, name: e.target.value })}
                sx={{ mb: 2 }}
                inputProps={{ 'aria-hidden': true }}
                InputLabelProps={{ 'aria-hidden': true }}
              />
              <TextField
                fullWidth
                label="Game Version"
                value={localMetadata.version}
                onChange={(e) => setLocalMetadata({ ...localMetadata, version: e.target.value })}
                sx={{ mb: 2 }}
                inputProps={{ 'aria-hidden': true }}
                InputLabelProps={{ 'aria-hidden': true }}
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
                    accept=".meta.json"
                    onChange={handleImportGameMetadata}
                  />
                </Button>
              </Box>
            </Box>
          )}
          {tab === 2 && (
            <MachinesEditor
              machines={localMetadata.machines}
              onChange={(machines: Machine[]) => setLocalMetadata({ ...localMetadata, machines })}
            />
          )}
          {tab === 3 && (
            <ItemsEditor
              items={localMetadata.items}
              onChange={(items: Item[]) => setLocalMetadata({ ...localMetadata, items })}
            />
          )}
          {tab === 4 && (
            <RecipesEditor
              recipes={localMetadata.recipes}
              machines={localMetadata.machines}
              items={localMetadata.items}
              onChange={(recipes: Recipe[]) => setLocalMetadata({ ...localMetadata, recipes })}
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

      <Dialog 
        open={confirmDialog.open} 
        onClose={() => setConfirmDialog({ open: false, type: 'flow' })}
        aria-hidden={false}
        disablePortal
      >
        <DialogTitle>
          {confirmDialog.type === 'flow' ? 'Create New Flow?' : 'Create New Game?'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {confirmDialog.type === 'flow'
              ? 'This will clear the current flow. Any unsaved changes will be lost.'
              : 'This will clear both the current game metadata and flow. Any unsaved changes will be lost.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            if (confirmDialog.type === 'flow') {
              handleExportFlow();
            } else {
              handleExportMetadata();
              handleExportFlow();
            }
          }} color="info">
            Export Current Data
          </Button>
          <Button onClick={() => setConfirmDialog({ open: false, type: 'flow' })}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (confirmDialog.type === 'flow') {
                setNodes([]);
                setEdges([]);
                setFlowName('New Flow');
              } else {
                setNodes([]);
                setEdges([]);
                setFlowName('New Flow');
                const newMetadata = {
                  name: 'New Game',
                  version: '1.0.0',
                  machines: [],
                  items: [],
                  recipes: [],
                };
                setLocalMetadata(newMetadata);
                setGameMetadata(newMetadata);
              }
              setConfirmDialog({ open: false, type: 'flow' });
            }}
            color="error"
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
} 
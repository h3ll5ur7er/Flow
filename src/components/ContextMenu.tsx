import {
  Menu,
  MenuItem,
  Collapse,
  IconButton,
  TextField,
  Box,
} from '@mui/material';
import { Node, Edge } from 'reactflow';
import { useStore, Recipe } from '../store/useStore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useState } from 'react';

interface ContextMenuProps {
  type: 'canvas' | 'node' | 'edge';
  node?: Node;
  edge?: Edge;
  position: { x: number; y: number } | null;
  onClose: () => void;
  onDeleteNode?: (nodeId: string) => void;
  onDeleteEdge?: (edgeId: string) => void;
}

export function ContextMenu({
  type,
  node,
  edge,
  position,
  onClose,
  onDeleteNode,
  onDeleteEdge,
}: ContextMenuProps) {
  const { gameMetadata, setNodes } = useStore();
  const [expandedMachines, setExpandedMachines] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const handleSetRecipe = (recipeId: string) => {
    if (!node || !gameMetadata) return;

    const recipe = gameMetadata.recipes.find(r => r.name === recipeId);
    setNodes(nodes =>
      nodes.map(n =>
        n.id === node.id
          ? {
              ...n,
              data: {
                ...n.data,
                label: recipe?.name || 'New Recipe',
                recipe: recipe || null,
              },
            }
          : n
      )
    );
    onClose();
  };

  const handleDeleteNode = () => {
    if (node && onDeleteNode) {
      onDeleteNode(node.id);
      onClose();
    }
  };

  const handleDeleteEdge = () => {
    if (edge && onDeleteEdge) {
      onDeleteEdge(edge.id);
      onClose();
    }
  };

  const toggleMachine = (machine: string) => {
    setExpandedMachines(prev => ({
      ...prev,
      [machine]: !prev[machine]
    }));
  };

  // Group recipes by machine
  const recipesByMachine = gameMetadata?.recipes.reduce<Record<string, Recipe[]>>((acc, recipe) => {
    if (!acc[recipe.machine]) {
      acc[recipe.machine] = [];
    }
    acc[recipe.machine].push(recipe);
    return acc;
  }, {}) || {};

  // Filter recipes based on search query
  const filteredRecipesByMachine = Object.entries(recipesByMachine).reduce<Record<string, Recipe[]>>((acc, [machine, recipes]) => {
    const filteredRecipes = recipes.filter(recipe => 
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      machine.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filteredRecipes.length > 0) {
      acc[machine] = filteredRecipes;
    }
    return acc;
  }, {});

  if (!position) return null;

  return (
    <Menu
      open={true}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={{ top: position.y, left: position.x }}
    >
      {type === 'canvas' && (
        <>
          <MenuItem onClick={() => {
            setNodes(nodes => [
              ...nodes,
              {
                id: `recipe-${nodes.length + 1}`,
                type: 'recipe',
                position: position,
                data: { label: 'New Recipe', recipe: null },
              },
            ]);
            onClose();
          }}>
            Add Recipe
          </MenuItem>
          <MenuItem onClick={() => {
            setNodes(nodes => [
              ...nodes,
              {
                id: `subgraph-${nodes.length + 1}`,
                type: 'subgraph',
                position: position,
                data: { label: 'New Subgraph' },
              },
            ]);
            onClose();
          }}>
            Add Subgraph
          </MenuItem>
        </>
      )}
      {type === 'node' && node?.type === 'recipe' && (
        <>
          <Box sx={{ p: 1, width: 250 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </Box>
          {Object.entries(filteredRecipesByMachine).map(([machine, recipes]) => (
            <div key={machine}>
              <MenuItem
                onClick={() => toggleMachine(machine)}
                sx={{ 
                  backgroundColor: 'action.hover',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                {machine}
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMachine(machine);
                  }}
                >
                  {expandedMachines[machine] ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </MenuItem>
              <Collapse in={expandedMachines[machine]} timeout="auto">
                {recipes.map(recipe => (
                  <MenuItem
                    key={recipe.name}
                    onClick={() => handleSetRecipe(recipe.name)}
                    sx={{ pl: 4 }}
                  >
                    {recipe.name}
                  </MenuItem>
                ))}
              </Collapse>
            </div>
          ))}
          <MenuItem onClick={handleDeleteNode} sx={{ color: 'error.main' }}>
            Delete Node
          </MenuItem>
        </>
      )}
      {type === 'edge' && (
        <MenuItem onClick={handleDeleteEdge} sx={{ color: 'error.main' }}>
          Delete Connection
        </MenuItem>
      )}
    </Menu>
  );
} 
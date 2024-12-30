import { Menu, MenuItem } from '@mui/material';
import { Node, Edge } from 'reactflow';
import { useStore } from '../store/useStore';

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

  const handleSetRecipe = (recipeId: string) => {
    if (!node) return;

    const recipe = gameMetadata?.recipes.find(r => r.name === recipeId);
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
          {gameMetadata?.recipes.map(recipe => (
            <MenuItem
              key={recipe.name}
              onClick={() => handleSetRecipe(recipe.name)}
            >
              Set Recipe: {recipe.name}
            </MenuItem>
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
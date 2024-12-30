import { Button, Paper } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { useState } from 'react';
import { GameMetadataEditor } from './metadata/GameMetadataEditor';

export function Toolbar() {
  const [isMetadataEditorOpen, setIsMetadataEditorOpen] = useState(false);

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 1000,
          p: 1,
        }}
      >
        <Button
          variant="contained"
          startIcon={<SettingsIcon />}
          onClick={() => setIsMetadataEditorOpen(true)}
        >
          Game Metadata
        </Button>
      </Paper>

      <GameMetadataEditor
        open={isMetadataEditorOpen}
        onClose={() => setIsMetadataEditorOpen(false)}
      />
    </>
  );
} 
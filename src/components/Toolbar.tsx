import { Button, Box } from '@mui/material';
import { useState } from 'react';
import { GameMetadataEditor } from './metadata/GameMetadataEditor';

export function Toolbar() {
  const [isMetadataEditorOpen, setIsMetadataEditorOpen] = useState(false);

  return (
    <>
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1,
        }}
      >
        <Button variant="contained" onClick={() => setIsMetadataEditorOpen(true)}>
          Edit Metadata
        </Button>
      </Box>

      <GameMetadataEditor
        open={isMetadataEditorOpen}
        onClose={() => setIsMetadataEditorOpen(false)}
      />
    </>
  );
} 
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { FlowEditor } from './components/FlowEditor';

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FlowEditor />
    </ThemeProvider>
  );
}

export default App;

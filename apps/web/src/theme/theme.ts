import { createTheme } from '@mui/material/styles';

export const buildTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode,
      primary: { main: '#A61E22' },
      success: { main: '#22C55E' },
      error: { main: '#EF4444' },
      background: {
        default: mode === 'light' ? '#F5F5F5' : '#171717',
        paper: mode === 'light' ? '#FFFFFF' : '#202020',
      },
      text: {
        primary: mode === 'light' ? '#2F2F2F' : '#F5F5F5',
      },
    },
    typography: {
      fontFamily: ['Inter', 'Roboto', 'Arial', 'sans-serif'].join(','),
      h4: { fontWeight: 800 },
      h5: { fontWeight: 800 },
      h6: { fontWeight: 700 },
      button: { textTransform: 'none', fontWeight: 700 },
    },
    shape: { borderRadius: 8 },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            border: '1px solid rgba(47,47,47,0.08)',
            boxShadow: '0 10px 28px rgba(47,47,47,0.06)',
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
      },
    },
  });

export const money = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

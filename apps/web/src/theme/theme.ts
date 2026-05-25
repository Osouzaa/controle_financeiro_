import { createTheme } from '@mui/material/styles';

export const buildTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode,
      primary: { main: '#0F766E', dark: '#115E59', light: '#14B8A6' },
      secondary: { main: '#1D4ED8' },
      success: { main: '#16A34A' },
      warning: { main: '#D97706' },
      error: { main: '#DC2626' },
      background: {
        default: mode === 'light' ? '#F8FAFC' : '#111827',
        paper: mode === 'light' ? '#FFFFFF' : '#1F2937',
      },
      text: {
        primary: mode === 'light' ? '#17202A' : '#F8FAFC',
        secondary: mode === 'light' ? '#64748B' : '#CBD5E1',
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
            boxShadow: '0 10px 28px rgba(15,23,42,0.06)',
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

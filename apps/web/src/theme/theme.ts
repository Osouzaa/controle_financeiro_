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
      fontWeightLight: 400,
      fontWeightRegular: 500,
      fontWeightMedium: 600,
      fontWeightBold: 700,
      h1: { fontWeight: 700, letterSpacing: '-0.03em' },
      h2: { fontWeight: 700, letterSpacing: '-0.03em' },
      h3: { fontWeight: 700, letterSpacing: '-0.025em' },
      h4: { fontWeight: 700, letterSpacing: '-0.02em' },
      h5: { fontWeight: 700, letterSpacing: '-0.015em' },
      h6: { fontWeight: 700 },
      body1: { fontWeight: 400, lineHeight: 1.7 },
      body2: { fontWeight: 400, lineHeight: 1.65 },
      subtitle1: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: { borderRadius: 8 },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            border: '1px solid rgba(15,23,42,0.07)',
            boxShadow: '0 12px 28px rgba(15,23,42,0.05)',
            borderRadius: 16,
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 12,
            fontWeight: 600,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            boxShadow: '0 12px 28px rgba(15,23,42,0.05)',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontSize: 13,
            fontWeight: 700,
            color: mode === 'light' ? '#475569' : '#cbd5e1',
            borderBottom: '1px solid rgba(15,23,42,0.07)',
          },
          body: {
            fontSize: 14.5,
            borderBottom: '1px solid rgba(15,23,42,0.05)',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: mode === 'light' ? 'rgba(15,118,110,0.03)' : 'rgba(94,234,212,0.05)',
            },
          },
        },
      },
    },
  });

export const money = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

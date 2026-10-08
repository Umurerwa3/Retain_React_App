import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0f766e' },
    secondary: { main: '#6366f1' },
    background: { default: '#f5f7fa', paper: '#ffffff' },
    success: { main: '#16a34a' },
    warning: { main: '#f59e0b' },
    error: { main: '#dc2626' },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: ({ theme }) => ({ border: `1px solid ${theme.palette.divider}` }),
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
    MuiTextField: {
      defaultProps: { size: 'small', fullWidth: true },
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;

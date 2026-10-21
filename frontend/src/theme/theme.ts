'use client';
import { createTheme } from '@mui/material/styles';
import { ACCENT, ACCENT_2, INK } from './brand';

const theme = createTheme({
  cssVariables: true,
  palette: {
    primary: { main: ACCENT, contrastText: INK },
    secondary: { main: ACCENT_2, contrastText: INK },
  },
  typography: {
    fontFamily: 'var(--font-roboto)',
  },
});

export default theme;
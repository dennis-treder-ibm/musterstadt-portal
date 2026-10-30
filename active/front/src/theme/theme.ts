import { createTheme } from '@mui/material/styles'
import { deDE } from '@mui/material/locale'

/**
 * Single theme with both colour schemes. `colorSchemeSelector: 'class'` lets
 * MUI switch schemes via `useColorScheme().setMode('system' | 'light' | 'dark')`,
 * where 'system' follows `prefers-color-scheme`.
 */
export const theme = createTheme(
  {
    cssVariables: { colorSchemeSelector: 'class' },
    colorSchemes: {
      light: {
        palette: {
          primary: { main: '#005a9c' },
          secondary: { main: '#b5541c' },
        },
      },
      dark: {
        palette: {
          primary: { main: '#6cb4ee' },
          secondary: { main: '#f0a070' },
        },
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    shape: { borderRadius: 8 },
  },
  deDE,
)

import { createTheme } from '@mui/material/styles'

/**
 * Application theme. `colorSchemes` enables both palettes; MUI resolves "system" through
 * prefers-color-scheme and persists the user's choice in localStorage ("mui-mode").
 * `colorSchemeSelector: 'class'` switches schemes without a re-render flash.
 */
export const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'class' },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#003399' },
        secondary: { main: '#0b6e4f' },
      },
    },
    dark: {
      palette: {
        primary: { main: '#8fb0ff' },
        secondary: { main: '#5fd1a6' },
      },
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: { borderRadius: 8 },
})

/** The default palette mode when the user has not chosen one yet. */
export const DEFAULT_MODE = 'system' as const

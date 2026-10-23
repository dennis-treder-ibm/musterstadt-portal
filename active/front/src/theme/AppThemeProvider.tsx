import type { ReactNode } from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { DEFAULT_MODE, theme } from './theme'

/** Provides the MUI theme with system/light/dark support (default: system). */
export function AppThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme} defaultMode={DEFAULT_MODE}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  )
}

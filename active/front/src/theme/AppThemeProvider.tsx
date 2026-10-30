import type { PropsWithChildren } from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { theme } from './theme'

/** Default mode is 'system'; the user's choice is persisted by MUI in localStorage. */
export function AppThemeProvider({ children }: PropsWithChildren) {
  return (
    <ThemeProvider theme={theme} defaultMode="system" modeStorageKey="bp.themeMode">
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  )
}

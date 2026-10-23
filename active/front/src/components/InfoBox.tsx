import Alert from '@mui/material/Alert'
import type { AlertColor } from '@mui/material/Alert'
import type { ReactNode } from 'react'

interface InfoBoxProps {
  severity?: AlertColor
  children: ReactNode
}

/**
 * Styled notice box (maps to the legacy table-based info boxes in the JSF pages).
 * Defaults to 'info' severity.
 */
export function InfoBox({ severity = 'info', children }: InfoBoxProps) {
  return (
    <Alert severity={severity} sx={{ mb: 2 }}>
      {children}
    </Alert>
  )
}

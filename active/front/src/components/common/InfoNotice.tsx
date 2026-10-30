import Alert, { type AlertProps } from '@mui/material/Alert'
import type { ReactNode } from 'react'

interface InfoNoticeProps {
  severity?: Extract<AlertProps['severity'], 'info' | 'warning' | 'success'>
  title?: string
  children: ReactNode
}

/** Static informational / legal notice (legacy "Hinweis" boxes). */
export function InfoNotice({ severity = 'info', title, children }: InfoNoticeProps) {
  return (
    <Alert severity={severity} role="note" variant="outlined" sx={{ '& .MuiAlert-message': { width: '100%' } }}>
      {title && <strong>{title} </strong>}
      {children}
    </Alert>
  )
}

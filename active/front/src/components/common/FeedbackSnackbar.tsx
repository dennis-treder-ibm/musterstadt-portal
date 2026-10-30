import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'

interface FeedbackSnackbarProps {
  /** Message to show; `null` hides the snackbar. */
  message: string | null
  severity?: 'success' | 'error' | 'info'
  onClose: () => void
  autoHideMs?: number
}

/** Transient success/error feedback after user actions. */
export function FeedbackSnackbar({ message, severity = 'success', onClose, autoHideMs = 8000 }: FeedbackSnackbarProps) {
  return (
    <Snackbar
      open={message !== null}
      autoHideDuration={autoHideMs}
      onClose={(_event, reason) => {
        if (reason !== 'clickaway') onClose()
      }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert severity={severity} variant="filled" onClose={onClose} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  )
}

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

interface LoadingStateProps {
  message?: string
}

/** Centred spinner with optional message, used while async data is loading. */
export function LoadingState({ message = 'Daten werden geladen…' }: LoadingStateProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 2 }}>
      <CircularProgress aria-label={message} />
      <Typography color="text.secondary" variant="body2">
        {message}
      </Typography>
    </Box>
  )
}

interface ErrorAlertProps {
  message: string | null | undefined
  onClose?: () => void
}

/** Accessible error alert with optional dismiss button. */
export function ErrorAlert({ message, onClose }: ErrorAlertProps) {
  if (!message) return null
  return (
    <Alert
      severity="error"
      role="alert"
      onClose={onClose}
      sx={{ mb: 2 }}
    >
      {message}
    </Alert>
  )
}

interface SuccessAlertProps {
  message: string | null | undefined
  onClose?: () => void
}

/** Accessible success alert with optional dismiss button. */
export function SuccessAlert({ message, onClose }: SuccessAlertProps) {
  if (!message) return null
  return (
    <Alert
      severity="success"
      role="status"
      onClose={onClose}
      sx={{ mb: 2 }}
    >
      {message}
    </Alert>
  )
}

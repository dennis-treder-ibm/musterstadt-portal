import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'

interface ErrorAlertProps {
  message: string
  /** When provided, a "Erneut versuchen" action is rendered. */
  onRetry?: () => void
}

/** Inline error display (role="alert") with optional retry action. */
export function ErrorAlert({ message, onRetry }: ErrorAlertProps) {
  return (
    <Alert
      severity="error"
      role="alert"
      action={
        onRetry ? (
          <Button color="inherit" size="small" onClick={onRetry}>
            Erneut versuchen
          </Button>
        ) : undefined
      }
    >
      {message}
    </Alert>
  )
}

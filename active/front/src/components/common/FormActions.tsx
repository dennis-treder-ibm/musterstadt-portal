import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'

interface FormActionsProps {
  submitLabel: string
  submitting?: boolean
  /** Renders a secondary reset button when provided. */
  onReset?: () => void
  resetLabel?: string
}

/** Submit (+ optional reset) button row for forms. */
export function FormActions({ submitLabel, submitting = false, onReset, resetLabel = 'Zurücksetzen' }: FormActionsProps) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <Button
        type="submit"
        variant="contained"
        disabled={submitting}
        startIcon={submitting ? <CircularProgress size={16} color="inherit" aria-hidden /> : undefined}
      >
        {submitLabel}
      </Button>
      {onReset && (
        <Button type="button" variant="outlined" onClick={onReset} disabled={submitting}>
          {resetLabel}
        </Button>
      )}
    </Stack>
  )
}

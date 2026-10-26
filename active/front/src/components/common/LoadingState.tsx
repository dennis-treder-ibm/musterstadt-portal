import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

interface LoadingStateProps {
  /** Accessible text announced to screen readers. */
  label?: string
  /** Fill the viewport area (used for full-page loading). */
  fullPage?: boolean
}

/** Centered spinner with a live-region label. */
export function LoadingState({ label = 'Wird geladen …', fullPage = false }: LoadingStateProps) {
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        py: 4,
        minHeight: fullPage ? '50vh' : undefined,
      }}
    >
      <CircularProgress aria-hidden size={32} />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  )
}

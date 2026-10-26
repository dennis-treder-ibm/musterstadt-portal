import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'

/**
 * Shared stand-in for pages that are implemented in the components phase
 * (dashboard, parking permit, address change, dog registration, admin).
 */
export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <Stack spacing={2}>
      <Typography variant="h4" component="h1">
        {title}
      </Typography>
      <Alert severity="info">{description}</Alert>
    </Stack>
  )
}

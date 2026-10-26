import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'
import { paths } from '@/router/paths'

export function NotFoundPage() {
  return (
    <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
      <Typography variant="h4" component="h1">
        Seite nicht gefunden
      </Typography>
      <Typography color="text.secondary">Die angeforderte Seite existiert nicht.</Typography>
      <Button variant="contained" component={RouterLink} to={paths.home}>
        Zur Startseite
      </Button>
    </Stack>
  )
}

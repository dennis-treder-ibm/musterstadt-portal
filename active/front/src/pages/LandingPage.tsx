import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth } from '@/context/useAuth'
import { paths } from '@/router/paths'

/** Minimal landing page used to verify that the app, theme and routing work. */
export function LandingPage() {
  const { isAuthenticated } = useAuth()

  return (
    <Paper variant="outlined" sx={{ p: { xs: 3, md: 5 } }}>
      <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Typography variant="h3" component="h1">
          Willkommen im Bürgerportal Musterstadt
        </Typography>
        <Typography color="text.secondary">
          Parkausweis beantragen, Adressänderung melden und Hund anmelden – bequem online.
        </Typography>
        <Button
          variant="contained"
          component={RouterLink}
          to={isAuthenticated ? paths.dashboard : paths.login}
        >
          {isAuthenticated ? 'Zur Startseite' : 'Jetzt anmelden'}
        </Button>
      </Stack>
    </Paper>
  )
}

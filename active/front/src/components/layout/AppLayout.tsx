import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { Link as RouterLink, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { useAuth } from '@/context/useAuth'
import { paths } from '@/router/paths'
import { ThemeModeToggle } from '@/theme/ThemeModeToggle'

const NAV_ITEMS = [
  { to: paths.dashboard, label: 'Startseite' },
  { to: paths.parkingPermit, label: 'Parkausweis' },
  { to: paths.addressChange, label: 'Adressänderung' },
  { to: paths.dogRegistration, label: 'Hundeanmeldung' },
] as const

/** Application shell: header with navigation, theme toggle and login/logout. */
export function AppLayout() {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate(paths.login, { replace: true })
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="primary" enableColorOnDark>
        <Toolbar sx={{ gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="h6" component={RouterLink} to={paths.home} sx={{ color: 'inherit', textDecoration: 'none', mr: 2 }}>
            Bürgerportal Musterstadt
          </Typography>
          <Stack component="nav" aria-label="Hauptnavigation" direction="row" spacing={1} sx={{ flexGrow: 1 }}>
            {isAuthenticated &&
              NAV_ITEMS.map(({ to, label }) => (
                <Button key={to} component={NavLink} to={to} color="inherit">
                  {label}
                </Button>
              ))}
          </Stack>
          <ThemeModeToggle />
          {isAuthenticated ? (
            <Button color="inherit" onClick={handleLogout}>
              Abmelden
            </Button>
          ) : (
            <Button color="inherit" component={RouterLink} to={paths.login}>
              Anmelden
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        <ErrorBoundary resetKeys={[location.pathname]}>
          <Outlet />
        </ErrorBoundary>
      </Container>
    </Box>
  )
}

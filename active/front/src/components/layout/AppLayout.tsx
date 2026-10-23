import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ThemeModeToggle } from '@/components/ThemeModeToggle'
import { useAuth } from '@/context/AuthContext'
import { NAV_ITEMS } from '@/routes/paths'

const DRAWER_WIDTH = 240

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <List component="nav" aria-label="Hauptnavigation">
      {NAV_ITEMS.map(({ label, path, disabled, hint }) => (
        <ListItemButton
          key={label}
          disabled={disabled}
          {...(disabled ? {} : { component: NavLink, to: path, onClick: onNavigate })}
        >
          <ListItemText primary={label} secondary={hint} />
        </ListItemButton>
      ))}
    </List>
  )
}

/** Shell for authenticated pages: app bar, responsive navigation, theme toggle and error boundary. */
export function AppLayout() {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const { session, logout } = useAuth()
  const location = useLocation()

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar sx={{ gap: 1 }}>
          {!isDesktop && (
            <IconButton color="inherit" edge="start" aria-label="Navigation öffnen" onClick={() => setMobileOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="div" noWrap sx={{ flexGrow: 1 }}>
            Bürgerportal Musterstadt
          </Typography>
          <ThemeModeToggle />
          {session && (
            <Button color="inherit" startIcon={<LogoutIcon />} onClick={() => void logout()}>
              {isDesktop ? `Abmelden (${session.username})` : 'Abmelden'}
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isDesktop ? 'permanent' : 'temporary'}
        open={isDesktop || mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ width: DRAWER_WIDTH, flexShrink: 0, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
      >
        <Toolbar />
        <NavList onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Toolbar />
        <Container maxWidth="lg" sx={{ py: 3, flexGrow: 1 }}>
          <ErrorBoundary resetKeys={[location.pathname]}>
            <Outlet />
          </ErrorBoundary>
        </Container>

        {/* Footer */}
        <Divider />
        <Box
          component="footer"
          sx={{
            py: 1.5,
            px: 3,
            display: 'flex',
            flexWrap: 'wrap',
            gap: { xs: 1, sm: 0 },
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            © 2024 Stadtverwaltung Musterstadt &nbsp;|&nbsp;
            <Link href="#" color="inherit" underline="hover">Impressum</Link>
            &nbsp;|&nbsp;
            <Link href="#" color="inherit" underline="hover">Datenschutz</Link>
            &nbsp;|&nbsp;
            <Link href="#" color="inherit" underline="hover">Barrierefreiheit</Link>
          </Typography>
          <Typography variant="caption" color="text.disabled">
            Portal Version 4.0.0 &nbsp;·&nbsp; React + Material UI &nbsp;·&nbsp; Quarkus
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

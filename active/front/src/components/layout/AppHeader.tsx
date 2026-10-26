import MenuIcon from '@mui/icons-material/Menu'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'
import { paths } from '@/router/paths'
import { ThemeModeToggle } from '@/theme/ThemeModeToggle'

interface AppHeaderProps {
  /** Display name for "Angemeldet als"; `undefined` when logged out. */
  username?: string
  /** Shows the menu button (mobile) when a sidebar is available. */
  onMenuClick?: () => void
  onLogout: () => void
}

/** Portal header: title, tagline, current user, theme toggle and login/logout. */
export function AppHeader({ username, onMenuClick, onLogout }: AppHeaderProps) {
  return (
    <AppBar position="sticky" color="primary" enableColorOnDark sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ gap: 2, flexWrap: 'wrap', py: 1 }}>
        {onMenuClick && (
          <IconButton color="inherit" edge="start" aria-label="Navigationsmenü öffnen" onClick={onMenuClick} sx={{ display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
        )}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="h6" component={RouterLink} to={paths.home} sx={{ color: 'inherit', textDecoration: 'none', display: 'block' }}>
            Bürgerportal Musterstadt
          </Typography>
          <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'block' }, opacity: 0.85 }}>
            Ihr digitales Rathaus — rund um die Uhr erreichbar
          </Typography>
        </Box>
        {username && (
          <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
            Angemeldet als: <strong>{username}</strong>
          </Typography>
        )}
        <ThemeModeToggle />
        {username ? (
          <Button color="inherit" variant="outlined" onClick={onLogout}>
            Abmelden
          </Button>
        ) : (
          <Button color="inherit" variant="outlined" component={RouterLink} to={paths.login}>
            Anmelden
          </Button>
        )}
      </Toolbar>
    </AppBar>
  )
}

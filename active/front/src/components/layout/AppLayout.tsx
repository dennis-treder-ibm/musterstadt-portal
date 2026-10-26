import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Link from '@mui/material/Link'
import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { useAuth } from '@/context/useAuth'
import { paths } from '@/router/paths'
import { AppFooter } from './AppFooter'
import { AppHeader } from './AppHeader'
import { Sidebar } from './Sidebar'

const MAIN_ID = 'main-content'

/** Application shell: header, navigation sidebar (authenticated only), content outlet and footer. */
export function AppLayout() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate(paths.login, { replace: true })
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Link
        href={`#${MAIN_ID}`}
        sx={{
          position: 'absolute',
          left: 8,
          top: -48,
          zIndex: (theme) => theme.zIndex.tooltip,
          bgcolor: 'background.paper',
          p: 1,
          '&:focus': { top: 8 },
        }}
      >
        Zum Hauptinhalt springen
      </Link>
      <AppHeader
        username={isAuthenticated ? (user?.displayName ?? 'Benutzer') : undefined}
        onMenuClick={isAuthenticated ? () => setMobileOpen(true) : undefined}
        onLogout={handleLogout}
      />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {isAuthenticated && <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />}
        <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <Container component="main" id={MAIN_ID} tabIndex={-1} maxWidth="lg" sx={{ py: 4, flexGrow: 1, outline: 'none' }}>
            <ErrorBoundary resetKeys={[location.pathname]}>
              <Outlet />
            </ErrorBoundary>
          </Container>
          <AppFooter />
        </Box>
      </Box>
    </Box>
  )
}

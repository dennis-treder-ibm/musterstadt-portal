import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from './paths'

/** Route guard: renders nested routes for signed-in citizens, otherwise redirects to /login. */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname + location.search }} />
  }
  return <Outlet />
}

/**
 * Inverse guard for the login page: signed-in citizens leave it, heading for the page
 * they originally requested (set by ProtectedRoute) or the dashboard.
 */
export function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from
  return isAuthenticated ? <Navigate to={from ?? ROUTES.dashboard} replace /> : <Outlet />
}

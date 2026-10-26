import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/useAuth'
import type { Role } from '@/types/domain'
import { paths } from './paths'

/**
 * Route guard. Wrap protected routes with it as a layout route:
 * `{ element: <RequireAuth />, children: [...] }`.
 * Pass `roles` to additionally require any of the given roles.
 *
 * Client-side guards are UX only - the backend must enforce authorization.
 */
export function RequireAuth({ roles }: { roles?: Role[] }) {
  const { isAuthenticated, hasRole } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) return <Navigate to={paths.login} replace state={{ from: location }} />
  if (roles?.length && !hasRole(...roles)) return <Navigate to={paths.dashboard} replace />
  return <Outlet />
}

/** Keeps authenticated users away from the login page. */
export function PublicOnly() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to={paths.dashboard} replace /> : <Outlet />
}

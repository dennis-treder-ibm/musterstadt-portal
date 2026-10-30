import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { authService, setUnauthorizedHandler } from '@/services'
import { sessionStore, type StoredSession } from '@/services/http/sessionStorage'
import { Role } from '@/types/domain'
import { logger } from '@/utils/logger'
import { AuthContext, type AuthContextValue, type AuthUser } from './AuthContext'

/** The backend exposes no roles; every logged-in user is a citizen. */
function toUser(session: StoredSession): AuthUser {
  return { citizenId: session.citizenId, displayName: session.username, roles: [Role.Citizen] }
}

function restoreSession(): AuthUser | null {
  const session = sessionStore.get()
  return session ? toUser(session) : null
}

/** Restores the session from sessionStorage and exposes login/logout. */
export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(restoreSession)

  useEffect(() => {
    // Any 401 from the API drops the session; route guards then redirect to /login.
    setUnauthorizedHandler(() => setUser(null))
    return () => setUnauthorizedHandler(null)
  }, [])

  const login = useCallback<AuthContextValue['login']>(async (username, password) => {
    const response = await authService.login({ username, password })
    const session: StoredSession = { citizenId: response.citizenId, username: response.username }
    sessionStore.set(session)
    setUser(toUser(session))
  }, [])

  const logout = useCallback<AuthContextValue['logout']>(async () => {
    try {
      await authService.logout()
    } catch (error) {
      // Local logout must succeed even if the server call fails.
      logger.warn('Server logout failed', { error: error instanceof Error ? error.message : 'unknown' })
    } finally {
      sessionStore.clear()
      setUser(null)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      login,
      logout,
      hasRole: (...roles) => roles.some((r) => user?.roles.includes(r)),
    }),
    [user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

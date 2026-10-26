import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { authService, decodeJwtPayload, isTokenExpired, setUnauthorizedHandler, tokenStorage } from '@/services'
import { Role } from '@/types/domain'
import { logger } from '@/utils/logger'
import { AuthContext, type AuthContextValue, type AuthUser } from './AuthContext'

interface JwtClaims extends Record<string, unknown> {
  sub?: string
  citizenId?: number
  name?: string
  groups?: string[] // SmallRye JWT default roles claim
}

const KNOWN_ROLES = new Set<string>(Object.values(Role))

function userFromToken(token: string): AuthUser | null {
  if (isTokenExpired(token)) return null
  const claims = decodeJwtPayload<JwtClaims>(token)
  if (!claims) return null
  const citizenId = Number(claims.citizenId ?? claims.sub)
  if (!Number.isFinite(citizenId)) return null
  const roles = (claims.groups ?? []).filter((g): g is Role => KNOWN_ROLES.has(g))
  return { citizenId, displayName: claims.name, roles: roles.length ? roles : [Role.Citizen] }
}

function restoreSession(): AuthUser | null {
  const token = tokenStorage.get()
  if (!token) return null
  const restored = userFromToken(token)
  if (!restored) tokenStorage.clear()
  return restored
}

/** Restores the session from a stored JWT and exposes login/logout. */
export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(restoreSession)

  useEffect(() => {
    // Any 401 from the API drops the session; route guards then redirect to /login.
    setUnauthorizedHandler(() => setUser(null))
    return () => setUnauthorizedHandler(null)
  }, [])

  const login = useCallback<AuthContextValue['login']>(async (username, password) => {
    const response = await authService.login({ username, password })
    tokenStorage.set(response.accessToken)
    setUser({
      citizenId: response.citizenId,
      displayName: response.displayName,
      roles: response.roles?.length ? response.roles : [Role.Citizen],
    })
  }, [])

  const logout = useCallback<AuthContextValue['logout']>(async () => {
    try {
      await authService.logout()
    } catch (error) {
      // Local logout must succeed even if the server call fails.
      logger.warn('Server logout failed', { error: error instanceof Error ? error.message : 'unknown' })
    } finally {
      tokenStorage.clear()
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

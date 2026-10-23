import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi } from '@/services/auth/authApi'
import { clearSession, loadSession, saveSession, type AuthSession } from '@/services/auth/authSession'
import { setUnauthorizedHandler } from '@/services/http'
import type { LoginRequest } from '@/types/domain'
import { logger } from '@/utils/logger'

interface AuthContextValue {
  session: AuthSession | null
  isAuthenticated: boolean
  /** Throws ApiError on failure (e.g. 401 with the German message from the backend). */
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => loadSession())

  const endSession = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  // A 401 on an authenticated request means the identity is no longer accepted: drop the session.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      logger.warn('Session rejected by server (401) – signing out')
      endSession()
    })
    return () => setUnauthorizedHandler(null)
  }, [endSession])

  const login = useCallback(async (credentials: LoginRequest) => {
    const response = await authApi.login(credentials)
    if (!response.success || response.citizenId === null) {
      throw new Error(response.message)
    }
    const next: AuthSession = { citizenId: response.citizenId, username: response.username ?? credentials.username }
    saveSession(next)
    setSession(next)
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch (error) {
      // The backend logout is a stateless no-op; never block signing out on it.
      logger.warn('Logout request failed – clearing local session anyway', { error: String(error) })
    } finally {
      endSession()
    }
  }, [endSession])

  const value = useMemo<AuthContextValue>(
    () => ({ session, isAuthenticated: session !== null, login, logout }),
    [session, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

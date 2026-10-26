import { createContext } from 'react'
import type { Role } from '@/types/domain'

export interface AuthUser {
  citizenId: number
  /** Login name shown in the header ("Angemeldet als: …"). */
  displayName?: string
  roles: Role[]
}

export interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  hasRole: (...roles: Role[]) => boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)

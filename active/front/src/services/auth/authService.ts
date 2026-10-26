import type { Role } from '@/types/domain'
import { BaseService } from '../http/BaseService'

export interface LoginRequest {
  username: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  citizenId: number
  displayName?: string
  roles?: Role[]
}

/**
 * Authentication endpoints. The backend contract is not implemented yet
 * (architecture.md 3.1 describes the legacy session login); the path below is
 * the assumed Quarkus endpoint and may be adjusted once the API exists.
 */
class AuthService extends BaseService {
  constructor() {
    super('/auth')
  }

  login(request: LoginRequest): Promise<AuthResponse> {
    return this.post<AuthResponse, LoginRequest>('/login', request)
  }

  logout(): Promise<void> {
    return this.post<void>('/logout')
  }
}

export const authService = new AuthService()

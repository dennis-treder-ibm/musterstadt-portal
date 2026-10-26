import { BaseService } from '../http/BaseService'

export interface LoginRequest {
  username: string
  password: string
}

/** Response of `POST /api/auth/login` (200 on success, 401 with `success: false` otherwise). */
export interface AuthResponse {
  success: boolean
  message?: string
  citizenId: number
  username: string
}

/** Authentication endpoints of the stateless REST backend. */
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

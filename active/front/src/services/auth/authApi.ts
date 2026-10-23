import { api } from '@/services/http'
import type { LoginRequest, LoginResponse } from '@/types/domain'

/**
 * Auth endpoints (AuthResource): POST /api/auth/login, POST /api/auth/logout.
 * This is the only service implemented in the foundation because the AuthProvider depends on it.
 */
export const authApi = {
  login: (credentials: LoginRequest) => api.post<LoginResponse>('/auth/login', credentials, { retry: false }),
  logout: () => api.post<LoginResponse>('/auth/logout', undefined, { retry: false }),
}

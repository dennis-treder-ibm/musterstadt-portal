import http from './http';
import type { LoginRequest, LoginResponse } from '@/types/api';

export const authService = {
  login(req: LoginRequest): Promise<LoginResponse> {
    return http.post<LoginResponse>('/auth/login', req).then((r) => r.data);
  },
  logout(): Promise<void> {
    return http.post('/auth/logout').then(() => undefined);
  },
};

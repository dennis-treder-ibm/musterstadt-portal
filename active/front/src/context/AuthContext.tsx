import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { authService } from '@/services/authService';
import { storeToken, clearToken, getStoredToken } from '@/services/http';
import type { LoginRequest } from '@/types/api';

interface AuthState {
  token: string | null;
  citizenId: number | null;
  citizenName: string | null;
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  login: (req: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const token = getStoredToken();
    return {
      token,
      citizenId: token ? Number(sessionStorage.getItem('bp_citizen_id')) : null,
      citizenName: token ? sessionStorage.getItem('bp_citizen_name') : null,
    };
  });

  const login = useCallback(async (req: LoginRequest) => {
    const res = await authService.login(req);
    storeToken(res.token);
    sessionStorage.setItem('bp_citizen_id', String(res.citizenId));
    sessionStorage.setItem('bp_citizen_name', res.citizenName);
    setState({ token: res.token, citizenId: res.citizenId, citizenName: res.citizenName });
  }, []);

  const logout = useCallback(async () => {
    await authService.logout().catch(() => {/* ignore logout errors */});
    clearToken();
    sessionStorage.removeItem('bp_citizen_id');
    sessionStorage.removeItem('bp_citizen_name');
    setState({ token: null, citizenId: null, citizenName: null });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, isAuthenticated: !!state.token, login, logout }),
    [state, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

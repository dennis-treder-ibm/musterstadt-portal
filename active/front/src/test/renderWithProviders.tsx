import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext, type AuthContextValue } from '@/context/AuthContext'
import { Role } from '@/types/domain'
import { AppThemeProvider } from '@/theme/AppThemeProvider'

export function createAuthValue(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    user: { citizenId: 1, displayName: 'buerger', roles: [Role.Citizen] },
    isAuthenticated: true,
    login: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn().mockResolvedValue(undefined),
    hasRole: () => true,
    ...overrides,
  }
}

/** Renders `ui` inside theme, router and (fake) auth context. */
export function renderWithProviders(ui: ReactElement, options: { route?: string; auth?: Partial<AuthContextValue> } = {}) {
  return render(
    <AppThemeProvider>
      <AuthContext.Provider value={createAuthValue(options.auth)}>
        <MemoryRouter initialEntries={[options.route ?? '/']}>{ui}</MemoryRouter>
      </AuthContext.Provider>
    </AppThemeProvider>,
  )
}

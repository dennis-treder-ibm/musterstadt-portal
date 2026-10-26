import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { AuthContext, type AuthContextValue } from '@/context/AuthContext'
import { Role } from '@/types/domain'
import { PublicOnly, RequireAuth } from './guards'

function auth(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  const roles = overrides.user?.roles ?? []
  return {
    user: null,
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
    hasRole: (...r) => r.some((x) => roles.includes(x)),
    ...overrides,
  }
}

function renderAt(path: string, ctx: AuthContextValue, adminOnly = false) {
  const router = createMemoryRouter(
    [
      { path: '/login', element: <PublicOnly />, children: [{ index: true, element: <div>login page</div> }] },
      { path: '/dashboard', element: <div>dashboard page</div> },
      {
        element: <RequireAuth roles={adminOnly ? [Role.Admin] : undefined} />,
        children: [{ path: '/secret', element: <div>secret page</div> }],
      },
    ],
    { initialEntries: [path] },
  )
  return render(
    <AuthContext.Provider value={ctx}>
      <RouterProvider router={router} />
    </AuthContext.Provider>,
  )
}

const citizen = { citizenId: 1, roles: [Role.Citizen] }

describe('route guards', () => {
  it('redirects anonymous users to /login', () => {
    renderAt('/secret', auth())
    expect(screen.getByText('login page')).toBeInTheDocument()
  })

  it('lets authenticated users through', () => {
    renderAt('/secret', auth({ user: citizen, isAuthenticated: true }))
    expect(screen.getByText('secret page')).toBeInTheDocument()
  })

  it('enforces roles', () => {
    renderAt('/secret', auth({ user: citizen, isAuthenticated: true }), true)
    expect(screen.getByText('dashboard page')).toBeInTheDocument()
  })

  it('PublicOnly redirects authenticated users to the dashboard', () => {
    renderAt('/login', auth({ user: citizen, isAuthenticated: true }))
    expect(screen.getByText('dashboard page')).toBeInTheDocument()
  })
})

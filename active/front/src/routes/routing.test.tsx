import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '@/context/AuthContext'
import { routes } from '@/routes/router'
import { saveSession } from '@/services/auth/authSession'
import { AppThemeProvider } from '@/theme/AppThemeProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'

vi.mock('@/services/auth/authApi', () => ({
  authApi: {
    login: vi.fn(async ({ username, password }: { username: string; password: string }) =>
      username === 'buerger' && password === 'demo-password'
        ? { success: true, message: 'ok', citizenId: 1, username }
        : Promise.reject(Object.assign(new Error('Anmeldung fehlgeschlagen.'), { name: 'ApiError', code: 'UNAUTHORIZED', status: 401 })),
    ),
    logout: vi.fn(async () => ({ success: true, message: 'ok', citizenId: null, username: null })),
  },
}))

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <AppThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </AppThemeProvider>,
  )
  return router
}

describe('routing and guards', () => {
  it('redirects unauthenticated users from protected routes to /login', async () => {
    const router = renderAt('/parking')
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(screen.getByRole('heading', { name: /Willkommen im Bürgerportal Musterstadt/ })).toBeInTheDocument()
  })

  it('redirects / to the dashboard for signed-in citizens', async () => {
    saveSession({ citizenId: 1, username: 'buerger' })
    const router = renderAt('/')
    await waitFor(() => expect(router.state.location.pathname).toBe('/dashboard'))
    expect(screen.getAllByText('Startseite').length).toBeGreaterThan(0)
  })

  it('keeps signed-in citizens away from /login', async () => {
    saveSession({ citizenId: 1, username: 'buerger' })
    const router = renderAt('/login')
    await waitFor(() => expect(router.state.location.pathname).toBe('/dashboard'))
  })

  it('shows the not-found page for unknown routes', async () => {
    saveSession({ citizenId: 1, username: 'buerger' })
    renderAt('/does-not-exist')
    expect(await screen.findByText('Seite nicht gefunden')).toBeInTheDocument()
  })

  it('signs in with valid credentials and navigates to the originally requested page', async () => {
    const user = userEvent.setup()
    const router = renderAt('/dogs')
    await screen.findByLabelText(/Benutzername/)

    await user.type(screen.getByLabelText(/Benutzername/), 'buerger')
    await user.type(screen.getByLabelText(/Kennwort/), 'demo-password')
    await user.click(screen.getByRole('button', { name: 'Anmelden' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/dogs'))
    expect(JSON.parse(window.sessionStorage.getItem('musterstadt.session') ?? '{}')).toMatchObject({ citizenId: 1 })
  })

  it('shows an error for invalid credentials and stays on /login', async () => {
    const user = userEvent.setup()
    const router = renderAt('/login')

    await user.type(await screen.findByLabelText(/Benutzername/), 'falsch')
    await user.type(screen.getByLabelText(/Kennwort/), 'falsch')
    await user.click(screen.getByRole('button', { name: 'Anmelden' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Anmeldung fehlgeschlagen.')
    expect(router.state.location.pathname).toBe('/login')
  })

  it('signs out and returns to /login', async () => {
    saveSession({ citizenId: 1, username: 'buerger' })
    const user = userEvent.setup()
    const router = renderAt('/dashboard')

    await user.click(await screen.findByRole('button', { name: /Abmelden/ }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(window.sessionStorage.getItem('musterstadt.session')).toBeNull()
  })
})

describe('ErrorBoundary', () => {
  function Boom(): never {
    throw new Error('kaputt')
  }

  it('renders a fallback instead of crashing and can recover', async () => {
    const user = userEvent.setup()
    let shouldThrow = true
    function Maybe() {
      if (shouldThrow) throw new Error('kaputt')
      return <p>wieder da</p>
    }

    render(
      <AppThemeProvider>
        <ErrorBoundary>
          <Maybe />
        </ErrorBoundary>
      </AppThemeProvider>,
    )
    // React logs caught render errors; keep the output clean.
    expect(screen.getByRole('alert')).toHaveTextContent('Etwas ist schiefgelaufen')

    shouldThrow = false
    await user.click(screen.getByRole('button', { name: 'Erneut versuchen' }))
    expect(screen.getByText('wieder da')).toBeInTheDocument()
  })

  it('supports a custom fallback', () => {
    render(
      <ErrorBoundary fallback={(error) => <p>Fehler: {error.message}</p>}>
        <Boom />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Fehler: kaputt')).toBeInTheDocument()
  })
})

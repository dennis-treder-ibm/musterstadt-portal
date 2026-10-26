import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthProvider'
import { AppThemeProvider } from '@/theme/AppThemeProvider'
import { routes } from '@/router/routes'

function renderApp(path = '/') {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(
    <AppThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </AppThemeProvider>,
  )
}

beforeAll(() => {
  // jsdom lacks matchMedia, which MUI uses to resolve the 'system' colour scheme.
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    onchange: null,
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
})

describe('App', () => {
  it('renders the landing page with welcome message', async () => {
    renderApp('/')
    expect(await screen.findByRole('heading', { name: /Willkommen im Bürgerportal Musterstadt/ })).toBeInTheDocument()
  })

  it('redirects anonymous users from protected routes to login', async () => {
    renderApp('/parking')
    expect(await screen.findByRole('heading', { name: 'Anmeldung' })).toBeInTheDocument()
  })

  it('shows 404 for unknown routes', async () => {
    renderApp('/does-not-exist')
    expect(await screen.findByRole('heading', { name: 'Seite nicht gefunden' })).toBeInTheDocument()
  })

  it('offers system, light and dark modes with system as default', async () => {
    renderApp('/')
    const system = await screen.findByRole('button', { name: 'System' })
    expect(system).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(screen.getByRole('button', { name: 'Dunkel' }))
    expect(screen.getByRole('button', { name: 'Dunkel' })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(screen.getByRole('button', { name: 'Hell' }))
    expect(screen.getByRole('button', { name: 'Hell' })).toHaveAttribute('aria-pressed', 'true')
  })
})

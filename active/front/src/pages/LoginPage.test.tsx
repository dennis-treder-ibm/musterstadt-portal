import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { ApiError } from '@/services'
import { renderWithProviders } from '@/test/renderWithProviders'
import { LoginPage } from './LoginPage'

function renderLogin(login = vi.fn().mockResolvedValue(undefined)) {
  renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<h1>Dashboard-Ziel</h1>} />
    </Routes>,
    { route: '/login', auth: { user: null, isAuthenticated: false, login } },
  )
  return login
}

describe('LoginPage', () => {
  it('requires username and password', async () => {
    const login = renderLogin()
    await userEvent.click(screen.getByRole('button', { name: 'Anmelden' }))
    expect(await screen.findByText('Bitte geben Sie Ihren Benutzernamen ein.')).toBeInTheDocument()
    expect(screen.getByText('Bitte geben Sie Ihr Kennwort ein.')).toBeInTheDocument()
    expect(login).not.toHaveBeenCalled()
  })

  it('logs in and navigates to the dashboard', async () => {
    const login = renderLogin()
    await userEvent.type(screen.getByLabelText(/Benutzername/), 'buerger')
    await userEvent.type(screen.getByLabelText(/Kennwort/), 'demo-password')
    await userEvent.click(screen.getByRole('button', { name: 'Anmelden' }))
    expect(await screen.findByRole('heading', { name: 'Dashboard-Ziel' })).toBeInTheDocument()
    expect(login).toHaveBeenCalledWith('buerger', 'demo-password')
  })

  it('shows the legacy failure message on bad credentials (401)', async () => {
    renderLogin(vi.fn().mockRejectedValue(new ApiError('unauthorized', 'nope', { status: 401 })))
    await userEvent.type(screen.getByLabelText(/Benutzername/), 'x')
    await userEvent.type(screen.getByLabelText(/Kennwort/), 'y')
    await userEvent.click(screen.getByRole('button', { name: 'Anmelden' }))
    await waitFor(() => expect(screen.getAllByRole('alert')[0]).toHaveTextContent('Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.'))
    expect(screen.queryByRole('heading', { name: 'Dashboard-Ziel' })).not.toBeInTheDocument()
  })
})

import { screen } from '@testing-library/react'
import { ApiError } from '@/services'
import { renderWithProviders } from '@/test/renderWithProviders'
import type { DashboardSummary } from '@/types/dto'
import { DashboardPage } from './DashboardPage'

const getSummary = vi.fn()
vi.mock('@/services', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services')>()),
  dashboardService: { getSummary: () => getSummary() },
}))

const summary: DashboardSummary = {
  parkingPermitCount: 3,
  dogRegistrationCount: 2,
  openApplicationCount: 4,
  totalApplicationCount: 9,
  approvedCount: 6,
  rejectedCount: 1,
  parkingApplicationCount: 5,
  addressApplicationCount: 4,
  recentActivity: [
    { id: 1, type: 'PARKING', typeDisplay: 'Parkausweis', status: 'PENDING', statusDisplay: 'Ausstehend', createdDate: '2024-03-01T10:00:00' },
  ],
}

describe('DashboardPage', () => {
  beforeEach(() => {
    getSummary.mockReset()
  })

  it('renders welcome text, figures, activity and quick links', async () => {
    getSummary.mockResolvedValue(summary)
    renderWithProviders(<DashboardPage />)

    expect(screen.getByRole('heading', { name: 'Willkommen im Bürgerportal Musterstadt' })).toBeInTheDocument()
    expect(screen.getByText(/angemeldet als buerger/)).toBeInTheDocument()
    expect(await screen.findByText('Parkausweise')).toBeInTheDocument()
    expect(screen.getByText('Offene Anträge')).toBeInTheDocument()
    expect(screen.getByText('Genehmigte Anträge')).toBeInTheDocument()
    expect(screen.getByText('Abgelehnte Anträge')).toBeInTheDocument()
    expect(screen.getByRole('table', { name: 'Letzte Vorgänge' })).toBeInTheDocument()
    expect(screen.getByText('Parkausweis beantragen')).toBeInTheDocument()
    expect(screen.getByText(/Hochwasserhilfe befindet sich derzeit in Entwicklung/)).toBeInTheDocument()
  })

  it('shows a loading indicator first', () => {
    getSummary.mockReturnValue(new Promise(() => undefined))
    renderWithProviders(<DashboardPage />)
    expect(screen.getByText('Übersicht wird geladen …')).toBeInTheDocument()
  })

  it('shows an error with retry when the API fails', async () => {
    getSummary.mockRejectedValue(new ApiError('server', 'x', { status: 500 }))
    renderWithProviders(<DashboardPage />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Serverfehler')
    expect(screen.getByRole('button', { name: 'Erneut versuchen' })).toBeInTheDocument()
  })
})

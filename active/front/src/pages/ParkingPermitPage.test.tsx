import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/renderWithProviders'
import { ParkingPermitPage } from './ParkingPermitPage'

const listApplications = vi.fn()
const listZones = vi.fn()
const submitApplication = vi.fn()
vi.mock('@/services', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services')>()),
  parkingService: {
    listApplications: () => listApplications(),
    listZones: () => listZones(),
    submitApplication: (r: unknown) => submitApplication(r),
  },
}))

describe('ParkingPermitPage', () => {
  beforeEach(() => {
    listApplications.mockReset().mockResolvedValue([])
    listZones.mockReset().mockResolvedValue(['Zone A', 'Zone B'])
    submitApplication.mockReset().mockResolvedValue({ id: 42 })
  })

  it('validates required fields with legacy messages', async () => {
    renderWithProviders(<ParkingPermitPage />)
    await userEvent.type(screen.getByLabelText(/Fahrzeugkennzeichen/), 'M-1')
    await userEvent.click(screen.getByRole('button', { name: 'Antrag einreichen' }))

    expect(await screen.findByText('Fahrzeugkennzeichen muss mindestens 5 Zeichen lang sein.')).toBeInTheDocument()
    expect(screen.getByText('Bitte wählen Sie eine Parkzone aus.')).toBeInTheDocument()
    expect(submitApplication).not.toHaveBeenCalled()
  })

  it('submits a normalised application and reports the application number', async () => {
    renderWithProviders(<ParkingPermitPage />)
    await userEvent.type(screen.getByLabelText(/Fahrzeugkennzeichen/), ' m-ab 123 ')
    await userEvent.click(screen.getByRole('combobox', { name: /Parkzone/ }))
    await userEvent.click(within(await screen.findByRole('listbox')).getByRole('option', { name: 'Zone B' }))
    await userEvent.click(screen.getByRole('button', { name: 'Antrag einreichen' }))

    expect(submitApplication).toHaveBeenCalledWith({ vehicleRegistration: 'M-AB 123', zone: 'Zone B' })
    expect(await screen.findByText(/Antragsnummer: 42/)).toBeInTheDocument()
  })

  it('lists existing applications and the static zone overview', async () => {
    listApplications.mockResolvedValue([{ id: 7, type: 'PARKING', status: 'APPROVED', createdDate: '2024-03-01T10:00:00' }])
    renderWithProviders(<ParkingPermitPage />)
    expect(await screen.findByText('Genehmigt')).toBeInTheDocument()
    expect(screen.getByRole('table', { name: 'Parkzonen-Übersicht' })).toBeInTheDocument()
  })
})

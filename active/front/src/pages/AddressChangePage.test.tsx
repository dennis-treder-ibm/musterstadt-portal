import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/renderWithProviders'
import { AddressChangePage } from './AddressChangePage'

const listApplications = vi.fn()
const submitChange = vi.fn()
vi.mock('@/services', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services')>()),
  addressService: { listApplications: () => listApplications(), submitChange: (r: unknown) => submitChange(r) },
}))

describe('AddressChangePage', () => {
  beforeEach(() => {
    listApplications.mockReset().mockResolvedValue([])
    submitChange.mockReset().mockResolvedValue({ id: 9 })
  })

  it('requires street and city and a valid postcode', async () => {
    renderWithProviders(<AddressChangePage />)
    await userEvent.type(screen.getByLabelText(/Postleitzahl/), '12')
    await userEvent.click(screen.getByRole('button', { name: 'Änderung beantragen' }))

    expect(await screen.findByText('Straße darf nicht leer sein.')).toBeInTheDocument()
    expect(screen.getByText('Ort darf nicht leer sein.')).toBeInTheDocument()
    expect(screen.getByText('Die Postleitzahl muss aus genau 5 Ziffern bestehen.')).toBeInTheDocument()
    expect(submitChange).not.toHaveBeenCalled()
  })

  it('submits the trimmed address and shows the application number', async () => {
    renderWithProviders(<AddressChangePage />)
    await userEvent.type(screen.getByLabelText(/Straße/), ' Hauptstraße ')
    await userEvent.type(screen.getByLabelText(/Hausnummer/), '5')
    await userEvent.type(screen.getByLabelText(/Postleitzahl/), '80331')
    await userEvent.type(screen.getByLabelText(/^Ort/), 'Musterstadt')
    await userEvent.click(screen.getByRole('button', { name: 'Änderung beantragen' }))

    expect(submitChange).toHaveBeenCalledWith({ street: 'Hauptstraße', houseNumber: '5', postcode: '80331', city: 'Musterstadt' })
    expect(await screen.findByText(/Antragsnummer: 9/)).toBeInTheDocument()
  })

  it('shows the legal notice', async () => {
    renderWithProviders(<AddressChangePage />)
    await screen.findByRole('table', { name: 'Meine Adressänderungs-Anträge' })
    expect(screen.getByText(/§ 17 Bundesmeldegesetz/)).toBeInTheDocument()
  })
})

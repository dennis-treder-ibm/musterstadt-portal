import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/renderWithProviders'
import { DogRegistrationPage } from './DogRegistrationPage'

const list = vi.fn()
const search = vi.fn()
const register = vi.fn()
const update = vi.fn()
vi.mock('@/services', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services')>()),
  dogService: {
    list: () => list(),
    search: (q: string) => search(q),
    register: (r: unknown) => register(r),
    update: (id: number, r: unknown) => update(id, r),
  },
}))

const dogs = [
  { id: 1, dogName: 'Rex', breed: 'Schäferhund', registrationDate: '2024-01-10', chipNumber: '123456789012345' },
  { id: 2, dogName: 'Bello', registrationDate: '2024-02-10' },
]

describe('DogRegistrationPage', () => {
  beforeEach(() => {
    list.mockReset().mockResolvedValue(dogs)
    search.mockReset().mockResolvedValue([dogs[1]])
    register.mockReset().mockResolvedValue({ id: 3 })
    update.mockReset().mockResolvedValue({ ...dogs[0], dogName: 'Rexi' })
  })

  it('lists dogs sorted by registration number (newest first) with the owner shown read-only', async () => {
    renderWithProviders(<DogRegistrationPage />)
    const table = await screen.findByRole('table', { name: 'Meine registrierten Hunde' })
    const rows = within(table).getAllByRole('row').slice(1)
    expect(within(rows[0]!).getByText('Bello')).toBeInTheDocument()
    expect(screen.getByLabelText('Besitzer')).toHaveValue('buerger')
    expect(screen.getByLabelText('Besitzer')).toHaveAttribute('readonly')
  })

  it('validates name and chip number', async () => {
    renderWithProviders(<DogRegistrationPage />)
    await userEvent.type(screen.getByLabelText(/Chip-Nummer/), '123')
    await userEvent.click(screen.getByRole('button', { name: 'Hund anmelden' }))
    expect(await screen.findByText('Hundename darf nicht leer sein.')).toBeInTheDocument()
    expect(screen.getByText('Die Chipnummer muss aus 15 Ziffern bestehen.')).toBeInTheDocument()
    expect(register).not.toHaveBeenCalled()
  })

  it('registers a dog and shows the registration number', async () => {
    renderWithProviders(<DogRegistrationPage />)
    await userEvent.type(screen.getByLabelText(/Hundename/), 'Luna')
    await userEvent.click(screen.getByRole('button', { name: 'Hund anmelden' }))
    expect(register).toHaveBeenCalledWith({ dogName: 'Luna' })
    expect(await screen.findByText('Hund erfolgreich angemeldet. Registrierungsnummer: 3')).toBeInTheDocument()
  })

  it('searches and resets the search', async () => {
    renderWithProviders(<DogRegistrationPage />)
    await screen.findByText('Rex')
    await userEvent.type(screen.getByLabelText('Suchbegriff'), 'Bello')
    await userEvent.click(screen.getByRole('button', { name: 'Suchen' }))
    await waitFor(() => expect(search).toHaveBeenCalledWith('Bello'))

    const searchForm = screen.getByRole('search')
    await userEvent.click(within(searchForm).getByRole('button', { name: 'Zurücksetzen' }))
    await waitFor(() => expect(screen.getByLabelText('Suchbegriff')).toHaveValue(''))
    expect(await screen.findByText('Rex')).toBeInTheDocument()
  })

  it('edits a dog via the dialog', async () => {
    renderWithProviders(<DogRegistrationPage />)
    await userEvent.click(await screen.findByRole('button', { name: 'Hund Rex bearbeiten' }))
    const dialog = await screen.findByRole('dialog')
    const name = within(dialog).getByLabelText(/Hundename/)
    await userEvent.clear(name)
    await userEvent.type(name, 'Rexi')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Speichern' }))

    expect(update).toHaveBeenCalledWith(1, { dogName: 'Rexi', breed: 'Schäferhund' })
    expect(await screen.findByText('Hund erfolgreich aktualisiert.')).toBeInTheDocument()
  })

  it('shows the dog tax information', async () => {
    renderWithProviders(<DogRegistrationPage />)
    expect(await screen.findByText('60,00 € / Jahr')).toBeInTheDocument()
    expect(screen.getByText('900,00 € / Jahr')).toBeInTheDocument()
  })
})

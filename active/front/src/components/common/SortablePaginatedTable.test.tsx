import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SortablePaginatedTable, type DataColumn } from './SortablePaginatedTable'

interface Row {
  id: number
  name: string
}
const columns: ReadonlyArray<DataColumn<Row>> = [
  { id: 'id', header: 'Nr', render: (r) => r.id, sortValue: (r) => r.id },
  { id: 'name', header: 'Name', render: (r) => r.name, sortValue: (r) => r.name },
  { id: 'static', header: 'Info', render: () => 'x' },
]
const rows: Row[] = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: `Hund ${String.fromCharCode(65 + i)}` }))

const bodyNames = () =>
  within(screen.getAllByRole('rowgroup')[1]!)
    .getAllByRole('row')
    .map((r) => within(r).getAllByRole('cell')[1]?.textContent)

describe('SortablePaginatedTable', () => {
  it('shows the empty message', () => {
    render(<SortablePaginatedTable caption="Test" columns={columns} rows={[]} getRowId={(r) => r.id} emptyMessage="Keine Einträge gefunden." />)
    expect(screen.getByText('Keine Einträge gefunden.')).toBeInTheDocument()
  })

  it('paginates with 10 rows by default and navigates pages', async () => {
    render(<SortablePaginatedTable caption="Test" columns={columns} rows={rows} getRowId={(r) => r.id} />)
    expect(bodyNames()).toHaveLength(10)
    expect(screen.getByText('1–10 von 12')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /nächste seite|next page/i }))
    expect(bodyNames()).toHaveLength(2)
  })

  it('sorts ascending then descending when clicking a header', async () => {
    render(<SortablePaginatedTable caption="Test" columns={columns} rows={rows.slice(0, 3)} getRowId={(r) => r.id} defaultSort={{ columnId: 'name', direction: 'asc' }} />)
    expect(bodyNames()).toEqual(['Hund A', 'Hund B', 'Hund C'])

    await userEvent.click(screen.getByRole('button', { name: 'Name' }))
    expect(bodyNames()).toEqual(['Hund C', 'Hund B', 'Hund A'])
  })

  it('renders unsortable columns without a sort button', () => {
    render(<SortablePaginatedTable caption="Test" columns={columns} rows={rows.slice(0, 2)} getRowId={(r) => r.id} />)
    expect(screen.queryByRole('button', { name: 'Info' })).not.toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Info' })).toBeInTheDocument()
  })
})

import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import { useMemo, useState, type ReactNode } from 'react'

export type SortDirection = 'asc' | 'desc'

export interface DataColumn<T> {
  id: string
  header: string
  /** Cell content. */
  render: (row: T) => ReactNode
  /** Value used for sorting; omit to make the column unsortable. */
  sortValue?: (row: T) => string | number
  align?: 'left' | 'right' | 'center'
}

interface SortablePaginatedTableProps<T> {
  /** Accessible table name (also used as caption for screen readers). */
  caption: string
  columns: ReadonlyArray<DataColumn<T>>
  rows: ReadonlyArray<T>
  getRowId: (row: T) => string | number
  emptyMessage?: string
  rowsPerPageOptions?: ReadonlyArray<number>
  defaultRowsPerPage?: number
  /** Initial sort; defaults to unsorted (server order). */
  defaultSort?: { columnId: string; direction: SortDirection }
}

function compare(a: string | number, b: string | number): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), 'de', { sensitivity: 'base', numeric: true })
}

/** MUI table with client-side sorting and pagination (German labels, keyboard-accessible sort headers). */
export function SortablePaginatedTable<T>({
  caption,
  columns,
  rows,
  getRowId,
  emptyMessage = 'Keine Einträge gefunden.',
  rowsPerPageOptions = [5, 10, 25],
  defaultRowsPerPage = 10,
  defaultSort,
}: SortablePaginatedTableProps<T>) {
  const [sort, setSort] = useState(defaultSort)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage)

  const sortedRows = useMemo(() => {
    const column = columns.find((c) => c.id === sort?.columnId)
    if (!column?.sortValue || !sort) return rows
    const { sortValue } = column
    const factor = sort.direction === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => factor * compare(sortValue(a), sortValue(b)))
  }, [rows, columns, sort])

  // Clamp when the row count shrinks (e.g. after a search).
  const lastPage = Math.max(0, Math.ceil(sortedRows.length / rowsPerPage) - 1)
  const currentPage = Math.min(page, lastPage)
  const visibleRows = sortedRows.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage)

  const toggleSort = (columnId: string) => {
    setSort((prev) =>
      prev?.columnId === columnId && prev.direction === 'asc' ? { columnId, direction: 'desc' } : { columnId, direction: 'asc' },
    )
  }

  return (
    <Paper variant="outlined">
      <TableContainer>
        <Table size="small" aria-label={caption}>
          <caption style={{ position: 'absolute', left: -10000 }}>{caption}</caption>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  sortDirection={sort?.columnId === column.id ? sort.direction : false}
                  sx={{ fontWeight: 600 }}
                >
                  {column.sortValue ? (
                    <TableSortLabel
                      active={sort?.columnId === column.id}
                      direction={sort?.columnId === column.id ? sort.direction : 'asc'}
                      onClick={() => toggleSort(column.id)}
                    >
                      {column.header}
                    </TableSortLabel>
                  ) : (
                    column.header
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((row) => (
                <TableRow key={getRowId(row)} hover>
                  {columns.map((column) => (
                    <TableCell key={column.id} align={column.align}>
                      {column.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {sortedRows.length > Math.min(...rowsPerPageOptions) && (
        <TablePagination
          component="div"
          count={sortedRows.length}
          page={currentPage}
          onPageChange={(_event, next) => setPage(next)}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[...rowsPerPageOptions]}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(Number(event.target.value))
            setPage(0)
          }}
          labelRowsPerPage="Einträge pro Seite"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} von ${count}`}
        />
      )}
    </Paper>
  )
}

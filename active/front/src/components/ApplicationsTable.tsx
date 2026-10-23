import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { StatusChip } from '@/components/StatusChip'
import type { Application } from '@/types/domain'
import { formatDate } from '@/utils/format'

interface ApplicationsTableProps {
  applications: Application[]
  /** Additional columns to render after the fixed columns. */
  extraColumns?: Array<{
    header: string
    render: (app: Application) => React.ReactNode
  }>
  emptyMessage?: string
}

/**
 * Reusable table for listing Application records.
 * Used on both ParkingPage and AddressPage.
 */
export function ApplicationsTable({
  applications,
  extraColumns = [],
  emptyMessage = 'Keine Anträge vorhanden.',
}: ApplicationsTableProps) {
  if (applications.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 2 }}>
        {emptyMessage}
      </Typography>
    )
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" aria-label="Anträge">
        <TableHead>
          <TableRow sx={{ '& th': { fontWeight: 700 } }}>
            <TableCell>Antrags-Nr.</TableCell>
            <TableCell>Datum</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Zuletzt geändert</TableCell>
            {extraColumns.map((col) => (
              <TableCell key={col.header}>{col.header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.id} hover>
              <TableCell>{app.id}</TableCell>
              <TableCell>{formatDate(app.createdDate)}</TableCell>
              <TableCell>
                <StatusChip status={app.status} statusDisplay={app.statusDisplay} />
              </TableCell>
              <TableCell>{formatDate(app.lastUpdated)}</TableCell>
              {extraColumns.map((col) => (
                <TableCell key={col.header}>{col.render(app)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

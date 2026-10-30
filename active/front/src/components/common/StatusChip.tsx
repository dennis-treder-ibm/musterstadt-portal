import Chip from '@mui/material/Chip'
import { ApplicationStatus } from '@/types/domain'
import { APPLICATION_STATUS_LABELS } from '@/utils/format'

const COLORS = {
  [ApplicationStatus.Pending]: 'warning',
  [ApplicationStatus.Approved]: 'success',
  [ApplicationStatus.Rejected]: 'error',
} as const

/** Colored status label (Ausstehend / Genehmigt / Abgelehnt). Text carries the meaning, not just color. */
export function StatusChip({ status }: { status: ApplicationStatus }) {
  return <Chip size="small" variant="outlined" color={COLORS[status]} label={APPLICATION_STATUS_LABELS[status]} />
}

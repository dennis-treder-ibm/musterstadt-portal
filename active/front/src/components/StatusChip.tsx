import Chip from '@mui/material/Chip'
import type { ApplicationStatus } from '@/types/domain'

interface StatusChipProps {
  status: ApplicationStatus | null | undefined
  statusDisplay?: string | null
}

const STATUS_COLOR: Record<ApplicationStatus, 'warning' | 'success' | 'error'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
}

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  PENDING: 'Ausstehend',
  APPROVED: 'Genehmigt',
  REJECTED: 'Abgelehnt',
}

/** MUI Chip that renders an application status with the appropriate colour. */
export function StatusChip({ status, statusDisplay }: StatusChipProps) {
  if (!status) return null
  return (
    <Chip
      label={statusDisplay ?? STATUS_LABEL[status]}
      color={STATUS_COLOR[status]}
      size="small"
      aria-label={`Status: ${statusDisplay ?? STATUS_LABEL[status]}`}
    />
  )
}

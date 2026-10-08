import { Tag } from '@carbon/react';
import type { ApplicationStatus } from '@/types/api';

interface StatusTagProps {
  status: ApplicationStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_CONFIG: Record<string, { label: string; type: 'warm-gray' | 'green' | 'red' | 'blue' | 'teal' }> = {
  PENDING: { label: 'Ausstehend', type: 'blue' },
  APPROVED: { label: 'Genehmigt', type: 'green' },
  REJECTED: { label: 'Abgelehnt', type: 'red' },
};

export function StatusTag({ status, size = 'md' }: StatusTagProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, type: 'warm-gray' };

  return (
    <Tag type={config.type} size={size}>
      {config.label}
    </Tag>
  );
}

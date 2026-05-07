import { Badge } from '@/components/ui/badge';
import { DocumentStatus } from '@/types';

const statusConfig: Record<DocumentStatus, { label: string; className: string }> = {
  uploaded:          { label: 'Uploaded',       className: 'bg-secondary text-muted-foreground border border-border' },
  processing:        { label: 'Processing',      className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20' },
  completed:         { label: 'Awaiting Review', className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20' },
  failed:            { label: 'Failed',          className: 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20' },
  reviewed_approved: { label: 'Approved',        className: 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20' },
  reviewed_rejected: { label: 'Rejected',        className: 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20' },
  reviewed_edited:   { label: 'Edited',          className: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20' },
};

export function StatusBadge({ status }: { status: DocumentStatus }) {
  const config = statusConfig[status] ?? statusConfig.uploaded;
  return <Badge className={config.className}>{config.label}</Badge>;
}

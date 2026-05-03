import { Badge } from '@/components/ui/badge';
import { DocumentStatus } from '@/types';

const statusConfig: Record<DocumentStatus, { label: string; className: string }> = {
  uploaded: { label: 'Uploaded', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  processing: { label: 'Processing', className: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20' },
  completed: { label: 'Completed', className: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' },
  failed: { label: 'Failed', className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
};

interface StatusBadgeProps {
  status: DocumentStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.uploaded;
  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
}

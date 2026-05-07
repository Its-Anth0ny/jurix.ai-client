import { Badge } from '@/components/ui/badge';
import { DocumentStatus } from '@/types';

const statusConfig: Record<DocumentStatus, { label: string; className: string }> = {
  uploaded: { label: 'Uploaded', className: 'bg-[#1f1f3a] text-[#818cf8] border border-[#2a2a4a]' },
  processing: { label: 'Processing', className: 'bg-[#1e3a5f] text-[#60a5fa] border border-[#1e3a8f]' },
  completed: { label: 'Completed', className: 'bg-[#1a3a1a] text-[#22C55E] border border-[#1a4a1a]' },
  failed: { label: 'Failed', className: 'bg-[#3a1a1a] text-[#EF4444] border border-[#4a1a1a]' },
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

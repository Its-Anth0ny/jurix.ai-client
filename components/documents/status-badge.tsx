import { Badge } from '@/components/ui/badge';
import { DocumentStatus } from '@/types';

const statusConfig: Record<DocumentStatus, { label: string; className: string }> = {
  uploaded:          { label: 'Uploaded',       className: 'bg-secondary text-muted-foreground border border-border' },
  processing:        { label: 'Processing',      className: 'bg-[#1e3a5f] text-[#60a5fa] border border-[#1e3a8f]' },
  completed:         { label: 'Awaiting Review', className: 'bg-[#2a2a1a] text-[#F59E0B] border border-[#3a3a1a]' },
  failed:            { label: 'Failed',          className: 'bg-[#3a1a1a] text-[#EF4444] border border-[#4a1a1a]' },
  reviewed_approved: { label: 'Approved',        className: 'bg-[#1a3a1a] text-[#22C55E] border border-[#1a4a1a]' },
  reviewed_rejected: { label: 'Rejected',        className: 'bg-[#3a1a1a] text-[#EF4444] border border-[#4a2020]' },
  reviewed_edited:   { label: 'Edited',          className: 'bg-[#1a2a2a] text-[#2dd4bf] border border-[#1a3a3a]' },
};

export function StatusBadge({ status }: { status: DocumentStatus }) {
  const config = statusConfig[status] ?? statusConfig.uploaded;
  return <Badge className={config.className}>{config.label}</Badge>;
}

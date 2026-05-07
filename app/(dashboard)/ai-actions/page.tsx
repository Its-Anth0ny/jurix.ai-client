'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { DocumentDetail } from '@/types';
import { Clock, ChevronRight, CheckCircle } from 'lucide-react';

export default function AIActionsPage() {
  const [docs, setDocs] = useState<DocumentDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'comply' | 'appeal'>('all');
  const [submitting, setSubmitting] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const token = getToken(); if (!token) return;
      try {
        const { documents } = await api.getDocuments(token);
        const completed = documents.filter(d => d.status === 'completed');
        const details = await Promise.all(
          completed.map(d => api.getDocument(d._id, token).catch(() => null))
        );
        const needsReview = details.filter(d => d && (d.audit as { status?: string })?.status === 'needs_review') as DocumentDetail[];
        setDocs(needsReview);
      } catch (e) { /* silent */ }
      finally { setIsLoading(false); }
    }
    load();
  }, []);

  async function handleApprove(docId: string) {
    setSubmitting(docId);
    setError('');
    try {
      const token = getToken(); if (!token) return;
      await api.reviewDocument(docId, 'approved', undefined, token);
      setDocs(prev => prev.filter(d => d.document_id !== docId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Approval failed');
    } finally {
      setSubmitting(null);
    }
  }

  const filtered = docs.filter(d => {
    if (filter === 'all') return true;
    return d.action_plan?.decision === filter;
  });

  const urgentCount = docs.length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">AI Actions</h1>
          <p className="text-sm text-muted-foreground mt-1">Documents processed by AI awaiting your decision</p>
        </div>
        <div className="flex gap-2">
          {urgentCount > 0 && <span className="inline-flex items-center gap-1 text-xs font-medium bg-red-500/10 text-red-700 dark:text-red-400 px-3 py-1.5 rounded-full border border-red-500/20"><Clock className="w-3 h-3" /> {urgentCount} pending</span>}
        </div>
      </div>

      {error && (
        <div className="text-destructive text-sm p-3 bg-destructive/10 border border-destructive/20 rounded-lg">{error}</div>
      )}

      <div className="flex gap-1 p-1 bg-card border border-border rounded-lg w-fit">
        {(['all', 'comply', 'appeal'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${filter === f ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {f === 'all' ? `All (${docs.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${docs.filter(d => d.action_plan?.decision === f).length})`}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-xl">
          <CheckCircle className="w-8 h-8 text-[#22C55E] mb-3" />
          <p className="text-sm font-medium text-foreground">All caught up!</p>
          <p className="text-xs text-muted-foreground mt-1">No documents are waiting for review</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(doc => (
            <ReviewCard key={doc.document_id} doc={doc} onApprove={handleApprove} onReview={id => router.push(`/document/${id}`)} isSubmitting={submitting === doc.document_id} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewCard({ doc, onApprove, onReview, isSubmitting }: { doc: DocumentDetail; onApprove: (id: string) => void; onReview: (id: string) => void; isSubmitting: boolean }) {
  const decision = doc.action_plan?.decision;
  const accentColor = decision === 'appeal' ? 'bg-primary' : 'bg-[#22C55E]';

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
      <div className={`w-1 h-12 ${accentColor} rounded-full flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-mono text-foreground">{doc.document_id?.slice(0, 20)}...</span>
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${decision === 'comply' ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'}`}>
            {decision?.toUpperCase() || 'REVIEW'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {doc.action_plan?.department || 'Department TBD'} · {doc.action_plan?.actions?.length || 0} action items
        </p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button onClick={() => onApprove(doc.document_id)} disabled={isSubmitting} className="text-xs font-medium bg-[#22C55E] hover:bg-[#16a34a] text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
          {isSubmitting ? '...' : 'Approve'}
        </button>
        <button onClick={() => onReview(doc.document_id)} className="text-xs text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
          Review <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

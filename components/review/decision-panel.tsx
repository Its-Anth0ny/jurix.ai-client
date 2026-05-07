'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { ActionPlan, ReviewDecision } from '@/types';
import { EditModal } from './edit-modal';

interface DecisionPanelProps {
  documentId: string;
  currentDecision?: string;
  actionPlan?: ActionPlan;
  onReviewSubmitted: () => void;
}

export function DecisionPanel({
  documentId,
  currentDecision,
  actionPlan,
  onReviewSubmitted,
}: DecisionPanelProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);

  async function handleDecision(decision: ReviewDecision['decision'], editedOutput?: ActionPlan) {
    setIsSubmitting(true);
    setError('');
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');
      await api.reviewDocument(documentId, decision, editedOutput, token);
      onReviewSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  const reviewed = currentDecision?.startsWith('reviewed_');

  return (
    <>
      {actionPlan && (
        <EditModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          actionPlan={actionPlan}
          onSave={(edited) => handleDecision('edited', edited)}
        />
      )}
      <div className="space-y-2">
        {error && (
          <div className="text-destructive text-xs p-2 bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>
        )}

        {reviewed ? (
          <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-400">
            <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="font-medium">Reviewed</span>
            <span className="text-muted-foreground">· {currentDecision}</span>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => handleDecision('rejected')}
              disabled={isSubmitting}
              className="h-8 px-4 text-xs bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 text-destructive rounded-lg transition-colors disabled:opacity-50"
            >
              ✗ Reject
            </button>
            <button
              onClick={() => setEditModalOpen(true)}
              disabled={isSubmitting}
              className="flex-1 h-8 px-4 text-xs bg-secondary border border-border hover:bg-card text-foreground rounded-lg transition-colors disabled:opacity-50"
            >
              ✎ Edit &amp; Approve
            </button>
            <button
              onClick={() => handleDecision('approved')}
              disabled={isSubmitting}
              className="h-8 px-4 text-xs bg-[#22C55E] hover:bg-[#16a34a] text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              ✓ Approve
            </button>
          </div>
        )}
      </div>
    </>
  );
}

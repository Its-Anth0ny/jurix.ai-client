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
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary rounded flex items-center justify-center">
            <Sparkles className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="text-xs font-medium text-primary uppercase tracking-wide">AI Recommendation</span>
        </div>

        {error && (
          <div className="text-destructive text-xs p-2 bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>
        )}

        {reviewed ? (
          <div className="p-3 bg-[#1a3a1a] border border-[#1a4a1a] rounded-lg">
            <p className="text-sm font-medium text-[#22C55E]">Already reviewed</p>
            <p className="text-xs text-muted-foreground mt-1">Decision: {currentDecision}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => handleDecision('approved')}
              disabled={isSubmitting}
              className="w-full h-9 bg-[#22C55E] hover:bg-[#16a34a] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              ✓ Approve
            </button>
            <button
              onClick={() => setEditModalOpen(true)}
              disabled={isSubmitting}
              className="w-full h-9 bg-secondary border border-border hover:bg-card text-foreground text-sm rounded-lg transition-colors disabled:opacity-50"
            >
              ✎ Edit &amp; Approve
            </button>
            <button
              onClick={() => handleDecision('rejected')}
              disabled={isSubmitting}
              className="w-full h-9 bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 text-destructive text-sm rounded-lg transition-colors disabled:opacity-50"
            >
              ✗ Reject
            </button>
          </div>
        )}
      </div>
    </>
  );
}

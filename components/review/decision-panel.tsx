'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      <Card>
        <CardHeader>
          <CardTitle>Review Decision</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-destructive text-sm p-2 bg-destructive/10 rounded">{error}</div>
          )}
          {reviewed ? (
            <div className="text-green-600 dark:text-green-400 p-4 bg-green-500/10 rounded-lg">
              <p className="font-semibold">Already reviewed</p>
              <p className="text-sm">Decision: {currentDecision}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                onClick={() => handleDecision('approved')}
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                ✓ Approve
              </Button>
              <Button
                onClick={() => setEditModalOpen(true)}
                disabled={isSubmitting}
                className="w-full"
              >
                ✎ Edit & Approve
              </Button>
              <Button
                onClick={() => handleDecision('rejected')}
                disabled={isSubmitting}
                variant="destructive"
                className="w-full"
              >
                ✗ Reject
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
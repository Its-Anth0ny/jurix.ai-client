'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ActionPlan } from '@/types';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionPlan: ActionPlan;
  onSave: (edited: ActionPlan) => Promise<void>;
}

export function EditModal({ isOpen, onClose, actionPlan, onSave }: EditModalProps) {
  const [edited, setEdited] = useState<ActionPlan>(actionPlan);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEdited(actionPlan);
      setSaveError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // intentionally omit actionPlan — background fetches must not wipe in-progress edits

  async function handleSave() {
    setIsSaving(true);
    setSaveError('');
    try {
      await onSave(edited);
      onClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Edit Action Plan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Decision</Label>
            <select
              value={edited.decision}
              onChange={(e) => setEdited({ ...edited, decision: e.target.value as 'comply' | 'appeal' })}
              className="w-full h-10 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
            >
              <option value="comply">Comply</option>
              <option value="appeal">Appeal</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Department</Label>
            <input
              value={edited.department}
              onChange={(e) => setEdited({ ...edited, department: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Actions (one per line)</Label>
            <textarea
              value={edited.actions.map((a) => a.action).join('\n')}
              onChange={(e) =>
                setEdited({
                  ...edited,
                  actions: e.target.value.split('\n').map((action) => ({ action })),
                })
              }
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors h-32 resize-none"
            />
          </div>
        </div>
        {saveError && (
          <div className="text-destructive text-xs p-2 bg-destructive/10 border border-destructive/20 rounded-md mx-6 -mt-2">
            {saveError}
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving} className="border-border hover:bg-secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary/90 text-white">
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

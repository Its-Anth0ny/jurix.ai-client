'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ActionPlan } from '@/types';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionPlan: ActionPlan;
  onSave: (edited: ActionPlan) => void;
}

export function EditModal({ isOpen, onClose, actionPlan, onSave }: EditModalProps) {
  const [edited, setEdited] = useState<ActionPlan>(actionPlan);

  function handleSave() {
    onSave(edited);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Edit Action Plan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Decision</Label>
            <select
              value={edited.decision}
              onChange={(e) => setEdited({ ...edited, decision: e.target.value as 'comply' | 'appeal' })}
              className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <option value="comply">Comply</option>
              <option value="appeal">Appeal</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Department</Label>
            <Input
              value={edited.department}
              onChange={(e) => setEdited({ ...edited, department: e.target.value })}
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Actions (one per line)</Label>
            <textarea
              value={edited.actions.map((a) => a.action).join('\n')}
              onChange={(e) =>
                setEdited({
                  ...edited,
                  actions: e.target.value.split('\n').map((action) => ({ action })),
                })
              }
              className="w-full h-32 px-3 py-2 rounded-lg border border-input bg-background text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 resize-none"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
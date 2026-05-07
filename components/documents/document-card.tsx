'use client';

import React, { memo, useState } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { StatusBadge } from './status-badge';
import { formatDate } from '@/lib/utils';
import { DocumentStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface DocumentCardProps {
  id: string;
  status: DocumentStatus;
  createdAt?: string;
  onDeleted?: (id: string) => void;
}

const DocumentCardComponent = function DocumentCardComponent({ id, status, createdAt, onDeleted }: DocumentCardProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleRetry(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsRetrying(true);
    try {
      const token = getToken();
      if (!token) return;
      await api.processDocument(id, token);
    } finally {
      setIsRetrying(false);
    }
  }

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleting(true);
    try {
      const token = getToken();
      if (!token) return;
      await api.deleteDocument(id, token);
      onDeleted?.(id);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog>
      <div className="group relative bg-card border border-border rounded-xl p-4 hover:border-primary/30 hover:bg-secondary/50 transition-all duration-200 cursor-pointer">
        <Link href={`/document/${id}`} className="block">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-mono text-muted-foreground">{id.slice(0, 16)}...</span>
            <StatusBadge status={status} />
          </div>
          <p className="text-xs text-muted-foreground mb-3">Uploaded {formatDate(createdAt)}</p>
          {status === 'processing' && (
            <div>
              <div className="h-1 bg-secondary rounded-full overflow-hidden mb-1">
                <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '65%' }} />
              </div>
              <p className="text-xs text-primary">AI processing...</p>
            </div>
          )}
          {status === 'failed' && (
            <Button size="sm" variant="destructive" onClick={handleRetry} disabled={isRetrying} className="w-full text-xs h-7 mt-1">
              {isRetrying ? 'Retrying...' : 'Retry Processing'}
            </Button>
          )}
          {status === 'completed' && (
            <p className="text-xs text-[#22C55E]">Processing complete — click to review</p>
          )}
        </Link>
        {status !== 'processing' && (
          <AlertDialogTrigger asChild>
            <button
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </AlertDialogTrigger>
        )}
      </div>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Document</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this document and all associated data. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const DocumentCard = memo(DocumentCardComponent);

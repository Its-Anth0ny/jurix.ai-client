'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from './status-badge';
import { formatDate } from '@/lib/utils';
import { DocumentStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { useState } from 'react';

interface DocumentCardProps {
  id: string;
  status: DocumentStatus;
  createdAt?: string;
}

const DocumentCardComponent = function DocumentCardComponent({ id, status, createdAt }: DocumentCardProps) {
  const [isRetrying, setIsRetrying] = useState(false);

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

  return (
    <Link href={`/document/${id}`}>
      <Card className="hover:shadow-lg hover:border-primary/30 transition-all duration-200 cursor-pointer">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-sm font-mono text-muted-foreground">{id.slice(0, 8)}...</CardTitle>
            <StatusBadge status={status} />
          </div>
          <CardDescription>Uploaded {formatDate(createdAt)}</CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'failed' && (
            <Button
              size="sm"
              variant="destructive"
              onClick={handleRetry}
              disabled={isRetrying}
              className="mt-2 w-full"
            >
              {isRetrying ? 'Retrying...' : 'Retry Processing'}
            </Button>
          )}
          {status !== 'failed' && (
            <p className="text-sm text-muted-foreground">Click to view details</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export const DocumentCard = memo(DocumentCardComponent);

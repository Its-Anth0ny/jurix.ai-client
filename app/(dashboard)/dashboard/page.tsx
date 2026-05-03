'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DocumentCard } from '@/components/documents/document-card';
import { UploadForm } from '@/components/documents/upload-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { DocumentStatus } from '@/types';

interface DocumentItem {
  _id: string;
  status: string;
  created_at?: string;
}

export default function DashboardPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchDocuments() {
    try {
      const token = getToken();
      if (!token) return;

      const response = await api.getDocuments(token);
      setDocuments(response.documents || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-gray-500">Manage your court judgment documents</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>+ Upload Document</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Document</DialogTitle>
            </DialogHeader>
            <UploadForm onUploadComplete={fetchDocuments} />
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="text-red-500 p-4 bg-red-50 rounded">{error}</div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-16 px-4 border border-dashed rounded-xl bg-muted/30">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-foreground font-medium">No documents yet</p>
          <p className="text-sm text-muted-foreground mt-1">Upload your first court judgment to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <DocumentCard
              key={doc._id}
              id={doc._id}
              status={doc.status as DocumentStatus}
              createdAt={doc.created_at}
            />
          ))}
        </div>
      )}
    </div>
  );
}
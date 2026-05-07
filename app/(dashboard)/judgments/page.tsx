'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DocumentCard } from '@/components/documents/document-card';
import { UploadForm } from '@/components/documents/upload-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { DocumentStatus } from '@/types';
import { Plus, Search } from 'lucide-react';

interface DocumentItem { _id: string; status: string; created_at?: string; }

export default function JudgmentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  async function fetchDocuments() {
    try {
      const token = getToken(); if (!token) return;
      const response = await api.getDocuments(token);
      setDocuments(response.documents || []);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to load'); }
    finally { setIsLoading(false); }
  }

  useEffect(() => { fetchDocuments(); }, []);

  const handleDocumentDeleted = (deletedId: string) => setDocuments(prev => prev.filter(d => d._id !== deletedId));

  const filtered = documents.filter(d => {
    const matchSearch = d._id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Judgments</h1>
          <p className="text-sm text-muted-foreground mt-1">{documents.length} documents total</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white gap-2"><Plus className="w-4 h-4" /> Upload</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Upload Court Judgment</DialogTitle></DialogHeader>
            <UploadForm onUploadComplete={fetchDocuments} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by document ID..." className="pl-9 bg-card border-border h-9 text-sm" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
          <option value="all">All statuses</option>
          <option value="uploaded">Uploaded</option>
          <option value="processing">Processing</option>
          <option value="completed">Awaiting Review</option>
          <option value="failed">Failed</option>
          <option value="reviewed_approved">Approved</option>
          <option value="reviewed_rejected">Rejected</option>
          <option value="reviewed_edited">Edited</option>
        </select>
      </div>

      {error && <div className="text-destructive text-sm p-3 bg-destructive/10 border border-destructive/20 rounded-lg">{error}</div>}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-xl">
          <p className="text-sm text-muted-foreground">{search || statusFilter !== 'all' ? 'No documents match your filters' : 'No judgments uploaded yet'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(doc => (
            <DocumentCard key={doc._id} id={doc._id} status={doc.status as DocumentStatus} createdAt={doc.created_at} onDeleted={handleDocumentDeleted} onRetried={fetchDocuments} />
          ))}
        </div>
      )}
    </div>
  );
}

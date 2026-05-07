'use client';

import { useEffect, useState } from 'react';
import { Plus, Brain, AlertTriangle, Clock, TrendingUp, FileText } from 'lucide-react';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { DocumentCard } from '@/components/documents/document-card';
import { Skeleton } from '@/components/ui/skeleton';
import { UploadForm } from '@/components/documents/upload-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/documents/status-badge';
import { DocumentStatus } from '@/types';

interface DocumentItem {
  _id: string;
  status: string;
  created_at?: string;
}

function StatCard({ label, value, sub, color }: { label: string; value: number; sub: string; color: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-3xl font-bold ${color} mb-1`}>{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function InsightCard({ icon: Icon, color, borderColor, text, sub }: { icon: React.ElementType; color: string; borderColor: string; text: string; sub: string }) {
  return (
    <div className={`flex gap-3 p-3 bg-secondary rounded-lg border-l-2 ${borderColor}`}>
      <Icon className={`w-4 h-4 ${color} mt-0.5 flex-shrink-0`} />
      <div>
        <p className="text-xs text-foreground">{text}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
        <FileText className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="text-sm text-foreground font-medium">No judgments yet</p>
      <p className="text-xs text-muted-foreground mt-1">Upload your first court judgment to get started</p>
    </div>
  );
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

  const handleDocumentDeleted = (deletedId: string) => {
    setDocuments((prev) => prev.filter((doc) => doc._id !== deletedId));
  };

  const stats = {
    total: documents.length,
    completed: documents.filter((d) => d.status === 'completed').length,
    processing: documents.filter((d) => d.status === 'processing').length,
    failed: documents.filter((d) => d.status === 'failed').length,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
              <Plus className="w-4 h-4" /> Upload Judgment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Court Judgment</DialogTitle>
            </DialogHeader>
            <UploadForm onUploadComplete={fetchDocuments} />
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="text-destructive text-sm p-3 bg-destructive/10 border border-destructive/20 rounded-lg">{error}</div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading ? (
          [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : (
          <>
            <StatCard label="Total Judgments" value={stats.total} sub={`${stats.completed} completed`} color="text-foreground" />
            <StatCard label="Processing" value={stats.processing} sub="Being analyzed" color="text-[#60a5fa]" />
            <StatCard label="Completed" value={stats.completed} sub={`${stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}% success rate`} color="text-[#22C55E]" />
            <StatCard label="Failed" value={stats.failed} sub="Needs retry" color="text-[#EF4444]" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Recent Judgments</h2>
            <a href="/judgments" className="text-xs text-primary hover:underline">View all →</a>
          </div>
          {isLoading ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10" />)}
            </div>
          ) : documents.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="divide-y divide-border">
              {documents.slice(0, 6).map((doc) => (
                <a key={doc._id} href={`/document/${doc._id}`} className="flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors">
                  <span className="text-xs font-mono text-foreground">{doc._id.slice(0, 20)}...</span>
                  <StatusBadge status={doc.status as DocumentStatus} />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl">
          <div className="flex items-center gap-2 p-4 border-b border-border">
            <div className="w-5 h-5 bg-primary rounded-md flex items-center justify-center">
              <Brain className="w-3 h-3 text-white" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">AI Insights</h2>
          </div>
          <div className="p-3 space-y-2">
            <InsightCard
              icon={AlertTriangle}
              color="text-[#60a5fa]"
              borderColor="border-[#60a5fa]"
              text={stats.processing > 0 ? `${stats.processing} judgment${stats.processing !== 1 ? 's' : ''} currently being processed` : 'No documents in processing'}
              sub={stats.processing > 0 ? 'AI extraction and action plan generation in progress' : 'All queued documents have been processed'}
            />
            <InsightCard
              icon={TrendingUp}
              color="text-[#22C55E]"
              borderColor="border-[#22C55E]"
              text={stats.completed > 0 ? `${stats.completed} judgment${stats.completed !== 1 ? 's' : ''} completed` : 'No completed judgments yet'}
              sub={stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}% of uploaded documents processed successfully` : 'Upload a judgment to get started'}
            />
            <InsightCard
              icon={Clock}
              color="text-[#F59E0B]"
              borderColor="border-[#F59E0B]"
              text={stats.failed > 0 ? `${stats.failed} document${stats.failed !== 1 ? 's' : ''} failed processing` : 'No processing failures'}
              sub={stats.failed > 0 ? 'Retry from the Judgments page' : 'All documents processed without errors'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

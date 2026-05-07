'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FileText, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/documents/status-badge';
import { DecisionPanel } from '@/components/review/decision-panel';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { DocumentDetail, DocumentStatus, Extraction, ActionPlan, AuditResult } from '@/types';
import { formatDate } from '@/lib/utils';
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

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-secondary border border-border rounded-lg p-3">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-4 text-xs">
      <span className="text-muted-foreground flex-shrink-0">{label}</span>
      <span className="text-foreground text-right">{value || 'N/A'}</span>
    </div>
  );
}

function StageStep({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return (
    <span className={`flex items-center gap-1 ${active ? 'text-primary font-medium' : done ? 'text-[#22C55E]' : 'text-muted-foreground'}`}>
      {done ? '✓' : active ? '●' : '○'} {label}
    </span>
  );
}

export default function DocumentDetailPage() {
  const params = useParams();
  const documentId = params.id as string;

  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchDocument = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;
      const data = await api.getDocument(documentId, token);
      setDocument(data as DocumentDetail);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load document');
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  useEffect(() => {
    if (document?.status !== 'processing') return;
    const interval = setInterval(() => {
      fetchDocument();
    }, 10000);
    return () => clearInterval(interval);
  }, [document?.status, fetchDocument]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="text-destructive p-4 bg-destructive/10 rounded-lg border border-destructive/20">
        {error || 'Document not found'}
      </div>
    );
  }

  const extraction = document.extraction as Extraction | undefined;
  const actionPlan = document.action_plan as ActionPlan | undefined;
  const audit = document.audit as AuditResult | undefined;

  return (
    <div className="flex h-full gap-0 -m-6">
      <div className="flex-1 flex flex-col border-r border-border min-w-0">
        <div className="h-11 flex items-center justify-between px-4 border-b border-border bg-card flex-shrink-0">
          <div className="flex items-center gap-3">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground font-mono">{documentId.slice(0, 16)}...</span>
            <StatusBadge status={document.status as DocumentStatus} />
          </div>
          <div className="flex items-center gap-2">
            {document.status !== 'processing' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded hover:bg-destructive/10">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Document</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this document and all associated data (extraction, action plan, audit, and review). This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async () => {
                        const token = getToken();
                        if (!token) return;
                        await api.deleteDocument(documentId, token);
                        router.push('/dashboard');
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {document.status === 'processing' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-6">
              <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Processing your document</p>
                <p className="text-xs text-muted-foreground">AI is analyzing the court judgment...</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <StageStep
                  label="Extracting"
                  active={document.stage === 'extracting'}
                  done={['generating_action', 'auditing', 'done'].includes(document.stage || '')}
                />
                <span className="text-muted-foreground">→</span>
                <StageStep
                  label="Action Plan"
                  active={document.stage === 'generating_action'}
                  done={['auditing', 'done'].includes(document.stage || '')}
                />
                <span className="text-muted-foreground">→</span>
                <StageStep
                  label="Auditing"
                  active={document.stage === 'auditing'}
                  done={document.stage === 'done'}
                />
              </div>
            </div>
          </div>
        )}

        {document.status !== 'processing' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Uploaded: {formatDate(document.created_at)}</p>
              <p className="text-xs">Full PDF viewer requires backend file serving integration.</p>
            </div>
          </div>
        )}
      </div>

      <div className="w-80 xl:w-96 flex flex-col bg-card flex-shrink-0">
        <Tabs defaultValue="extraction" className="flex flex-col flex-1 min-h-0">
          <TabsList className="rounded-none border-b border-border bg-background h-10 w-full justify-start px-2 flex-shrink-0">
            <TabsTrigger value="extraction" className="text-xs data-[state=active]:bg-accent data-[state=active]:text-foreground rounded-md">Extraction</TabsTrigger>
            <TabsTrigger value="action" className="text-xs data-[state=active]:bg-accent data-[state=active]:text-foreground rounded-md">Action Plan</TabsTrigger>
            <TabsTrigger value="audit" className="text-xs data-[state=active]:bg-accent data-[state=active]:text-foreground rounded-md">Audit</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="extraction" className="p-4 space-y-3 mt-0">
              <InfoCard title="Case Details">
                <InfoRow label="Case No." value={extraction?.case_details?.case_number} />
                <InfoRow label="Court" value={extraction?.case_details?.court} />
                <InfoRow label="Judge" value={extraction?.case_details?.judge} />
                <InfoRow label="Type" value={extraction?.case_details?.case_type} />
              </InfoCard>
              <InfoCard title="Parties">
                <InfoRow label="Plaintiff" value={extraction?.parties?.plaintiff} />
                <InfoRow label="Defendant" value={extraction?.parties?.defendant} />
              </InfoCard>
              {extraction?.final_order && (
                <InfoCard title="Final Order">
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">{extraction.final_order}</p>
                </InfoCard>
              )}
              {extraction?.deadlines?.length ? (
                <InfoCard title="Deadlines">
                  {extraction.deadlines.map((d, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] mt-1.5 flex-shrink-0" />
                      <span className="text-foreground">{d}</span>
                    </div>
                  ))}
                </InfoCard>
              ) : null}
            </TabsContent>

            <TabsContent value="action" className="p-4 space-y-3 mt-0">
              {actionPlan ? (
                <>
                  <InfoCard title="Decision">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${actionPlan.decision === 'comply' ? 'bg-[#1a3a1a] text-[#22C55E]' : 'bg-[#1f1f3a] text-[#818cf8]'}`}>
                      {actionPlan.decision?.toUpperCase()}
                    </span>
                  </InfoCard>
                  <InfoCard title="Department">
                    <p className="text-xs text-foreground">{actionPlan.department || 'N/A'}</p>
                  </InfoCard>
                  {actionPlan.actions?.length ? (
                    <InfoCard title="Actions">
                      {actionPlan.actions.map((a, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <span className="text-muted-foreground flex-shrink-0">{i + 1}.</span>
                          <span className="text-foreground">
                            {a.action}
                            {a.deadline && <span className="text-muted-foreground ml-1">({a.deadline})</span>}
                          </span>
                        </div>
                      ))}
                    </InfoCard>
                  ) : null}
                </>
              ) : (
                <p className="text-xs text-muted-foreground p-4">No action plan generated yet.</p>
              )}
            </TabsContent>

            <TabsContent value="audit" className="p-4 space-y-3 mt-0">
              {audit ? (
                <>
                  <InfoCard title="Audit Status">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${audit.status === 'approved' ? 'bg-[#1a3a1a] text-[#22C55E]' : 'bg-[#2a2a1a] text-[#F59E0B]'}`}>
                      {audit.status?.toUpperCase()}
                    </span>
                  </InfoCard>
                  {audit.issues?.length ? (
                    <InfoCard title="Issues Found">
                      {audit.issues.map((issue, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] mt-1.5 flex-shrink-0" />
                          <span className="text-foreground">{issue}</span>
                        </div>
                      ))}
                    </InfoCard>
                  ) : (
                    <p className="text-xs text-muted-foreground">No issues found — plan validated.</p>
                  )}
                </>
              ) : (
                <p className="text-xs text-muted-foreground p-4">Audit not yet available.</p>
              )}
            </TabsContent>
          </div>

          <div className="p-4 border-t border-border flex-shrink-0">
            <DecisionPanel
              documentId={documentId}
              currentDecision={document.status}
              actionPlan={actionPlan}
              onReviewSubmitted={fetchDocument}
            />
          </div>
        </Tabs>
      </div>
    </div>
  );
}

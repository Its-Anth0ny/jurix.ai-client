'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/documents/status-badge';
import { DecisionPanel } from '@/components/review/decision-panel';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { DocumentDetail, DocumentStatus, Extraction, ActionPlan, AuditResult } from '@/types';
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

// --- Confidence utilities (mocked — replace with backend scores when available) ---

function mockConfidence(value?: string): number {
  if (!value) return 0;
  const hash = value.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return Math.min(0.99, 0.65 + (hash % 35) / 100);
}

function ConfidenceDot({ value }: { value?: string }) {
  if (!value) return null;
  const pct = Math.round(mockConfidence(value) * 100);
  const color = pct > 85 ? '#22C55E' : pct > 65 ? '#F59E0B' : '#EF4444';
  return (
    <span
      title={`${pct}% confidence`}
      className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 cursor-help"
      style={{ backgroundColor: color }}
    />
  );
}

function overallConfidence(extraction?: Extraction): number {
  const vals = [
    extraction?.case_details?.case_number,
    extraction?.case_details?.court,
    extraction?.case_details?.judge,
    extraction?.parties?.plaintiff,
    extraction?.parties?.defendant,
    extraction?.final_order,
  ].filter(Boolean) as string[];
  if (!vals.length) return 0;
  return vals.reduce((sum, v) => sum + mockConfidence(v), 0) / vals.length;
}

function ConfidenceBanner({ extraction }: { extraction?: Extraction }) {
  const pct = Math.round(overallConfidence(extraction) * 100);
  if (!pct) return null;
  const color = pct > 85 ? '#22C55E' : pct > 65 ? '#F59E0B' : '#EF4444';
  const label = pct > 85 ? 'High confidence' : pct > 65 ? 'Review recommended' : 'Verify manually';
  return (
    <div
      className="flex items-center gap-2 text-xs px-2.5 py-1 rounded border bg-secondary/50"
      style={{ borderColor: color + '50' }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <span className="text-foreground font-medium">{pct}%</span>
      <span className="text-muted-foreground hidden sm:inline">· {label}</span>
    </div>
  );
}

// --- Processing view ---

const STAGES = ['extracting', 'generating_action', 'auditing'] as const;
type Stage = (typeof STAGES)[number];

const STAGE_LABELS: Record<Stage, string> = {
  extracting: 'Extracting entities',
  generating_action: 'Building action plan',
  auditing: 'Validating output',
};

const STAGE_PROGRESS: Record<Stage, number> = {
  extracting: 30,
  generating_action: 65,
  auditing: 88,
};

function ProcessingView({ stage, elapsed }: { stage?: string; elapsed: number }) {
  const stageKey = stage as Stage;
  const currentIndex = STAGES.indexOf(stageKey);
  const progress = STAGE_PROGRESS[stageKey] ?? 15;

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-8 px-6">
      <div className="w-full max-w-md space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{STAGE_LABELS[stageKey] ?? 'Initializing...'}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-0.5 w-full bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="w-full max-w-md space-y-3">
        {([
          { label: 'Case Details', stageIdx: 0 },
          { label: 'Action Plan', stageIdx: 1 },
          { label: 'Audit', stageIdx: 2 },
        ] as const).map(({ label, stageIdx }) => (
          <div
            key={label}
            className="transition-opacity duration-700"
            style={{ opacity: currentIndex >= stageIdx ? 1 : 0.25 }}
          >
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 font-medium">
              {label}
            </p>
            <div className="bg-secondary border border-border rounded-lg p-3 space-y-2">
              <Skeleton className="h-2.5 w-2/3" />
              <Skeleton className="h-2.5 w-1/2" />
              {stageIdx === 0 && <Skeleton className="h-2.5 w-3/4" />}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 text-[11px]">
        {STAGES.map((s, i) => (
          <span key={s} className="flex items-center gap-2">
            {i > 0 && <span className="text-muted-foreground">→</span>}
            <span
              className={
                s === stageKey
                  ? 'text-primary font-medium'
                  : currentIndex > i
                  ? 'text-[#22C55E]'
                  : 'text-muted-foreground opacity-40'
              }
            >
              {s === stageKey ? '●' : currentIndex > i ? '✓' : '○'} {STAGE_LABELS[s]}
            </span>
          </span>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {elapsed}s elapsed · AI is analyzing your court judgment
      </p>
    </div>
  );
}

// --- Shared InfoCard / InfoRow ---

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-secondary/50 border border-border rounded-lg p-4">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-3">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-xs">
      <span className="text-muted-foreground flex-shrink-0">{label}</span>
      <span className="flex items-center gap-1.5">
        <span className="text-foreground text-right">{value || 'N/A'}</span>
        <ConfidenceDot value={value} />
      </span>
    </div>
  );
}

// --- Page ---

export default function DocumentDetailPage() {
  const params = useParams();
  const documentId = params.id as string;
  const router = useRouter();

  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  useEffect(() => { fetchDocument(); }, [fetchDocument]);

  useEffect(() => {
    if (document?.status !== 'processing') return;
    const interval = setInterval(fetchDocument, 10000);
    return () => clearInterval(interval);
  }, [document?.status, fetchDocument]);

  useEffect(() => {
    if (document?.status === 'processing') {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [document?.status]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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

  const headerBar = (
    <div className="h-11 flex items-center gap-3 px-4 border-b border-border bg-card flex-shrink-0">
      <button
        onClick={() => router.push('/dashboard')}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>
      <span className="text-xs font-mono text-muted-foreground truncate flex-1">
        {documentId.slice(0, 20)}...
      </span>
      <StatusBadge status={document.status as DocumentStatus} />
    </div>
  );

  // Full-screen processing state
  if (document.status === 'processing') {
    return (
      <div className="flex flex-col h-full -m-6 bg-background">
        {headerBar}
        <ProcessingView stage={document.stage} elapsed={elapsed} />
      </div>
    );
  }

  // Full-screen results state
  return (
    <div className="flex flex-col h-full -m-6 bg-background overflow-hidden">
      {/* Header */}
      <div className="h-11 flex items-center gap-3 px-4 border-b border-border bg-card flex-shrink-0">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <span className="text-xs font-mono text-muted-foreground truncate flex-1">
          {documentId.slice(0, 20)}...
        </span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge status={document.status as DocumentStatus} />
          <ConfidenceBanner extraction={extraction} />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Document</AlertDialogTitle>
                <AlertDialogDescription>
                  Permanently deletes this document and all extracted data. Cannot be undone.
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
        </div>
      </div>

      {/* Tabs — full width, scrollable content */}
      <Tabs defaultValue="extraction" className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <TabsList className="rounded-none border-b border-border bg-background h-10 w-full justify-start px-4 flex-shrink-0">
          <TabsTrigger value="extraction" className="text-xs data-[state=active]:bg-accent data-[state=active]:text-foreground rounded-md">
            Extraction
          </TabsTrigger>
          <TabsTrigger value="action" className="text-xs data-[state=active]:bg-accent data-[state=active]:text-foreground rounded-md">
            Action Plan
          </TabsTrigger>
          <TabsTrigger value="audit" className="text-xs data-[state=active]:bg-accent data-[state=active]:text-foreground rounded-md">
            Audit
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          {/* Extraction */}
          <TabsContent value="extraction" className="p-6 mt-0">
            <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="md:col-span-2">
                  <InfoCard title="Final Order">
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {extraction.final_order}
                    </p>
                  </InfoCard>
                </div>
              )}
              {extraction?.deadlines?.length ? (
                <div className="md:col-span-2">
                  <InfoCard title="Deadlines">
                    {extraction.deadlines.map((d, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] mt-1.5 flex-shrink-0" />
                        <span className="text-foreground">{d}</span>
                      </div>
                    ))}
                  </InfoCard>
                </div>
              ) : null}
            </div>
          </TabsContent>

          {/* Action Plan */}
          <TabsContent value="action" className="p-6 mt-0">
            <div className="max-w-3xl mx-auto space-y-4">
              {actionPlan ? (
                <>
                  <InfoCard title="Decision">
                    <span
                      className={`inline-flex px-3 py-1 rounded text-sm font-semibold ${
                        actionPlan.decision === 'comply'
                          ? 'bg-[#1a3a1a] text-[#22C55E]'
                          : 'bg-[#1f1f3a] text-[#818cf8]'
                      }`}
                    >
                      {actionPlan.decision?.toUpperCase()}
                    </span>
                  </InfoCard>
                  <InfoCard title="Department">
                    <p className="text-sm text-foreground">{actionPlan.department || 'N/A'}</p>
                  </InfoCard>
                  {actionPlan.actions?.length ? (
                    <InfoCard title="Required Actions">
                      {actionPlan.actions.map((a, i) => (
                        <div key={i} className="flex items-start gap-3 text-xs py-1.5 border-b border-border last:border-0">
                          <span className="text-muted-foreground font-mono flex-shrink-0 mt-0.5">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span className="text-foreground flex-1">
                            {a.action}
                            {a.deadline && (
                              <span className="text-muted-foreground ml-2">· due {a.deadline}</span>
                            )}
                          </span>
                        </div>
                      ))}
                    </InfoCard>
                  ) : null}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No action plan generated.</p>
              )}
            </div>
          </TabsContent>

          {/* Audit */}
          <TabsContent value="audit" className="p-6 mt-0">
            <div className="max-w-3xl mx-auto space-y-4">
              {audit ? (
                <>
                  <InfoCard title="Audit Status">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        audit.status === 'approved'
                          ? 'bg-[#1a3a1a] text-[#22C55E]'
                          : 'bg-[#2a2a1a] text-[#F59E0B]'
                      }`}
                    >
                      {audit.status?.toUpperCase()}
                    </span>
                  </InfoCard>
                  <InfoCard title="Field Confidence">
                    {([
                      { label: 'Case Number', value: extraction?.case_details?.case_number },
                      { label: 'Court', value: extraction?.case_details?.court },
                      { label: 'Judge', value: extraction?.case_details?.judge },
                      { label: 'Plaintiff', value: extraction?.parties?.plaintiff },
                      { label: 'Defendant', value: extraction?.parties?.defendant },
                    ] as { label: string; value?: string }[]).map(({ label, value }) => {
                      const pct = Math.round(mockConfidence(value) * 100);
                      const color = pct > 85 ? '#22C55E' : pct > 65 ? '#F59E0B' : '#EF4444';
                      return (
                        <div key={label} className="flex items-center gap-3 text-xs">
                          <span className="text-muted-foreground w-28 flex-shrink-0">{label}</span>
                          <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, backgroundColor: color }}
                            />
                          </div>
                          <span className="w-8 text-right font-mono text-[11px]" style={{ color }}>
                            {pct}%
                          </span>
                        </div>
                      );
                    })}
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
                    <div className="flex items-center gap-2 text-xs text-[#22C55E] p-3 bg-[#1a3a1a] rounded-lg border border-[#22C55E]/20">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      No issues — extraction validated successfully
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Audit not available.</p>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Sticky review footer */}
      <div className="border-t border-border bg-card px-6 py-3 flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          <DecisionPanel
            documentId={documentId}
            currentDecision={document.status}
            actionPlan={actionPlan}
            onReviewSubmitted={fetchDocument}
          />
        </div>
      </div>
    </div>
  );
}

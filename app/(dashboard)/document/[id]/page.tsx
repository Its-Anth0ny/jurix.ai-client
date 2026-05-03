'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/documents/status-badge';
import { DecisionPanel } from '@/components/review/decision-panel';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { DocumentDetail, DocumentStatus, Extraction, ActionPlan, AuditResult } from '@/types';
import { formatDate } from '@/lib/utils';

export default function DocumentDetailPage() {
  const params = useParams();
  const documentId = params.id as string;

  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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

  // Poll for status updates when processing (increase interval to reduce API load)
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Document {documentId.slice(0, 8)}</h1>
          <p className="text-muted-foreground">Uploaded {formatDate(document.created_at)}</p>
        </div>
        <StatusBadge status={document.status as DocumentStatus} />
      </div>

      {/* Processing Stage Indicator */}
      {document.status === 'processing' && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <p className="text-sm font-medium text-foreground mb-3">Processing your document...</p>
          <div className="flex items-center gap-2 text-sm">
            <span className={`flex items-center gap-1 ${document.stage === 'extracting' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              {document.stage === 'extracting' ? '●' : ['generating_action', 'auditing', 'done'].includes(document.stage || '') ? '✓' : '○'} Extracting Facts
            </span>
            <span className="text-muted-foreground/50">→</span>
            <span className={`flex items-center gap-1 ${document.stage === 'generating_action' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              {document.stage === 'generating_action' ? '●' : ['auditing', 'done'].includes(document.stage || '') ? '✓' : '○'} Generating Action Plan
            </span>
            <span className="text-muted-foreground/50">→</span>
            <span className={`flex items-center gap-1 ${document.stage === 'auditing' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              {document.stage === 'auditing' ? '●' : document.stage === 'done' ? '✓' : '○'} Auditing
            </span>
          </div>
        </div>
      )}

      {/* Main Content - Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Document Context */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="extraction">
            <TabsList>
              <TabsTrigger value="extraction">Extracted Facts</TabsTrigger>
              <TabsTrigger value="action">Action Plan</TabsTrigger>
              <TabsTrigger value="audit">Audit</TabsTrigger>
            </TabsList>

            <TabsContent value="extraction" className="space-y-4">
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="font-semibold mb-4">Case Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Case Number:</span>
                    <p className="font-medium">{extraction?.case_details?.case_number || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Court:</span>
                    <p className="font-medium">{extraction?.case_details?.court || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Judge:</span>
                    <p className="font-medium">{extraction?.case_details?.judge || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Case Type:</span>
                    <p className="font-medium">{extraction?.case_details?.case_type || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border">
                <h3 className="font-semibold mb-4">Parties</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Plaintiff:</span>
                    <p className="font-medium">{extraction?.parties?.plaintiff || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Defendant:</span>
                    <p className="font-medium">{extraction?.parties?.defendant || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border">
                <h3 className="font-semibold mb-4">Final Order</h3>
                <p className="text-sm whitespace-pre-wrap">{extraction?.final_order || 'N/A'}</p>
              </div>

              <div className="bg-card p-6 rounded-lg border">
                <h3 className="font-semibold mb-4">Deadlines</h3>
                {extraction?.deadlines?.length ? (
                  <ul className="list-disc pl-5 text-sm">
                    {extraction.deadlines.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No deadlines found</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="action" className="space-y-4">
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="font-semibold mb-4">Decision</h3>
                <p className="text-2xl font-bold capitalize">{actionPlan?.decision || 'N/A'}</p>
              </div>

              <div className="bg-card p-6 rounded-lg border">
                <h3 className="font-semibold mb-4">Department</h3>
                <p>{actionPlan?.department || 'N/A'}</p>
              </div>

              <div className="bg-card p-6 rounded-lg border">
                <h3 className="font-semibold mb-4">Actions</h3>
                {actionPlan?.actions?.length ? (
                  <ul className="space-y-2">
                    {actionPlan.actions.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="font-medium">{i + 1}.</span>
                        <span>{a.action}</span>
                        {a.deadline && (
                          <span className="text-muted-foreground">({a.deadline})</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No actions generated</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="audit" className="space-y-4">
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="font-semibold mb-4">Audit Status</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${
                    audit?.status === 'approved' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {audit?.status?.toUpperCase() || 'N/A'}
                  </span>
                </div>
              </div>

              {audit?.issues?.length ? (
                <div className="bg-card p-6 rounded-lg border border-yellow-500/20">
                  <h3 className="font-semibold mb-4 text-yellow-600 dark:text-yellow-500">Issues Found</h3>
                  <ul className="list-disc pl-5 text-sm space-y-2">
                    {audit.issues.map((issue, i) => (
                      <li key={i} className="text-yellow-700 dark:text-yellow-400">{issue}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="bg-card p-6 rounded-lg border">
                  <p className="text-sm text-muted-foreground">No issues found - plan validated</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Decision Panel */}
        <div>
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
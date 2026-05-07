'use client';

import { useState } from 'react';
import { Download, Loader2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { Extraction, ActionPlan } from '@/types';

const LANGUAGES = ['English', 'Hindi', 'Marathi', 'Tamil', 'French', 'Spanish'] as const;
type Language = typeof LANGUAGES[number];

interface ExportPDFButtonProps {
  documentId: string;
  extraction?: Extraction;
  actionPlan?: ActionPlan;
}

export function ExportPDFButton({ documentId, extraction, actionPlan }: ExportPDFButtonProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [translationWarning, setTranslationWarning] = useState(false);

  async function handleExport(language: Language) {
    setPickerOpen(false);
    setIsExporting(true);
    setExportError('');
    setTranslationWarning(false);
    try {
      let exportExtraction = extraction;

      if (language !== 'English') {
        const token = getToken();
        if (!token) throw new Error('Not authenticated');
        const result = await api.translateDocument(documentId, language, token);
        exportExtraction = result.translated_output;
        if (result.translation_warnings && result.translation_warnings.length > 0) {
          setTranslationWarning(true);
        }
      }

      // Dynamic import to avoid SSR issues with @react-pdf/renderer
      const [{ pdf }, { LegalDocumentPDF }, { createElement }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./legal-document-pdf'),
        import('react'),
      ]);

      const exportDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      const element = createElement(LegalDocumentPDF, { documentId, extraction: exportExtraction, actionPlan, language, exportDate });
      const blob = await pdf(element).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jurix-${documentId.slice(0, 8)}-${language.toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setPickerOpen(true)}
        disabled={isExporting}
        className="flex items-center gap-1.5 h-7 px-3 text-xs border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
      >
        {isExporting ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Download className="w-3 h-3" />
        )}
        {isExporting ? 'Exporting...' : 'Export PDF'}
      </button>

      {exportError && (
        <span className="text-xs text-red-700 dark:text-red-400">{exportError}</span>
      )}
      {translationWarning && (
        <span className="text-xs text-amber-700 dark:text-amber-400">Some fields may not be fully translated</span>
      )}

      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setPickerOpen(false)}>
          <div
            className="bg-card border border-border rounded-xl p-5 w-64 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Export Language</h3>
              <button onClick={() => setPickerOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleExport(lang)}
                  className="px-3 py-2.5 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-secondary transition-colors text-left"
                >
                  {lang}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">Non-English exports use AI translation</p>
          </div>
        </div>
      )}
    </>
  );
}

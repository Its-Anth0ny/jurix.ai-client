'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

interface UploadFormProps {
  onUploadComplete?: () => void;
}

export function UploadForm({ onUploadComplete }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    if (!file) return;
    setIsUploading(true);
    setError('');
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');
      const uploadResponse = await api.upload(file, token);
      const documentId = uploadResponse.document_id;
      await api.processDocument(documentId, token);
      onUploadComplete?.();
      router.push(`/document/${documentId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-destructive text-sm p-3 bg-destructive/10 border border-destructive/20 rounded-lg">{error}</div>
      )}
      <div
        className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-accent/5 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="text-muted-foreground w-8 h-8 mx-auto mb-3" />
        <p className="text-foreground">Drop your PDF here</p>
        <p className="text-muted-foreground text-sm">or click to browse</p>
        {file && <p className="text-sm text-primary mt-2">{file.name}</p>}
        <input
          type="file"
          accept=".pdf"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>
      <Button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className="w-full mt-4"
      >
        {isUploading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Uploading...
          </span>
        ) : (
          'Upload & Process'
        )}
      </Button>
    </div>
  );
}

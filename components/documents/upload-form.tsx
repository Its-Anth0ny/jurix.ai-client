'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

  async function handleUpload() {
    if (!file) return;

    setIsUploading(true);
    setError('');

    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const uploadResponse = await api.upload(file, token);
      const documentId = uploadResponse.document_id;

      // Trigger processing
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
    <Card>
      <CardHeader>
        <CardTitle>Upload Court Judgment</CardTitle>
        <CardDescription>Upload a PDF document to begin processing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="text-destructive text-sm p-2 bg-destructive/10 rounded">{error}</div>
        )}
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <Button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="w-full"
        >
          {isUploading ? 'Uploading...' : 'Upload & Process'}
        </Button>
      </CardContent>
    </Card>
  );
}

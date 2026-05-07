---
name: jurix-api-client
description: Use when working on the Jurix frontend API layer — lib/api.ts, document operations, upload flow, processing trigger, review submission, or delete. DO NOT modify lib/api.ts without user confirmation.
---

# Jurix API Client

## Overview

Single API client at `lib/api.ts`. All requests go through the internal `request<T>()` helper. Token always passed manually per-call via `getToken()` from `lib/auth.ts`.

**Do not modify `lib/api.ts` without confirming with the user.**

## All Methods

```typescript
export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: { id: string; email: string } }>(
      '/api/auth/login', { method: 'POST', body: { email, password } }
    ),

  signup: (email: string, password: string) =>
    request<{ token: string; user: { id: string; email: string } }>(
      '/api/auth/signup', { method: 'POST', body: { email, password } }
    ),

  // Documents — list
  getDocuments: (token: string) =>
    request<{ documents: Array<{ _id: string; status: string; created_at: string }> }>(
      '/api/documents', { token }
    ),

  // Document — single (includes extraction, action_plan, audit when completed)
  getDocument: (id: string, token: string) =>
    request<{
      document_id: string; status: string; stage?: string;
      extraction?: object; action_plan?: object; audit?: object; created_at?: string;
    }>(`/api/document/${id}`, { token }),

  // Upload — uses FormData; do NOT set Content-Type manually
  upload: async (file: File, token: string) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!response.ok) throw new Error('Upload failed');
    return response.json() as Promise<{ document_id: string }>;
  },

  // Trigger AI processing pipeline
  processDocument: (id: string, token: string) =>
    request<{ document_id: string; status: string }>(`/api/process/${id}`, { method: 'POST', token }),

  // Submit human review decision
  reviewDocument: (id: string, decision: string, editedOutput?: object, token?: string) =>
    request<{ document_id: string; status: string }>(`/api/review/${id}`, {
      method: 'POST',
      body: { decision, edited_output: editedOutput },
      token,
    }),

  // Delete document and all associated data
  deleteDocument: (id: string, token: string) =>
    request<{ success: boolean; message: string }>(`/api/document/${id}`, { method: 'DELETE', token }),
};
```

## Standard Call Pattern

```typescript
const token = getToken();
if (!token) return;
try {
  const data = await api.getDocuments(token);
  setDocuments(data.documents ?? []);
} catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to load');
}
```

## Document Status Flow

```
uploaded → processing → completed | failed
                         ↓
              reviewed_approved | reviewed_rejected | reviewed_edited
```

The `stage` field on a processing document indicates pipeline progress: `extracting → generating_action → auditing → done`.

## Upload + Process (always paired)

```typescript
const { document_id } = await api.upload(file, token);
await api.processDocument(document_id, token);
router.push(`/document/${document_id}`); // page starts polling
```

## Polling Pattern

```typescript
useEffect(() => {
  if (document?.status !== 'processing') return;
  const interval = setInterval(fetchDocument, 10_000);
  return () => clearInterval(interval);
}, [document?.status, fetchDocument]);
```

## Review Decisions

```typescript
await api.reviewDocument(id, 'approved', undefined, token);
await api.reviewDocument(id, 'rejected', undefined, token);
await api.reviewDocument(id, 'edited', { decision: 'comply', department: 'Revenue', actions: [...] }, token);
```

## Error Display Pattern

```tsx
{error && (
  <div className="text-destructive text-sm p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
    {error}
  </div>
)}
```

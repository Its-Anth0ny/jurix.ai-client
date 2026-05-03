---
name: jurix-api-client
description: Use when working on JURIX frontend API layer — lib/api.ts, document operations, upload flow, processing trigger, or review submission.
---

# JURIX API Client

## Overview

Single API client module at `lib/api.ts`. All calls go through the `api` object. Token passed manually per-call via `getToken()`.

## When to Use

- Modifying API client functions
- Adding new endpoints
- Changing upload behavior
- Modifying review submission
- Debugging API call failures

## API Functions

```typescript
// lib/api.ts
export const api = {
  // Auth
  login: (email, password) => request<{token, user}>('/api/auth/login', {...}),
  signup: (email, password) => request<{token, user}>('/api/auth/signup', {...}),

  // Documents
  upload: (file: File, token: string) => {
    // Uses FormData — browser sets Content-Type: multipart/form-data
    const formData = new FormData()
    formData.append('file', file)
    return fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
  },

  getDocuments: (token) => request('/api/documents', {token}),
  getDocument: (id, token) => request(`/api/document/${id}`, {token}),
  processDocument: (id, token) => request(`/api/process/${id}`, {method: 'POST', token}),

  // Review
  reviewDocument: (id, decision, editedOutput?, token?) =>
    request(`/api/review/${id}`, {
      method: 'POST',
      body: { decision, edited_output: editedOutput },
      token,
    }),
}
```

## Document Status Types

```typescript
// types/index.ts
type DocumentStatus = 'uploaded' | 'processing' | 'completed' | 'failed' | 'reviewed_approved' | 'reviewed_rejected' | 'reviewed_edited'

interface ReviewDecision {
  decision: 'approved' | 'edited' | 'rejected'
  edited_output?: ActionPlan
}
```

## Processing Flow

```typescript
// 1. Upload → get document_id
const { document_id } = await api.upload(file, token)

// 2. Trigger processing
await api.processDocument(document_id, token)

// 3. Poll until completed/failed
const poll = setInterval(async () => {
  const doc = await api.getDocument(id, token)
  if (doc.status === 'completed' || doc.status === 'failed') {
    clearInterval(poll)
  }
}, 10000) // 10 second polling
```

## Review Submission

```typescript
// Approve
await api.reviewDocument(id, 'approved', undefined, token)

// Reject
await api.reviewDocument(id, 'rejected', undefined, token)

// Edit
await api.reviewDocument(id, 'edited', { extraction: {...}, action_plan: {...} }, token)
```
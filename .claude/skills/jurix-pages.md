---
name: jurix-pages-structure
description: Use when working on JURIX frontend pages — dashboard, document detail, auth forms, layout structure, or navigation flow.
---

# JURIX Pages Structure

## Overview

Next.js 16 App Router. Auth-aware routing with route guards. Document detail has 10-second polling during processing.

## When to Use

- Modifying any page component (login, signup, dashboard, document detail)
- Changing layout structure (Sidebar, Topbar)
- Modifying document list or upload dialog
- Changing polling behavior
- Adding new routes

## Page Structure

```
/ (root)                    → redirect: /dashboard if authed, /login if not
/(auth)/
  login/page.tsx            → email/password form → /dashboard on success
  signup/page.tsx          → email/password form → /dashboard on success
/(dashboard)/
  layout.tsx               → Sidebar + Topbar, route guard (redirects to /login)
  dashboard/page.tsx        → Document list + upload dialog (shadcn Dialog)
  document/[id]/page.tsx   → Document detail: tabs + review panel
```

## Dashboard Page

```typescript
// (dashboard)/dashboard/page.tsx
// State: documents[], isLoading, error
// Fetches: api.getDocuments(token)
// Upload: Dialog + UploadForm component
// Document display: DocumentCard grid
```

## Document Detail Page

```typescript
// (dashboard)/document/[id]/page.tsx
// Tabs: extraction, action_plan, audit
// Review panel: Approve / Edit / Reject buttons
// Polling: useEffect with setInterval, cleared on completed/failed
// Polling interval: 10 seconds
```

## Layout Structure

```typescript
// (dashboard)/layout.tsx
// <Sidebar /> + <Topbar /> + <main>{children}</main>
// Route guard via useEffect checking AuthProvider state
```

## Component Hierarchy

```
DashboardLayout → Sidebar + Topbar + children
  └── DashboardPage → DocumentCard grid + UploadForm (in Dialog)
        └── DocumentDetailPage → tabs (ExtractionTab, ActionPlanTab, AuditTab) + ReviewPanel
              └── ReviewPanel → ApproveButton, EditForm, RejectButton
```

## Auth Flow Summary

| Page | Auth State | Redirect if Not Auth |
|------|-----------|---------------------|
| `/` | — | → `/dashboard` or `/login` |
| `/login` | guest | → `/dashboard` on success |
| `/signup` | guest | → `/dashboard` on success |
| `/dashboard` | required | → `/login` |
| `/document/[id]` | required | → `/login` |

## Theme Toggle

Uses inline SVG path elements directly (not `lucide-react` despite being installed).
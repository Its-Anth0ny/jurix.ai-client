---
name: jurix-pages-structure
description: Use when working on any Jurix frontend page — dashboard, judgments, AI actions, analytics, settings, document detail, auth forms, layout, sidebar, topbar, or command palette.
---

# Jurix Pages Structure

## Route Map

| Route | File | Auth | Description |
|---|---|---|---|
| `/` | `app/page.tsx` | Public | Landing — 7 sections |
| `/login` | `app/(auth)/login/page.tsx` | Guest | Login form |
| `/signup` | `app/(auth)/signup/page.tsx` | Guest | Signup form |
| `/dashboard` | `app/(dashboard)/dashboard/page.tsx` | Required | Stats + recent judgments + AI insights |
| `/judgments` | `app/(dashboard)/judgments/page.tsx` | Required | Full grid, search, status filter |
| `/ai-actions` | `app/(dashboard)/ai-actions/page.tsx` | Required | Review queue |
| `/analytics` | `app/(dashboard)/analytics/page.tsx` | Required | Charts, compliance rate |
| `/settings` | `app/(dashboard)/settings/page.tsx` | Required | Account, theme, API config |
| `/document/[id]` | `app/(dashboard)/document/[id]/page.tsx` | Required | Split-pane: PDF + AI panel |

## Dashboard Layout (`app/(dashboard)/layout.tsx`)

Wraps all `/dashboard/*` routes. Responsibilities:
1. Auth guard — redirects to `/login` if no user
2. Renders `<Sidebar>` + `<Topbar>` + `<main>`
3. Manages `mobileOpen` state (hamburger ↔ sidebar drawer)
4. Manages `cmdOpen` state (⌘K command palette)
5. Registers global `keydown` listener for `⌘K` / `Ctrl+K`

```tsx
<div className="flex h-screen overflow-hidden bg-background">
  <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
  <div className="flex-1 flex flex-col min-w-0">
    <Topbar onMobileMenuToggle={...} onOpenSearch={() => setCmdOpen(true)} />
    <main className="flex-1 overflow-y-auto p-6">{children}</main>
  </div>
  <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
</div>
```

## Sidebar (`components/layout/sidebar.tsx`)

- Desktop: inline 220px / 56px collapsed, toggled by chevron button
- Mobile: overlay drawer controlled by `mobileOpen` prop (⚠ drawer behaviour planned but not yet implemented — sidebar currently always visible)
- Active state: `bg-accent text-accent-foreground border-l-2 border-primary` on the active link
- Nav groups: WORK (Dashboard, Judgments, AI Actions), INSIGHTS (Analytics), ADMIN (Settings)
- AI Actions badge: hardcoded `'3'` — will become live from Zustand store (planned)
- User card at bottom: email + logout button

## Topbar (`components/layout/topbar.tsx`)

Props: `onMobileMenuToggle`, `onOpenSearch`

- Hamburger (mobile only, `md:hidden`) calls `onMobileMenuToggle`
- ⌘K search bar (click) calls `onOpenSearch` which opens `CommandPalette`
- Theme toggle: `toggleTheme()` from `useTheme()`
- Bell icon: no-op placeholder
- User avatar: first letter of `user.email`

## Command Palette (`components/ui/command-palette.tsx`)

Props: `open`, `onClose`

- Triggered by clicking topbar search bar or `⌘K` / `Ctrl+K`
- Currently supports: page navigation (5 pages), arrow key + Enter navigation
- Planned: document search by ID, "Upload judgment" action, theme toggle action

## Dashboard Page

```typescript
// Data: api.getDocuments(token)
// Derives: stats.total, stats.completed, stats.processing, stats.failed
// Components: StatCard × 4, recent judgments table (last 6), InsightCard × 3
// Upload: shadcn Dialog + UploadForm
// No polling on this page — one-time fetch on mount
```

## Judgments Page

```typescript
// Data: api.getDocuments(token)
// Client filters: search (by _id), statusFilter
// Components: DocumentCard grid (3 cols), search Input, status select, upload Dialog
```

## AI Actions Page

```typescript
// Data: api.getDocuments(token) → filter status==='completed'
//       then api.getDocument(id) for each → filter audit.status==='needs_review'
// Filter tabs: All | Comply | Appeal (by action_plan.decision)
// Actions: inline Approve (api.reviewDocument 'approved'), Review (navigate to /document/[id])
```

## Analytics Page

```typescript
// Data: api.getDocuments(token) — all derived client-side, no extra endpoints
// Charts (recharts):
//   BarChart: documents per month (last 6 months, grouped by created_at)
//   PieChart: status distribution (Completed/Processing/Failed/Uploaded)
// Stats: complianceRate = completed/total * 100
```

## Settings Page

```typescript
// Left nav tabs: Account | Appearance | Notifications | API | Security
// Account: getCurrentUser() email (read-only), danger zone (AlertDialog, no-op)
// Appearance: setTheme('dark'|'light') from useTheme()
// API: process.env.NEXT_PUBLIC_API_URL, copy to clipboard
```

## Document Detail Page

```typescript
// Layout: -m-6 full-bleed split pane
//   Left flex-1: PDF placeholder + document header
//   Right w-80 xl:w-96: Tabs (Extraction | Action Plan | Audit) + DecisionPanel

// Data: api.getDocument(documentId, token)
// Polling: every 10s while status === 'processing'
// Processing state: animated stepper (Extracting → Action Plan → Auditing)
// Extraction tab: Case Details, Parties, Final Order, Deadlines
// Action Plan tab: decision badge, department, actions list
// Audit tab: status badge, issues list
// Decision panel (pinned bottom): DecisionPanel component
```

## Component Hierarchy

```
app/layout.tsx (Providers)
└── app/(dashboard)/layout.tsx (Auth guard, Sidebar, Topbar, CommandPalette)
    ├── dashboard/page.tsx
    │   └── DocumentCard, UploadForm (in Dialog)
    ├── judgments/page.tsx
    │   └── DocumentCard × N, UploadForm (in Dialog)
    ├── ai-actions/page.tsx
    │   └── ReviewCard × N (inline component)
    ├── analytics/page.tsx
    │   └── BarChart, PieChart (recharts)
    ├── settings/page.tsx
    └── document/[id]/page.tsx
        ├── Tabs (Extraction | Action Plan | Audit)
        └── DecisionPanel → EditModal
```

## Auth Flow

| Route | Unauthenticated | On Success |
|---|---|---|
| `/login` | Accessible | → `/dashboard` |
| `/signup` | Accessible | → `/dashboard` |
| `/dashboard/*` | → `/login` | — |

## Page Template

```tsx
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function XyzPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const token = getToken();
      if (!token) return;
      try {
        const result = await api.getDocuments(token);
        setData(result.documents ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading) return <Skeleton className="h-64 rounded-xl" />;

  return (/* page content */);
}
```

# Jurix.ai — Complete UI Revamp Design Spec

**Date:** 2026-05-07  
**Status:** Approved  
**Approach:** Phased (B) — 4 independent phases  

---

## Overview

Transform the current hackathon-style frontend of Jurix.ai into a production-grade, AI-native SaaS platform comparable to Linear, Vercel, and Stripe. All existing functionality (auth, API calls, routing, document upload/processing/review, polling) must be preserved without regression.

---

## Design System

### Color Palette

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#0A0A0A` | Page background |
| `--bg-secondary` | `#111111` | Sidebar, cards |
| `--bg-elevated` | `#171717` | Table rows, hover states |
| `--border` | `#262626` | All borders |
| `--text-primary` | `#FAFAFA` | Headings, labels |
| `--text-secondary` | `#A3A3A3` | Body, descriptions |
| `--text-muted` | `#737373` | Meta, timestamps |
| `--accent` | `#4F46E5` | Primary actions, active states |
| `--success` | `#22C55E` | Completed status |
| `--warning` | `#F59E0B` | Pending/review status |
| `--error` | `#EF4444` | Failed, destructive |
| `--ai-gradient` | `#4F46E5 → #7C3AED` | AI-branded elements |

### Typography

- **Font:** Geist Sans (already in project via Google Fonts)
- **Heading 1:** 28px / 700 / -0.03em tracking
- **Heading 2:** 18px / 600 / -0.02em tracking  
- **Heading 3:** 14px / 500
- **Body:** 13px / 400 / 1.6 line-height / secondary text color
- **Label/Meta:** 11px / 500 / uppercase / 0.08em tracking

### Spacing Scale

4 · 8 · 12 · 16 · 24 · 32 · 48 · 64px

### Component Tokens

- **Border radius:** 6px (buttons, inputs), 8px (cards), 20px (badges/pills)
- **Button variants:** Primary (indigo fill), Secondary (border), Ghost (no border), Destructive (red fill)
- **Status badges:** Completed (green), Processing (blue), Needs Review (amber), Failed (red), Uploaded (indigo)
- **Stat card:** bg-secondary, border, 14px padded, large number + trend indicator

---

## Navigation

**Structure:** AI-first, 5 items + command palette

```
Sidebar (220px)
├── [Logo] Jurix.ai
│
├── WORK
│   ├── Dashboard          (overview + AI insights feed)
│   ├── Judgments          (document grid + upload)
│   └── AI Actions         (review queue) [badge: pending count]
│
├── INSIGHTS
│   └── Analytics          (derived charts)
│
└── ADMIN
    └── Settings           (account + preferences)
│
└── [User card]            (email, plan, logout)
```

**Cross-cutting additions:**
- Notification badge counts on AI Actions (red urgent / amber pending)
- ⌘K command palette — search judgments, jump to pages, trigger actions
- Quick upload button in topbar
- User/workspace card at sidebar bottom with logout + theme toggle

---

## App Shell (Phase 1)

### Sidebar

- **Width:** 220px fixed, collapses to 52px icon rail on mobile (<768px)
- **Sections:** Grouped under "WORK", "INSIGHTS", "ADMIN" labels (10px, uppercase, #4a4a4a)
- **Active state:** `bg-elevated` + indigo left accent or indigo background tint
- **Badge:** Red pill for urgent counts, amber for pending
- **User card:** Avatar initials + truncated email + plan label, opens dropdown on click
- **Collapse animation:** Framer Motion `animate={{ width }}` with 200ms ease

### Topbar

- **Height:** 44px, sticky
- **Left:** ⌘K search bar (opens command palette, not a real input)
- **Right:** Notifications bell, theme toggle, user avatar
- **Mobile:** Hamburger replaces search bar, triggers sidebar drawer

### Content Area

- Fluid width with 24px padding
- Max-width 1280px, centered
- Page header: title (left) + date subtitle + primary action button (right)

---

## Phase 2 — Landing Page + Auth

### Landing Page (`app/page.tsx`)

7 sections in order:

1. **Navbar** — logo, Features / Security / Pricing links, Sign in + Book Demo CTAs
2. **Hero** — indigo radial glow background, pill badge ("AI-powered · Government-ready"), large headline, subheading, Book Demo + Try Platform buttons, animated dashboard preview mockup
3. **Problem** — "The old way is broken" heading, 5 pain-point cards (manual reading, missed deadlines, wrong assignment, blind appeals, no audit trail)
4. **AI Workflow** — 5-step animated flow: Upload → AI Analysis → Action Plan → Human Review → Assignment; indigo arrows between steps; steps animate in on scroll
5. **Feature Grid** — 10 cards (Judgment Summarization, AI Action Plans, Compliance Tracking, Deadline Detection, Appeal Recommendation, Department Assignment, AI Search, Analytics, Audit Logs, Workflow Management); hover lifts card
6. **Enterprise Trust** — Security, Audit Logs, RBAC, Government Readiness, Scalable Architecture; icon + title + description per item
7. **Final CTA** — "Ready to modernise your department?" + Book Demo + Try Platform

### Auth Pages

**Layout:** Split-screen — left branding panel (45%) + right form panel (55%)

**Login (`app/(auth)/login/page.tsx`):**
- Left: Logo, product tagline, 3 value prop bullet points
- Right: "Welcome back" heading, email input, password input (visibility toggle), forgot password link, Sign in button, link to signup
- Preserve: `api.login()` call, redirect to `/dashboard`, error display

**Signup (`app/(auth)/signup/page.tsx`):**
- Left: Logo, social proof quote ("Reduced processing from 3 days to 2 hours")
- Right: "Create account" heading, work email input, password input (visibility toggle + strength meter), Create account button, link to login
- Preserve: `api.signup()` call, redirect to `/dashboard`, error display, minLength validation

---

## Phase 3 — Core App Pages

### Dashboard (`app/(dashboard)/dashboard/page.tsx`)

**Layout:** Single column with full-width sections

**Components:**
- Personalized greeting: "Good morning, {user.email}" + date + urgency summary
- 4 stat cards row: Total Judgments, Pending Review, Urgent Deadlines, Completed (with trend indicators)
- 2-column main grid:
  - Left (2/3): Recent Judgments mini-table (Document ID, Status badge, Upload date, "View all →" link)
  - Right (1/3): AI Insights feed (4 cards, color-coded left border: red=urgent, amber=warning, indigo=info, green=positive)
- Upload button in page header (triggers existing upload dialog)

**Preserve:** `api.getDocuments()` fetch, polling on status changes, delete callback, skeleton loading states

### Judgments Page (`app/(dashboard)/judgments/page.tsx`) — new route

The current `/dashboard` document grid moves to `/judgments`. The existing `/dashboard` route becomes the new overview page. This is a new route, not a modification — no existing links break.

- Search bar (client-side filter on document_id)
- Status filter dropdown
- Upload button
- 3-column card grid with status badges
- Processing cards show indigo progress bar + "AI extracting..." label
- Sidebar "Judgments" nav item links to `/judgments`
- Preserve: all existing document fetching, upload, delete logic (moved from dashboard page)

### Document Card (`components/documents/document-card.tsx`)

- Elevated card with status badge top-right
- Document ID (monospace, truncated)
- Upload date
- Department + decision (if completed)
- Processing progress bar (if processing)
- Delete button (top-right hover reveal) with AlertDialog
- Clickable → document detail page
- Preserve: memoization, delete callback, AlertDialog confirmation

### Document Detail (`app/(dashboard)/document/[id]/page.tsx`)

**Layout:** Split-pane (resizable, min 300px each side)

- **Left pane:** PDF embedded via `<iframe>` with `file_path` from API; page navigation; highlighted citations
- **Right pane (AI Panel):**
  - Tabs: Extraction | Action Plan | Audit
  - **Extraction tab:** Case Details card (court, case_number, judge, case_type, dates), Parties card, Final Order card, Deadlines list (colored dots by urgency), Citations list
  - **Action Plan tab:** Decision badge, department, action items list with deadlines
  - **Audit tab:** Status badge (approved/needs_review), issues list
  - **Decision panel (pinned bottom):** AI recommendation summary + Approve / Edit / Reject buttons; "Already reviewed" state; Edit opens existing EditModal

**Processing state:** Visual progress stepper — Extracting → Generating Action → Auditing → Done; polls every 10s (preserve existing interval logic)

**Preserve:** All tab data rendering, `api.reviewDocument()`, polling, delete with AlertDialog, stage indicators

---

## Phase 4 — New Pages

### AI Actions (`app/(dashboard)/ai-actions/page.tsx`)

**Data source:** `api.getDocuments()` then `api.getDocument(id)` for each — filter to `status === 'completed' && audit?.status === 'needs_review'`. The `AuditResult.status` field is the source of truth for whether a document needs human review.

**Layout:**
- Page header with urgent/pending badge counts
- Filter tabs: All | Comply | Appeal
- Review cards sorted by deadline urgency:
  - Left accent bar (amber=urgent deadline, indigo=appeal recommended, gray=no pressure)
  - Document ID + deadline badge OR appeal confidence badge
  - AI recommendation + department + action count
  - Inline Approve + Review buttons
  - Approve calls `api.reviewDocument({ decision: 'approved' })` directly
  - Review navigates to `/document/[id]`

### Analytics (`app/(dashboard)/analytics/page.tsx`)

**Data source:** `api.getDocuments()` — all client-side derivation, no new endpoints

**Charts (using Recharts or inline SVG/CSS):**
1. **Status breakdown** — horizontal bar chart (Completed / Processing / Needs Review / Failed)
2. **AI Decisions donut** — Comply / Appeal / Rejected proportions from `action_plan.decision` + `audit` data
3. **Monthly trend bar chart** — documents grouped by `created_at` month, last 6 months
4. **Compliance rate** — single large number derived from completed/total ratio

### Settings (`app/(dashboard)/settings/page.tsx`)

**Layout:** Left nav (Account / Appearance / Notifications / API / Security) + right content panel

**Account section:**
- Avatar initials + email display (read-only, from `getCurrentUser()`)
- API endpoint display (from `NEXT_PUBLIC_API_URL`)
- Dark/Light theme toggle (uses existing `useTheme` hook)
- Danger zone: Delete account button (no-op for now, shows confirmation dialog)

**Appearance section:**
- Theme toggle (duplicate of sidebar for discoverability)

**API section:**
- Displays current API base URL
- Copy to clipboard button

---

## Command Palette

**Trigger:** ⌘K (or Ctrl+K on Windows)

**Component:** `components/ui/command-palette.tsx`

**Actions:**
- Navigate to any page (Dashboard, Judgments, AI Actions, Analytics, Settings)
- Search documents by ID
- Upload new judgment (opens upload dialog)
- Toggle theme

**Implementation:** Radix Dialog + fuzzy filter on `getDocuments()` results cached in Zustand

---

## Technical Notes

### Dependencies to Add

- `framer-motion` — sidebar collapse, page transitions, scroll animations on landing
- `recharts` — Analytics charts (lightweight, tree-shakeable); add to package.json
- `zustand` — command palette state, documents cache for AI Actions page

### Preserve Without Changes

- `lib/api.ts` — all methods, all endpoints, error handling
- `lib/auth.ts` — getAuth, setAuth, clearAuth, getToken, getCurrentUser
- `hooks/useAuth.tsx` — auth context, login/signup/logout
- `types/index.ts` — all type definitions
- `app/(dashboard)/layout.tsx` — auth guard logic (only reskin)
- All existing `components/review/` logic

### Files Changed Per Phase

**Phase 1:**
- `app/globals.css` — CSS variable update
- `components/layout/sidebar.tsx` — full rewrite
- `components/layout/topbar.tsx` — full rewrite
- `app/(dashboard)/layout.tsx` — layout structure only

**Phase 2:**
- `app/page.tsx` — full rewrite (landing page)
- `app/(auth)/login/page.tsx` — full rewrite (preserve API calls)
- `app/(auth)/signup/page.tsx` — full rewrite (preserve API calls)

**Phase 3:**
- `app/(dashboard)/dashboard/page.tsx` — full rewrite (preserve data logic)
- `app/(dashboard)/document/[id]/page.tsx` — full rewrite (preserve polling + API calls)
- `components/documents/document-card.tsx` — full rewrite (preserve delete + link)
- `components/documents/upload-form.tsx` — reskin only
- `components/documents/status-badge.tsx` — reskin only
- `components/review/decision-panel.tsx` — reskin only
- `components/review/edit-modal.tsx` — reskin only

**Phase 4 (new files):**
- `app/(dashboard)/judgments/page.tsx` — document grid (moved from dashboard)
- `app/(dashboard)/ai-actions/page.tsx`
- `app/(dashboard)/analytics/page.tsx`
- `app/(dashboard)/settings/page.tsx`
- `components/ui/command-palette.tsx`

---

## Success Criteria

- [ ] Dark mode default; light mode togglable via settings and sidebar user card
- [ ] All existing API calls preserved and functional
- [ ] Document upload → processing → review flow works end-to-end
- [ ] Polling on document detail page continues to work
- [ ] Auth guard on dashboard layout redirects unauthenticated users
- [ ] AI Actions page correctly filters and displays documents needing review
- [ ] Analytics page derives all data from getDocuments() client-side
- [ ] Settings page reads user from getCurrentUser() and theme from useTheme()
- [ ] Command palette opens on ⌘K and can navigate/search
- [ ] Sidebar collapses on mobile (<768px)
- [ ] No TypeScript errors
- [ ] No new lint errors

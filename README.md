# Jurix.ai — Frontend

Production-grade AI-native SaaS interface for court judgment processing. Upload PDF court orders, let AI extract facts and generate action plans, then approve/edit/reject decisions — within a dark-mode-first enterprise UI.

---

## User Flow

```
Auth → Upload PDF → AI Processing (polling) → Review tabs → Approve / Edit / Reject
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.4 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4, shadcn/ui |
| State | React Context (auth, theme) + Zustand (documents cache — planned) |
| Charts | Recharts |
| Animation | Framer Motion |
| Icons | Lucide React |
| Auth | JWT in `localStorage` |
| Font | Geist Sans + Geist Mono |

---

## Pages & Routes

| Route | Auth | Description |
|---|---|---|
| `/` | Public | Landing page — 7 sections |
| `/login` | Guest | JWT login form |
| `/signup` | Guest | Account creation |
| `/dashboard` | Required | Stat cards, recent judgments, AI insights feed |
| `/judgments` | Required | Full document grid with search + status filter |
| `/ai-actions` | Required | Review queue — completed docs needing decision |
| `/analytics` | Required | Monthly trend chart, status donut, compliance rate |
| `/settings` | Required | Account, theme, API endpoint config |
| `/document/[id]` | Required | Split-pane: PDF + AI panel (Extraction / Action Plan / Audit) |

---

## Architecture

```
app/
├── page.tsx                          # Landing page (public)
├── layout.tsx                        # Root: Geist font, ThemeProvider, AuthProvider
├── providers.tsx                     # ThemeProvider + AuthProvider wrapper
├── global-error.tsx                  # App-level error boundary
├── not-found.tsx                     # 404 page
├── globals.css                       # Tailwind v4 + CSS design tokens (dark/light)
│
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
│
└── (dashboard)/
    ├── layout.tsx                    # Auth guard + Sidebar + Topbar + CommandPalette
    ├── dashboard/page.tsx
    ├── judgments/page.tsx
    ├── ai-actions/page.tsx
    ├── analytics/page.tsx
    ├── settings/page.tsx
    └── document/[id]/page.tsx

components/
├── layout/
│   ├── sidebar.tsx                   # Collapsible nav (desktop) + overlay drawer (mobile)
│   └── topbar.tsx                    # ⌘K search, theme toggle, notifications, user avatar
├── documents/
│   ├── document-card.tsx             # Status badge, hover-reveal delete, progress bar
│   ├── status-badge.tsx              # Color-coded per DocumentStatus
│   └── upload-form.tsx               # Drag-and-drop PDF upload
├── review/
│   ├── decision-panel.tsx            # Approve / Edit & Approve / Reject
│   └── edit-modal.tsx                # Edit action plan before approval
└── ui/
    ├── command-palette.tsx           # ⌘K: page navigation + actions
    ├── alert-dialog.tsx
    ├── button.tsx / input.tsx / label.tsx / card.tsx
    ├── dialog.tsx / tabs.tsx / badge.tsx / skeleton.tsx
    └── toast.tsx / sonner.tsx

lib/
├── api.ts            # ALL API calls — DO NOT MODIFY
├── auth.ts           # localStorage token management — DO NOT MODIFY
└── utils.ts          # cn(), formatDate()

hooks/
├── useAuth.tsx       # login / signup / logout / user state — DO NOT MODIFY
└── useTheme.tsx      # light/dark toggle, persisted to localStorage

types/index.ts        # DocumentStatus, ReviewDecision, Extraction, ActionPlan, etc.

docs/superpowers/
├── specs/2026-05-07-jurix-ui-revamp-design.md
└── plans/2026-05-07-spec-gaps.md     # Remaining tasks (Zustand store, mobile drawer, etc.)

scripts/
└── patch-next.js     # Fixes Next.js 16.2.4 /_global-error prerender bug
```

---

## Design System

All tokens defined as CSS custom properties in `app/globals.css`.

| Token | Dark | Light | Role |
|---|---|---|---|
| `--background` | `#0A0A0A` | `#ffffff` | Page background |
| `--card` | `#111111` | `#f9f9fb` | Cards, elevated surfaces |
| `--secondary` | `#171717` | `#f4f4f5` | Hover states, code blocks |
| `--border` | `#262626` | `#e4e4e7` | All borders |
| `--foreground` | `#FAFAFA` | `#09090b` | Primary text |
| `--muted-foreground` | `#737373` | `#71717a` | Metadata, subtitles |
| `--primary` | `#4F46E5` | `#4F46E5` | Actions, active nav, links |
| Success | `#22C55E` | — | Completed status |
| Warning | `#F59E0B` | — | Pending, in-review |
| Error/Destructive | `#EF4444` | — | Failed, delete actions |

Dark mode is default (`<html class="dark">`). Toggle via topbar or `/settings → Appearance`.

---

## Setup

### Requirements

- **Node.js 20+** required for `npm run build` (dev server works on Node 16+)
- Backend running at `http://localhost:8000`

### Install

```bash
npm install
```

### Environment

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Dev server

```bash
npm run dev
# → http://localhost:3000
```

### Production build

```bash
# If using nvm:
nvm use 20

npm run build   # runs patch script automatically, then next build
npm start
```

> `npm run build` prepends `node scripts/patch-next.js` which patches a Next.js 16.2.4 bug where `/_global-error` is forced into static prerendering despite needing React context. The patch is idempotent.

---

## Key Invariants

### DO NOT MODIFY without care

| File | Reason |
|---|---|
| `lib/api.ts` | Single source of truth for all API endpoints and error handling |
| `lib/auth.ts` | Token read/write — changes break all auth flows |
| `hooks/useAuth.tsx` | Auth context consumed by layout guard and all pages |
| `types/index.ts` | Shared types — renaming fields breaks downstream consumers |

### Auth

- JWT stored in `localStorage` under key `jurix_auth`
- Token passed manually to every API call via `getToken()` from `lib/auth.ts`
- No refresh token — 24h expiry, user must re-login
- Route guard in `app/(dashboard)/layout.tsx` redirects to `/login` when unauthenticated

### Document Processing

```
api.upload(file, token)        → { document_id }
api.processDocument(id, token) → kicks off background pipeline
router.push(`/document/${id}`) → page polls every 10s until status !== 'processing'
```

### Polling

Document detail page (`app/(dashboard)/document/[id]/page.tsx`) polls `api.getDocument()` every 10 seconds while `status === 'processing'`. The `fetchDocument` function is wrapped in `useCallback` so the interval reference is stable.

---

## Command Palette (⌘K)

Opens via topbar click or `⌘K` / `Ctrl+K` anywhere in the dashboard layout.

Currently supported:
- Page navigation (Dashboard, Judgments, AI Actions, Analytics, Settings)
- Keyboard navigation (↑ ↓ Enter Esc)

Planned (see `docs/superpowers/plans/2026-05-07-spec-gaps.md`):
- Document search by ID (from Zustand cache)
- "Upload judgment" action
- Theme toggle action

---

## Remaining Work

See `docs/superpowers/plans/2026-05-07-spec-gaps.md` for the 6 planned tasks:

1. Zustand documents store (`store/documents.ts`)
2. Populate store in dashboard layout
3. Enhanced command palette (doc search, upload, theme)
4. Wire upload dialog to palette
5. Live AI Actions badge count from store
6. Mobile sidebar overlay drawer

# JURIX.AI Frontend

Court judgment processing interface — upload PDFs, review AI-extracted facts and action plans, approve/edit/reject decisions.

## Overview

The frontend is a Next.js 16 application that wraps the backend API. Users authenticate, upload court judgment PDFs, monitor AI processing, and submit review decisions.

**User flow:** Auth → Upload → Wait (polling) → View extraction/action_plan/audit → Approve/Edit/Reject

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| State | React Context (AuthProvider, ThemeProvider) |
| Auth | JWT in localStorage |

## Core Features

### Authentication
- Login/Signup forms
- JWT token stored in `localStorage` (`jurix_auth` key)
- Route guards redirect to `/login` if not authenticated

### Dashboard
- Document list with status indicators
- Upload dialog (PDF only)
- Real-time status polling during processing (10s interval)

### Document Detail
- Tabbed view: Extraction / Action Plan / Audit
- Review panel: Approve / Edit / Reject actions
- 24h JWT expiry — re-login required after token expiration

### API Integration
- `lib/api.ts` — centralized API client
- Token passed manually per-call via `getToken()`
- FormData upload (browser sets Content-Type automatically)

## Architecture

```
app/
├── page.tsx              # Root → redirect to dashboard or login
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
├── (dashboard)/
│   ├── layout.tsx        # Sidebar + Topbar, route guard
│   ├── dashboard/page.tsx # Document list + upload dialog
│   └── document/[id]/page.tsx  # Detail + tabs + review
├── providers.tsx          # AuthProvider + ThemeProvider
├── hooks/
│   ├── useAuth.tsx       # login, signup, logout, user state
│   └── useTheme.tsx      # light/dark mode
├── lib/
│   ├── api.ts            # API client (all endpoints)
│   ├── auth.ts           # localStorage token management
│   └── utils.ts          # cn(), formatDate()
└── types/index.ts         # DocumentStatus, ReviewDecision, etc.
```

## User Flow

```
1. / → redirects to /login (if not authed) or /dashboard (if authed)
2. /login or /signup → POST credentials → JWT stored in localStorage
3. /dashboard → GET /api/documents → display document grid
4. Upload → POST /api/upload → get document_id
5. Process → POST /api/process/{id} → background pipeline starts
6. Poll GET /api/document/{id} every 10s until status = completed/failed
7. View extraction, action_plan, audit tabs
8. Submit decision → POST /api/review/{id} (approved/rejected/edited)
```

## Setup

### Requirements
- Node.js 18+
- npm or pnpm
- Backend running at `http://localhost:8000` (or set `NEXT_PUBLIC_API_URL`)

### Installation

```bash
npm install
```

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Run

```bash
npm run dev
# Opens http://localhost:3000
```

## Integration with Backend

Backend API base: `http://localhost:8000` (configurable via `NEXT_PUBLIC_API_URL`)

All authenticated requests include `Authorization: Bearer <token>` header.

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Token retrieved from localStorage per-request
const token = getToken() // from lib/auth.ts
const doc = await api.getDocument(id, token)
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result..

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

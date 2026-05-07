<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Jurix.ai Frontend — Agent Rules

## What This Project Is

AI-native SaaS for court judgment processing. Government departments upload PDF court orders; the AI extracts parties, deadlines, and orders; humans review and approve/reject. The UI is production-grade dark-mode-first SaaS (Linear/Vercel aesthetic).

---

## DO NOT MODIFY — Ever

These files are stable contracts. Changing them silently breaks auth or API flows across every page:

| File | Why |
|---|---|
| `lib/api.ts` | All API endpoints and error handling |
| `lib/auth.ts` | localStorage token read/write |
| `hooks/useAuth.tsx` | Auth context (login, signup, logout, user state) |
| `types/index.ts` | Shared TypeScript types |

If a task requires changing these, stop and confirm with the user.

---

## Build

- **Dev server:** works on Node 16+ via `npm run dev`
- **Production build:** requires **Node 20+**. Run `nvm use 20` first.
- `npm run build` automatically runs `node scripts/patch-next.js` before building. This patches a Next.js 16.2.4 bug. Do not remove this prefix.
- After `npm install`, run `node scripts/patch-next.js` manually if you need to rebuild the patch.

Verify changes compile cleanly before committing:
```bash
npx tsc --noEmit
```

---

## Design System Rules

All visual tokens live in `app/globals.css` as CSS custom properties. Never hardcode hex colors in components — use token classes (`bg-card`, `text-muted-foreground`, `border-border`, `text-primary`, etc.).

Exception: semantic status colors (`#22C55E` success, `#F59E0B` warning, `#EF4444` error, `#60a5fa` info) may be used inline when a Tailwind class doesn't map cleanly, but only for status indicators.

Dark mode is default. The `<html>` element always has `class="dark"` on initial load. Light mode is toggled by adding/removing `dark` via `useTheme`.

---

## Page Anatomy

Every dashboard page follows this pattern:

```tsx
export default function XyzPage() {
  // 1. Fetch data via api.* + getToken()
  // 2. Derive stats client-side (no extra endpoints)
  // 3. Skeleton while loading
  // 4. Empty state when data is empty
  // 5. Main content
}
```

All dashboard pages live under `app/(dashboard)/` and are protected by the auth guard in `app/(dashboard)/layout.tsx`.

---

## State Management

- **Auth state:** `useAuth()` from `hooks/useAuth.tsx` — user, isLoading, login, logout
- **Theme state:** `useTheme()` from `hooks/useTheme.tsx` — theme, toggleTheme, setTheme
- **Documents cache:** Zustand store at `store/documents.ts` — **not yet created**, planned in `docs/superpowers/plans/2026-05-07-spec-gaps.md`
- **Local component state:** `useState` for UI toggles, `useCallback`+`useEffect` for polling

Do not add TanStack Query or SWR — the project intentionally uses manual fetch + polling.

---

## API Pattern

Every call goes through `lib/api.ts`. Token always fetched via `getToken()` at call-site:

```ts
const token = getToken();
if (!token) return;
const data = await api.getDocument(id, token);
```

Upload uses `FormData` — do not set `Content-Type` manually (browser sets `multipart/form-data` boundary automatically).

---

## Document Lifecycle

```
uploaded → processing → completed | failed
                         ↓
                    reviewed_approved | reviewed_rejected | reviewed_edited
```

Polling in `document/[id]/page.tsx`: `setInterval(fetchDocument, 10_000)` while `status === 'processing'`. Clear on unmount via `useEffect` cleanup.

---

## Component Conventions

- `memo()` on document cards and any component rendered in a list
- `useCallback` on any function passed as a prop or used in a `useEffect` dep array
- AlertDialog for all destructive actions (delete) — never `window.confirm`
- Skeleton components while `isLoading`, empty state component when data is empty
- Error message in a `text-destructive bg-destructive/10 border border-destructive/20 rounded-lg` div

---

## Commit Style

Small, focused commits. One logical change per commit. Message format:

```
feat: add X
fix: correct Y in Z
refactor: simplify W
docs: update README
```

No `--no-verify`. Fix failing hooks before committing.

---

## Remaining Work

See `docs/superpowers/plans/2026-05-07-spec-gaps.md` for the next 6 planned tasks (Zustand store, command palette enhancements, mobile sidebar drawer).

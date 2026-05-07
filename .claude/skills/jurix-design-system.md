---
name: jurix-design-system
description: Use when working on Jurix frontend styling — CSS tokens, dark/light palette, component styling patterns, status colors, typography, spacing, or Tailwind class conventions.
---

# Jurix Design System

## Overview

All tokens are CSS custom properties in `app/globals.css`. Use Tailwind utility classes that map to these tokens — never hardcode hex values in components.

**Exception:** semantic status colors (`#22C55E`, `#F59E0B`, `#EF4444`, `#60a5fa`) may be used inline only for status indicators when no Tailwind class maps cleanly.

---

## Color Tokens

### Dark Mode (default)

| Token | Value | Tailwind Class | Role |
|---|---|---|---|
| `--background` | `#0A0A0A` | `bg-background` | Page background |
| `--card` | `#111111` | `bg-card` | Cards, elevated surfaces |
| `--secondary` | `#171717` | `bg-secondary` | Hover states, code blocks |
| `--border` | `#262626` | `border-border` | All borders |
| `--foreground` | `#FAFAFA` | `text-foreground` | Primary text |
| `--card-foreground` | `#FAFAFA` | `text-card-foreground` | Text on cards |
| `--muted-foreground` | `#737373` | `text-muted-foreground` | Metadata, subtitles |
| `--primary` | `#4F46E5` | `text-primary` / `bg-primary` | Actions, active nav, links |
| `--accent` | `#1e1b4b` | `bg-accent` | Active nav background tint |
| `--accent-foreground` | `#a5b4fc` | `text-accent-foreground` | Active nav text |
| `--destructive` | `#EF4444` | `text-destructive` | Errors, delete actions |
| `--input` | `#262626` | `bg-input` | Input field background |
| `--ring` | `#4F46E5` | `ring-ring` | Focus ring |

### Light Mode

Same token names, different values. `<html>` loses `class="dark"` when light mode is active.

| Token | Light Value |
|---|---|
| `--background` | `#ffffff` |
| `--card` | `#f9f9fb` |
| `--secondary` | `#f4f4f5` |
| `--border` | `#e4e4e7` |
| `--foreground` | `#09090b` |
| `--muted-foreground` | `#71717a` |

---

## Semantic Status Colors

Use inline only — these don't have Tailwind mappings in the token set:

| Status | Color | Usage |
|---|---|---|
| Success / Completed | `#22C55E` | Completed badge, approve button |
| Warning / Processing | `#F59E0B` | Processing badge, pending states |
| Error / Failed | `#EF4444` | Failed badge, destructive actions |
| Info | `#60a5fa` | Informational highlights |

---

## Dark Mode Toggle

Default: `<html class="dark">` set in `app/layout.tsx`.

Toggle via `useTheme()` from `hooks/useTheme.tsx`:

```typescript
const { theme, toggleTheme, setTheme } = useTheme();
// toggleTheme() adds/removes 'dark' class on <html>
// setTheme('dark' | 'light') sets explicitly
```

---

## Typography

Font: **Geist Sans** (body) + **Geist Mono** (monospace). Loaded via `next/font/google` in `app/layout.tsx`.

| Class | Usage |
|---|---|
| `text-2xl font-bold` | Page headings |
| `text-lg font-semibold` | Section headings, card titles |
| `text-sm` | Body text, table rows |
| `text-xs text-muted-foreground` | Metadata, timestamps, labels |
| `font-mono text-xs` | Document IDs, code values |

---

## Spacing Scale

Tailwind classes map to the 4px base grid: `p-1` (4px), `p-2` (8px), `p-3` (12px), `p-4` (16px), `p-6` (24px), `p-8` (32px).

Dashboard pages use `p-6` for main content area padding (set in layout).

---

## Component Patterns

### Cards

```tsx
<div className="bg-card border border-border rounded-xl p-6">
  <h3 className="text-lg font-semibold text-foreground">Title</h3>
  <p className="text-sm text-muted-foreground">Subtitle</p>
</div>
```

### Error Display

```tsx
<div className="text-destructive text-sm p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
  {error}
</div>
```

### Loading Skeleton

```tsx
<div className="bg-secondary animate-pulse rounded-xl h-32" />
```

Or use `<Skeleton>` from `components/ui/skeleton.tsx`.

### Status Badge Colors (inline style)

```tsx
// In status-badge.tsx
const colors = {
  completed: 'bg-green-500/10 text-green-400 border-green-500/20',
  processing: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  failed: 'bg-red-500/10 text-red-400 border-red-500/20',
  uploaded: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};
```

### Active Nav Item (Sidebar)

```tsx
// Active
className="bg-accent text-accent-foreground border-l-2 border-primary"
// Inactive
className="text-muted-foreground hover:bg-secondary hover:text-foreground"
```

### Buttons

```tsx
// Primary action
<button className="bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-medium">

// Destructive
<button className="bg-destructive text-white hover:bg-destructive/90 ...">

// Ghost / secondary
<button className="border border-border hover:bg-secondary text-foreground ...">
```

---

## Layout Shell

```
html.dark (or html without .dark for light)
└── body (bg-background text-foreground font-sans)
    └── Providers (ThemeProvider > AuthProvider)
        └── (dashboard)/layout.tsx
            ├── Sidebar (w-[220px] → w-[56px] collapsed)
            └── main (flex-1 flex-col)
                ├── Topbar (h-16 border-b border-border)
                └── main content (flex-1 overflow-y-auto p-6)
```

---

## Framer Motion Conventions

Used for sidebar collapse and page transitions. Keep animations subtle:

```tsx
// Sidebar collapse
<motion.div animate={{ width: collapsed ? 56 : 220 }} transition={{ duration: 0.2 }} />

// Fade in on mount
<motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} />
```

Never use bounce, spring with high stiffness, or animations > 400ms — enterprise feel requires restraint.

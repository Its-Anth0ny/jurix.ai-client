---
name: jurix-auth-frontend
description: Use when working on Jurix frontend auth — useAuth hook, login/signup pages, JWT token storage, ThemeProvider, or route guards in the dashboard layout.
---

# Jurix Frontend Auth

## Overview

JWT token stored in `localStorage` under key `jurix_auth`. `AuthProvider` and `ThemeProvider` both wrap the app via `app/providers.tsx`. Route guard in `app/(dashboard)/layout.tsx` redirects unauthenticated users to `/login`.

**Do not modify `lib/auth.ts` or `hooks/useAuth.tsx` without user confirmation.**

## Provider Tree

```tsx
// app/providers.tsx
export function Providers({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}

// app/layout.tsx
<Providers>{children}</Providers>
```

## Token Storage (lib/auth.ts)

```typescript
const AUTH_KEY = 'jurix_auth';

getAuth(): AuthData | null     // reads { token, user } from localStorage
setAuth(data: AuthData): void  // writes to localStorage
getToken(): string | null      // shorthand for getAuth()?.token
clearAuth(): void              // removes key (used on logout)
getCurrentUser(): User | null  // shorthand for getAuth()?.user
```

## useAuth Hook

```typescript
// hooks/useAuth.tsx
const { user, isLoading, login, signup, logout } = useAuth();

// login/signup call api.*, then setAuth() + setUser()
// logout calls clearAuth() + setUser(null) + router.push('/login')
// isLoading is true only during the initial localStorage hydration
```

## Route Guard (dashboard layout)

```typescript
// app/(dashboard)/layout.tsx
useEffect(() => {
  if (!isLoading && !user) router.push('/login');
}, [user, isLoading, router]);

// Show spinner while isLoading
// Return null if !user (prevents flash before redirect)
```

## Auth Page Pattern

Both login and signup use the same structure:
- `useState` for email, password, error, isLoading, showPassword
- Call `await login(email, password)` or `await signup(email, password)`
- On success: `router.push('/dashboard')`
- On error: display error in red alert box above submit button
- Submit button shows spinner + disabled while `isLoading`

## Constraints

- Token lives in `localStorage` — NOT HTTP-only cookies
- No refresh token — JWT expires after 24h, user must re-login
- `getCurrentUser()` returns the stored user object synchronously (no async)
- Theme toggle uses `useTheme()` from `hooks/useTheme.tsx` — separate from auth

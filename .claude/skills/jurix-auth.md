---
name: jurix-auth-frontend
description: Use when working on JURIX frontend auth — useAuth hook, login/signup pages, token storage in localStorage, or route guards.
---

# JURIX Frontend Auth

## Overview

JWT token stored in `localStorage` under `jurix_auth` key. `AuthProvider` context wraps the app. Route guard in dashboard layout redirects to `/login` if not authenticated.

## When to Use

- Modifying login/signup forms
- Changing auth hook behavior (login, signup, logout)
- Modifying token storage approach
- Changing route protection logic
- Debugging auth state issues

## Auth Storage

```typescript
// lib/auth.ts
const AUTH_KEY = 'jurix_auth'

export function getAuth(): AuthData | null {
  const stored = localStorage.getItem(AUTH_KEY)
  return stored ? JSON.parse(stored) : null
}

export function setAuth(data: AuthData): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(data))
}

export function getToken(): string | null {
  return getAuth()?.token ?? null
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_KEY)
}
```

## AuthProvider (useAuth hook)

```typescript
// hooks/useAuth.tsx — AuthProvider with login, signup, logout
// Initialized from localStorage on mount via useEffect

const login = useCallback(async (email: string, password: string) => {
  const response = await api.login(email, password)
  setAuth({ token: response.token, user: response.user })
  setUser(response.user)
}, [])
```

## Route Guard

```typescript
// (dashboard)/layout.tsx
useEffect(() => {
  if (!isLoading && !user) {
    router.push('/login')
  }
}, [user, isLoading, router])
```

## API Client Token Passing

```typescript
// lib/api.ts — token passed manually per-call
const token = getToken()
const response = await api.getDocument(id, token)

// Upload uses FormData (browser sets Content-Type automatically)
```

## Important Constraints

- Token is in localStorage — NOT HTTP-only cookies
- No token refresh — JWT expires after 24h, user must re-login manually
- `token` parameter is optional in `api.reviewDocument` but always passed by callers
- Must pass `token` from `getToken()` on every API call
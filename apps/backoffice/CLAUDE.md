# CLAUDE.md — apps/backoffice

> Admin panel. TanStack Start v1, React 19, port 3001.
> Only users with role `backoffice` can access protected routes.

---

## Folder Structure

```
src/
├── modules/          # Feature modules (auth, etc.)
│   └── {feature}/
│       ├── components/   # Feature components
│       ├── hooks/        # Feature hooks (use-{name}-actions.ts)
│       ├── schemas/      # Zod schemas ({feature}.schema.ts)
│       └── server/       # Server functions ({action}.fn.ts)
├── routes/
│   ├── __root.tsx
│   ├── auth/
│   │   └── sign-in.tsx         # /auth/sign-in (redirects if authenticated)
│   ├── _authed.tsx             # Protected layout — checks session + backoffice role
│   └── _authed/
│       └── dashboard.tsx       # /dashboard
├── middleware/
│   └── auth.ts           # createMiddleware().server() — checks session and role
├── lib/
│   └── auth-client.ts    # Better Auth client + inferAdditionalFields + adminClient
└── components/
    └── Header.tsx
```

---

## Rules

### Auth Routes

| File | URL |
|---|---|
| `auth/sign-in.tsx` | `/auth/sign-in` (redirects to `/dashboard` if already authenticated) |
| `_authed.tsx` | protected layout for `/_authed/*` |
| `_authed/dashboard.tsx` | `/dashboard` |

### Route Protection

The `authMiddleware` enforces **two conditions**:

1. User is authenticated — redirects to `/auth/sign-in`
2. User role is `backoffice` — redirects to `/auth/sign-in`

```ts
import { USER_ROLES } from '@repo/shared/constants'

if (!session) throw redirect({ to: '/auth/sign-in' })
if (session.user.role !== USER_ROLES.Backoffice) throw redirect({ to: '/auth/sign-in' })
```

### Auth Module (`src/modules/auth/`)

| File | Description |
|---|---|
| `schemas/auth.schema.ts` | `signInSchema`, `SignInRequest` |
| `hooks/use-auth-actions.ts` | `signIn`, `signOut` |
| `components/login-form.tsx` | Exports `SignInForm` |

### Type Naming — Request / Response

Types representing API payloads must use `...Request` / `...Response`. Never use `...Input`, `...Output`, `...Payload`, or `...Dto`.

```ts
// ✅
type SignInRequest = z.infer<typeof signInSchema>

// ❌
type LoginInput = ...
```

### Forms

Always use react-hook-form + zod + @hookform/resolvers. Never `useState` for form fields.

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signInSchema, type SignInRequest } from '../schemas/auth.schema'
```

### UI — @repo/ui

Always use `@repo/ui` components. Never raw native elements.

```tsx
import { Button } from '@repo/ui/components/button'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/card'
```

### Roles and Constants

Use `USER_ROLES` from `@repo/shared/constants` — never compare raw string literals.

```ts
import { USER_ROLES } from '@repo/shared/constants'

// ✅
if (session.user.role === USER_ROLES.Backoffice)

// ❌
if (session.user.role === 'backoffice')
```

---

## References

- [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md)
- [docs/CODING-STANDARDS.md](../../docs/CODING-STANDARDS.md)
- [TanStack Start](https://tanstack.com/start/latest)
- [Better Auth](https://www.better-auth.com)

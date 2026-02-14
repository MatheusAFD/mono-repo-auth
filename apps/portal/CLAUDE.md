# CLAUDE.md — apps/portal

> End-user portal. TanStack Start v1, React 19, port 3000.

---

## Folder Structure

```
src/
├── modules/          # Feature modules (auth, etc.)
│   └── {feature}/
│       ├── components/   # Feature components ({name}.tsx)
│       ├── hooks/        # Feature hooks (use-{name}-actions.ts)
│       ├── schemas/      # Zod schemas ({feature}.schema.ts)
│       └── server/       # Server functions ({action}.fn.ts)
├── routes/
│   ├── __root.tsx
│   ├── auth/
│   │   ├── sign-in.tsx         # /auth/sign-in (redirects if authenticated)
│   │   └── sign-up.tsx         # /auth/sign-up (redirects if authenticated)
│   ├── _authed.tsx             # Protected layout (authMiddleware)
│   └── _authed/
│       └── dashboard.tsx       # /dashboard
├── middleware/
│   └── auth.ts           # createMiddleware().server() — SSR session guard
├── lib/
│   └── auth-client.ts    # Better Auth client + inferAdditionalFields + adminClient
└── components/
    └── Header.tsx
```

---

## Rules

### Auth Routes

Public routes each have their own `beforeLoad` that redirects to `/dashboard` if already authenticated:

| File | URL |
|---|---|
| `auth/sign-in.tsx` | `/auth/sign-in` |
| `auth/sign-up.tsx` | `/auth/sign-up` |

Protected routes use the `_authed` prefix and `authMiddleware`:

| File | URL |
|---|---|
| `_authed.tsx` | layout for `/_authed/*` with `server: { middleware: [authMiddleware] }` |
| `_authed/dashboard.tsx` | `/dashboard` |

The `authMiddleware` redirects to `/auth/sign-in` when no session is found.

### Auth Module (`src/modules/auth/`)

| File | Description |
|---|---|
| `schemas/auth.schema.ts` | `signInSchema`, `signUpSchema`, `SignInRequest`, `SignUpRequest` |
| `hooks/use-auth-actions.ts` | `signIn`, `signUp`, `signOut` |
| `components/login-form.tsx` | Exports `SignInForm` |
| `components/register-form.tsx` | Exports `SignUpForm` |

### Type Naming — Request / Response

Types representing API payloads must use `...Request` / `...Response`. Never use `...Input`, `...Output`, `...Payload`, or `...Dto`.

```ts
// ✅
type SignInRequest = z.infer<typeof signInSchema>
type SignUpRequest = z.infer<typeof signUpSchema>
type CreatePetRequest = z.infer<typeof createPetSchema>

// ❌
type LoginInput = ...
type RegisterInput = ...
```

### Forms

Always use react-hook-form + zod + @hookform/resolvers. Never `useState` for form fields.

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signInSchema, type SignInRequest } from '../schemas/auth.schema'

const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignInRequest>({
  resolver: zodResolver(signInSchema),
})
```

### UI — @repo/ui

Always use `@repo/ui` components. Never use raw native elements.

```tsx
import { Button } from '@repo/ui/components/button'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/card'
```

### Navigation

Always use `<Link>` from `@tanstack/react-router` for internal links, never `<a href>`.

```tsx
import { Link } from '@tanstack/react-router'
<Link to="/auth/sign-up">Create account</Link>
<Link to="/auth/sign-in">Sign in</Link>
```

### Session

```tsx
import { authClient } from '@/lib/auth-client'

// Reactive (components)
const { data: session } = authClient.useSession()

// One-shot (beforeLoad)
const { data: session } = await authClient.getSession()
```

---

## References

- [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md)
- [docs/CODING-STANDARDS.md](../../docs/CODING-STANDARDS.md)
- [TanStack Start](https://tanstack.com/start/latest)
- [Better Auth](https://www.better-auth.com)

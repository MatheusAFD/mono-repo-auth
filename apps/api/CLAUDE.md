# CLAUDE.md — apps/api (Backend)

> REST API. NestJS v11, Express, Drizzle ORM, Better Auth v1.4.18, PostgreSQL. Port 4000.

---

## Folder Structure

```
src/
├── auth/
│   ├── auth.ts           # Better Auth central config (betterAuth())
│   └── permissions.ts    # RBAC — accessControl, roles (portal, backoffice)
├── modules/
│   └── sessions/
│       ├── sessions.module.ts      # NestJS module
│       ├── sessions.controller.ts  # @Roles(['backoffice']) protected routes
│       └── sessions.service.ts     # Better Auth API interaction
├── config/
│   └── database/
│       ├── index.ts   # Drizzle + postgres connection (with DATABASE_URL validation)
│       └── schema.ts  # Drizzle schema (Better Auth tables + extensions)
└── main.ts           # NestJS bootstrap
```

---

## Better Auth

All auth routes are exposed at `/api/auth/*` by Better Auth.
**Do not** create auth routes manually — the `AuthController` bridges Express → Better Auth.

### Current config (`src/auth/auth.ts`)

- `appName`: 'Mono Repo Auth'
- `session.cookieCache`: enabled, 5 minutes — reduces DB queries per request
- `plugins`: `admin` with roles `portal` (default) and `backoffice`
- `trustedOrigins`: reads `ALLOWED_ORIGINS` from env (localhost:3000 and 3001 as fallback)

### RBAC / Roles

Roles defined in `src/auth/permissions.ts`:

```ts
import { USER_ROLES } from '@repo/shared/constants'
// portal     → access to apps/portal
// backoffice → access to apps/backoffice
```

Always use `USER_ROLES` from `@repo/shared/constants` — never raw string literals.

---

## NestJS Conventions

### Create a module

```bash
nest g module modules/{name}
nest g controller modules/{name}
nest g service modules/{name}
```

### Public vs protected routes

All routes are protected by default (global AuthGuard from `@thallesp/nestjs-better-auth`).

```ts
import { AllowAnonymous } from '@thallesp/nestjs-better-auth'

@AllowAnonymous()
@Get('health')
healthCheck() { return { status: 'ok' } }
```

### Current user session

```ts
import { Session, type UserSession } from '@thallesp/nestjs-better-auth'

@Get('me')
getMe(@Session() session: UserSession) { return session.user }
```

### Role-based access

```ts
import { Roles } from '@thallesp/nestjs-better-auth'

@Controller('sessions')
@Roles(['backoffice'])
export class SessionsController { ... }
```

### Error handling (Go-style)

```ts
// Services return tuple [Error | null, Data | null]
const [error, data] = await someService.doSomething()
if (error) throw new BadRequestException(error.message)
return data
```

---

## Database

### Required environment variables

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mono_repo_auth
BETTER_AUTH_SECRET=<min 32 chars>
BETTER_AUTH_URL=http://localhost:4000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

Missing `DATABASE_URL` throws `Error: DATABASE_URL environment variable is not set` on startup.

### Drizzle migrations

```bash
pnpm --filter @repo/api db:generate   # generate migration
pnpm --filter @repo/api db:migrate    # apply migration
pnpm --filter @repo/api db:studio     # Drizzle Studio
```

**Re-run after** modifying `src/auth/auth.ts` (adding plugins that change the schema).

### Docker (PostgreSQL + Redis)

```bash
cd apps/api
docker-compose up -d
```

---

## References

- [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md)
- [docs/CODING-STANDARDS.md](../../docs/CODING-STANDARDS.md)
- [NestJS](https://nestjs.com)
- [Drizzle ORM](https://orm.drizzle.team)
- [Better Auth](https://www.better-auth.com)

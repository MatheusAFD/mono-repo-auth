# mono-repo-auth

A full-stack monorepo starter with **authentication built-in**, featuring a user portal, an admin backoffice, a REST API, and a shared design system — all wired together with Better Auth.

## Stack

| App / Package | Tech |
|---|---|
| **Portal** (`apps/portal`) | TanStack Start, React 19, TanStack Query |
| **Backoffice** (`apps/backoffice`) | TanStack Start, React 19, TanStack Query |
| **API** (`apps/api`) | NestJS 11, Drizzle ORM, PostgreSQL |
| **UI** (`packages/ui`) | Shadcn/UI + Radix UI, Tailwind CSS v4 |
| **Auth** (`packages/auth`) | Better Auth (shared client) |
| **Shared** (`packages/shared`) | TypeScript — types & utilities |

**Tooling:** Turborepo · pnpm · Biome · TypeScript 5

## Getting Started

```bash
# 1. Install dependencies
pnpm install

# 2. Start infrastructure (PostgreSQL + Redis)
cd apps/api && docker-compose up -d && cd ../..

# 3. Set up environment variables
cp apps/api/.env.example apps/api/.env
cp apps/portal/.env.example apps/portal/.env
cp apps/backoffice/.env.example apps/backoffice/.env
# edit each .env as needed

# 4. Run database migrations
pnpm --filter @repo/api db:migrate

# 5. Start all apps in dev mode
pnpm dev
```

| Service | URL |
|---|---|
| Portal | http://localhost:3000 |
| Backoffice | http://localhost:3001 |
| API | http://localhost:4000 |

## Project Structure

```
├── apps/
│   ├── portal/            # End-user portal
│   ├── backoffice/        # Admin panel
│   └── api/               # REST API + auth server
├── packages/
│   ├── ui/                # Shared component library
│   ├── auth/              # Better Auth client config
│   ├── shared/            # Shared types & utilities
│   └── typescript-config/ # Base tsconfig presets
├── turbo.json
├── biome.json
└── pnpm-workspace.yaml
```

## Scripts

```bash
pnpm dev          # Start all apps
pnpm build        # Production build
pnpm typecheck    # Type-check everything
pnpm lint         # Lint all packages
pnpm format       # Format with Biome
```

## License

Private.

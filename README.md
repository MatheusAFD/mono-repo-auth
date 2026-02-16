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

**Tooling:** Turborepo · pnpm · Biome · Husky · Playwright · TypeScript 5

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
├── e2e/                  # Playwright E2E tests
│   ├── portal/
│   └── backoffice/
├── turbo.json
├── biome.json
├── playwright.config.ts
├── commitlint.config.ts
└── pnpm-workspace.yaml
```

## Scripts

```bash
pnpm dev                # Start all apps
pnpm build              # Production build
pnpm typecheck          # Type-check everything
pnpm lint               # Lint all packages
pnpm format             # Format with Biome
pnpm test               # Unit tests (all packages)
pnpm test:all           # Unit tests + E2E tests
pnpm test:e2e           # E2E tests (Playwright)
pnpm test:e2e:portal    # E2E tests — portal only
pnpm test:e2e:backoffice # E2E tests — backoffice only
pnpm test:e2e:ui        # E2E tests — interactive UI mode
```

## Testing

Unit tests use **Vitest** (portal, backoffice) and **Jest** (API). E2E tests use **Playwright** with projects for portal and backoffice.

```bash
# Run all unit tests
pnpm test

# Run E2E tests (starts API, Portal, and Backoffice automatically)
pnpm test:e2e

# Run everything (unit + E2E)
pnpm test:all
```

## Git Hooks

Managed by **Husky** with the following hooks:

| Hook | What it does |
|---|---|
| `pre-commit` | Auto-fixes formatting and lint issues, then re-stages files |
| `commit-msg` | Enforces [Conventional Commits](https://www.conventionalcommits.org/) via commitlint |
| `pre-push` | Runs full build + all tests (unit + E2E) — blocks push on failure |

## License

Private.

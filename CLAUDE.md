# CLAUDE.md — Mono Repo Auth

> Guia de referência para o Claude Code trabalhar neste monorepo.
> As regras completas de arquitetura e padrões de código estão em [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) e [`docs/CODING-STANDARDS.md`](docs/CODING-STANDARDS.md).

---

## Estrutura do Monorepo

```
mono-repo-auth/
├── apps/
│   ├── portal/          # TanStack Start (porta 3000) — portal do usuário final
│   ├── backoffice/      # TanStack Start (porta 3001) — painel administrativo
│   └── api/             # NestJS + Express (porta 4000) — API REST
├── packages/
│   ├── ui/              # Biblioteca de componentes (Vite + Shadcn/UI + Radix UI)
│   ├── auth/            # Configurações compartilhadas do Better Auth
│   ├── shared/          # Tipos e utilitários compartilhados
│   └── typescript-config/ # tsconfig bases reutilizáveis
├── docs/
│   ├── ARCHITECTURE.md
│   └── CODING-STANDARDS.md
├── turbo.json
├── biome.json
└── pnpm-workspace.yaml
```

---

## Tech Stack

| Projeto | Tecnologia | Porta |
|---|---|---|
| `apps/portal` | TanStack Start v1, React 19, TanStack Query, Better Auth client | 3000 |
| `apps/backoffice` | TanStack Start v1, React 19, TanStack Query, Better Auth client | 3001 |
| `apps/api` | NestJS v11, Express, Drizzle ORM, Better Auth, PostgreSQL | 4000 |
| `packages/ui` | Vite, React 19, Shadcn/UI (estilo), Radix UI | — |
| `packages/auth` | better-auth (shared client factory) | — |
| `packages/shared` | TypeScript puro — tipos e utilitários Result/ok/err | — |

---

## Comandos Principais

```bash
# Instalar todas as dependências
pnpm install

# Desenvolvimento (todos os projetos em paralelo)
pnpm dev

# Desenvolvimento por projeto específico
pnpm --filter @repo/portal dev
pnpm --filter @repo/backoffice dev
pnpm --filter @repo/api dev

# Build de produção
pnpm build

# Typecheck em todos os projetos
pnpm typecheck

# Lint + format
pnpm lint
pnpm format

# Backend — infraestrutura Docker
cd apps/api && docker-compose up -d

# Backend — migrations Drizzle
pnpm --filter @repo/api db:generate
pnpm --filter @repo/api db:migrate
pnpm --filter @repo/api db:studio
```

---

## Variáveis de Ambiente

**IMPORTANTE:** Cada projeto tem seu próprio `.env.example`. Nunca commitar `.env`.

### `apps/portal/.env`
```env
VITE_API_URL=http://localhost:4000
```

### `apps/backoffice/.env`
```env
VITE_API_URL=http://localhost:4000
```

### `apps/api/.env`
```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mono_repo_auth
BETTER_AUTH_SECRET=your-super-secret-key-change-in-production-min-32-chars
BETTER_AUTH_URL=http://localhost:4000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

---

## MCP Servers Recomendados

Configure no seu `~/.claude/settings.json` ou `.claude/settings.local.json`:

```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["-y", "shadcn@latest", "mcp"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/matheusfernandes/www/mono-repo-auth"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<seu-token>"
      }
    }
  }
}
```

> **shadcn MCP**: permite ao Claude adicionar componentes diretamente com `npx shadcn@latest add <component>` no pacote `packages/ui`.
> **filesystem MCP**: navegação rápida pelo monorepo.

---

## Padrões Chave (resumo — detalhes em docs/)

### Tratamento de Erros (Go-style)

```ts
// SEMPRE use Result tuple em services
const [error, data] = await someService.doSomething()
if (error) return [error, null]
return [null, data]

// Helpers disponíveis em @repo/shared
import { ok, err, isErr } from '@repo/shared'
```

### Nomenclatura de Arquivos

- Componentes: `kebab-case.tsx` (ex: `login-form.tsx`)
- Hooks: `use-kebab-case.ts` (ex: `use-auth-actions.ts`)
- Server functions: `kebab-case.fn.ts` (ex: `get-session.fn.ts`)
- Schemas: `kebab-case.schema.ts` (ex: `auth.schema.ts`)
- Tipos/domínio: `kebab-case.domain.ts` (ex: `user.domain.ts`)

### Exports

- **Named exports** em tudo (exceto rotas TanStack que exigem default)
- Interface de props: `{ComponentName}Props`

### Imports com alias

```ts
// ✅ Use alias @/ para imports dentro do mesmo app
import { cn } from '@/common/lib/utils'

// ✅ Use o nome do pacote para imports entre pacotes
import { Button } from '@repo/ui'
import { ok, err } from '@repo/shared'
```

### Componentes UI

Os componentes em `packages/ui` usam **Radix UI** como primitivos headless, com estilização via Tailwind CSS v4 e CVA.

Para adicionar novos componentes Shadcn ao `packages/ui`:
```bash
cd packages/ui
npx shadcn@latest add <component>
```

---

## Estrutura de Módulo (Portal/Backoffice)

```
src/modules/{feature}/
├── components/      # Componentes específicos da feature
├── hooks/           # Hooks específicos (use-{feature}-actions.ts)
├── schemas/         # Schemas Zod ({feature}.schema.ts)
├── server/          # TanStack Start server functions ({action}.fn.ts)
├── providers/       # Context providers (se necessário)
└── domain/          # Tipos de domínio ({feature}.domain.ts)
```

---

## Backend — Convenções NestJS

### Criar novo módulo
```bash
nest g module modules/{name}
nest g controller modules/{name}
nest g service modules/{name}
```

### Rotas protegidas vs públicas
```ts
// Todas as rotas são protegidas por padrão (AuthGuard global)
// Para tornar pública:
import { AllowAnonymous } from '@thallesp/nestjs-better-auth'

@AllowAnonymous()
@Get('health')
healthCheck() { ... }
```

### Obter sessão do usuário
```ts
import { Session, type UserSession } from '@thallesp/nestjs-better-auth'

@Get('me')
getMe(@Session() session: UserSession) { return session.user }
```

### Proteger por role
```ts
import { Roles } from '@thallesp/nestjs-better-auth'

@Controller('sessions')
@Roles(['backoffice']) // Apenas usuários com role 'backoffice'
export class SessionsController { ... }
```

### Better Auth no Backend

Better Auth expõe todas as rotas de autenticação em `/api/auth/*`. O `AuthModule` de `@thallesp/nestjs-better-auth` faz o bridge entre Express e o handler Better Auth. **Não** crie rotas de autenticação manualmente.

---

## Infraestrutura (Docker)

```bash
# Subir PostgreSQL + Redis localmente
cd apps/api
docker-compose up -d

# Verificar serviços
docker-compose ps

# Parar
docker-compose down

# Parar e remover volumes (CUIDADO: apaga dados)
docker-compose down -v
```

Serviços disponíveis após `docker-compose up`:
- PostgreSQL: `localhost:5432` (user: `postgres`, pass: `postgres`, db: `mono_repo_auth`)
- Redis: `localhost:6379`

---

## Fluxo de Desenvolvimento

1. `docker-compose up -d` no backend para subir o banco
2. Copiar `.env.example` para `.env` em cada app e preencher
3. `pnpm install` na raiz
4. `pnpm --filter @repo/api db:migrate` para rodar as migrations
5. `pnpm dev` para iniciar todos os serviços

---

## Referências

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — Arquitetura e padrões de serviço
- [docs/CODING-STANDARDS.md](docs/CODING-STANDARDS.md) — Padrões de código detalhados
- [TanStack Start](https://tanstack.com/start/latest)
- [TanStack Router](https://tanstack.com/router/latest)
- [Better Auth](https://www.better-auth.com)
- [Radix UI](https://www.radix-ui.com)
- [Shadcn/UI](https://ui.shadcn.com)
- [NestJS](https://nestjs.com)
- [Drizzle ORM](https://orm.drizzle.team)
- [Turborepo](https://turbo.build)

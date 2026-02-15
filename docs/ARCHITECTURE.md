# Mono Repo Auth - Architecture Documentation

## Architecture Overview

This project follows a **modular monolith architecture** with clear separation of concerns across a monorepo with three apps and shared packages.

```
mono-repo-auth/
├── apps/
│   ├── portal/          # TanStack Start — portal do usuário (porta 3000)
│   ├── backoffice/      # TanStack Start — painel administrativo (porta 3001)
│   └── api/             # NestJS — API REST (porta 4000)
├── packages/
│   ├── ui/              # Componentes compartilhados (Shadcn + Radix)
│   ├── auth/            # Configuração Better Auth compartilhada
│   ├── shared/          # Tipos, constantes e utilitários
│   └── typescript-config/
└── docs/
```

## Core Principles

1. **Feature Modules**: Cada feature é autocontida em `modules/` com seus componentes, schemas, hooks e server functions
2. **Service Layer**: Comunicação HTTP abstraída em classes de serviço com injeção de dependência
3. **Go-style Error Handling**: Tuplas `[Error | null, Data | null]` em toda a camada de serviço
4. **Type Safety**: TypeScript estrito com validação runtime via Zod
5. **Server Functions**: TanStack Start server functions para SSR data fetching

## Estrutura de Módulo (Portal/Backoffice)

```
src/
├── common/
│   ├── constants/       # Constantes (http-status-code, times, etc.)
│   └── utils/           # Utilitários puros (logger, etc.)
├── lib/
│   └── auth-client.ts   # Better Auth client configurado
├── middleware/
│   └── auth.ts          # Middleware de autenticação SSR
├── modules/
│   └── {feature}/
│       ├── components/  # Componentes da feature
│       ├── hooks/       # Hooks específicos
│       ├── schemas/     # Schemas Zod
│       ├── domain/      # Tipos de domínio
│       └── server/      # Server functions (TanStack Start)
├── services/
│   ├── adapters/        # FetchHttpClientAdapter
│   ├── factories/       # httpHttpClientFactory
│   ├── error.ts         # ApiError, AuthenticationError, ForbiddenError
│   └── http/
│       └── {entity}/
│           ├── {entity}-service.ts      # Classe de serviço
│           ├── use-{entity}-service.ts   # Hooks TanStack Query
│           └── index.ts                  # Instância do serviço
├── types/
│   └── http.ts          # HttpClient, RequestConfig, Response
├── env.ts               # Variáveis de ambiente tipadas
├── routes/              # File-based routing
└── router.tsx           # Configuração do TanStack Router
```

## Service Layer Pattern

### HttpClient Interface

```ts
type HttpClient = {
  request<T>(config: RequestConfig): Promise<[ApiError | null, Response<T> | null]>
}

type RequestConfig = {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
  params?: Record<string, string>
}
```

### Service Class

```ts
export type ISessionsService = {
  listSessions(): Promise<[Error | null, SessionItem[] | null]>
  revokeSession(token: string): Promise<[Error | null, RevokeSessionResponse | null]>
}

export class SessionsService implements ISessionsService {
  constructor(readonly httpClient: HttpClient) {}

  async listSessions(): Promise<[Error | null, SessionItem[] | null]> {
    const [error, response] = await this.httpClient.request<SessionItem[]>({
      url: '/sessions',
      method: 'GET'
    })

    if (error || !response) {
      return [error, null]
    }

    return [null, response.data]
  }
}
```

### Service Instance (index.ts)

```ts
import { env } from '@/env'
import { httpHttpClientFactory } from '@/services/factories/http-client-factory'
import { SessionsService } from './sessions-service'

const apiClient = httpHttpClientFactory(env.VITE_API_URL)

export const sessionsService = new SessionsService(apiClient)
```

### TanStack Query Hooks

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sessionsService } from '.'

export const sessionsQueryKey = 'sessions' as const

export function useSessions() {
  return useQuery({
    queryKey: [sessionsQueryKey],
    queryFn: async () => {
      const [error, result] = await sessionsService.listSessions()

      if (error || !result) {
        throw error || new Error('Failed to fetch sessions')
      }

      return result
    },
  })
}

export function useRevokeSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (token: string) => {
      const [error, result] = await sessionsService.revokeSession(token)

      if (error || !result) {
        throw error || new Error('Failed to revoke session')
      }

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [sessionsQueryKey] })
    },
  })
}
```

### Exemplos de Requisições HTTP

#### GET — Listar recursos

```ts
async listSessions(): Promise<[Error | null, SessionItem[] | null]> {
  const [error, response] = await this.httpClient.request<SessionItem[]>({
    url: '/sessions',
    method: 'GET'
  })

  if (error || !response) return [error, null]
  return [null, response.data]
}
```

#### GET — Buscar por ID

```ts
async getById(id: string): Promise<[Error | null, User | null]> {
  const [error, response] = await this.httpClient.request<User>({
    url: `/users/${id}`,
    method: 'GET'
  })

  if (error || !response) return [error, null]
  return [null, response.data]
}
```

#### POST — Criar recurso

```ts
async create(data: CreateUserRequest): Promise<[Error | null, User | null]> {
  const [error, response] = await this.httpClient.request<User>({
    url: '/users',
    method: 'POST',
    body: data
  })

  if (error || !response) return [error, null]
  return [null, response.data]
}
```

#### PUT/PATCH — Atualizar recurso

```ts
async update(
  id: string,
  data: UpdateUserRequest
): Promise<[Error | null, User | null]> {
  const [error, response] = await this.httpClient.request<User>({
    url: `/users/${id}`,
    method: 'PATCH',
    body: data
  })

  if (error || !response) return [error, null]
  return [null, response.data]
}
```

#### DELETE — Remover recurso

```ts
async delete(id: string): Promise<[Error | null, { success: boolean } | null]> {
  const [error, response] = await this.httpClient.request<{ success: boolean }>({
    url: `/users/${id}`,
    method: 'DELETE'
  })

  if (error || !response) return [error, null]
  return [null, response.data]
}
```

#### GET com Query Params

```ts
async search(
  query: string,
  page: number
): Promise<[Error | null, PaginatedResponse<User> | null]> {
  const [error, response] = await this.httpClient.request<PaginatedResponse<User>>({
    url: '/users',
    method: 'GET',
    params: {
      q: query,
      page: String(page),
      limit: '20'
    }
  })

  if (error || !response) return [error, null]
  return [null, response.data]
}
```

#### POST com FormData (Upload)

```ts
async uploadAvatar(
  userId: string,
  file: File
): Promise<[Error | null, { url: string } | null]> {
  const formData = new FormData()
  formData.append('avatar', file)

  const [error, response] = await this.httpClient.request<{ url: string }>({
    url: `/users/${userId}/avatar`,
    method: 'POST',
    body: formData // FetchHttpClientAdapter detecta FormData automaticamente
  })

  if (error || !response) return [error, null]
  return [null, response.data]
}
```

## State Management

### TanStack Query (Server State)

```ts
const { data, isLoading } = useQuery({
  queryKey: ['sessions'],
  queryFn: async () => {
    const [error, result] = await sessionsService.listSessions()
    if (error || !result) throw error || new Error('Failed')
    return result
  },
})
```

**Rules:**

- Use TanStack Query para todo dado vindo do servidor
- Use `useState` para estado simples de componente
- Use Context + hooks para estado scoped por feature

## Protected Routes

### TanStack Start Middleware

```ts
import { redirect } from '@tanstack/react-router'
import { createMiddleware } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { authClient } from '@/lib/auth-client'

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const { data: session } = await authClient.getSession({
    fetchOptions: { headers: getRequestHeaders() },
  })

  if (!session) throw redirect({ to: '/auth/sign-in' })

  return next({ context: { session } })
})
```

### Route Layout protegido

```ts
export const Route = createFileRoute('/_authed')({
  component: AuthedLayout,
  server: {
    middleware: [authMiddleware],
  },
})
```

## Error Handling

### Custom Error Classes

```ts
export class ApiError extends Error {
  status: number
  statusText?: string
  url?: string
  method?: string
  code?: number

  constructor(data: ApiErrorData) { ... }
  toJSON() { ... }
  toString() { ... }
}

export class AuthenticationError extends ApiError {
  constructor() {
    super({ status: 401, code: 401, message: 'Usuário não autorizado', error: true })
  }
}

export class ForbiddenError extends ApiError {
  constructor() {
    super({ status: 403, code: 403, message: 'Acesso proibido', error: true })
  }
}
```

### HTTP Status Codes

```ts
import { HttpStatusCodes } from '@/common/constants/http-status-code'

if (error.status === HttpStatusCodes.UNAUTHORIZED) {
  // Handle 401
}
```

## Backend (NestJS) — Convenções

### Módulo com RBAC

```ts
@Controller('sessions')
@Roles(['backoffice']) // Apenas usuários com role 'backoffice'
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  async listSessions(@Session() session: UserSession) {
    return this.sessionsService.listSessions(session)
  }
}
```

### Decorators disponíveis (@thallesp/nestjs-better-auth)

- `@AllowAnonymous()` — Rota pública
- `@Roles(['backoffice'])` — Requer role específica
- `@Session()` — Injetar sessão do usuário
- `@OptionalAuth()` — Autenticação opcional

### Rotas públicas vs protegidas

Todas as rotas são protegidas por padrão (AuthGuard global). Para tornar pública:

```ts
@AllowAnonymous()
@Get('health')
healthCheck() { return { status: 'ok' } }
```

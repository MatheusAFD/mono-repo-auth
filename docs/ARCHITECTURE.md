# Achou Pet - Architecture Documentation

## Architecture Overview

This project follows a **modular monolith architecture** with clear separation of concerns:

```
src/
├── common/          # Shared utilities, components, and integrations
├── modules/         # Feature modules (auth, pet, register-pet, landing-page)
├── services/        # Business logic and API communication
├── domain/          # Domain models and types
├── routes/          # File-based routing
├── mocks/           # MSW mock handlers for development
└── constants/       # Application-wide constants
```

## Core Principles

1. **Feature Modules**: Each feature is self-contained in `modules/` with its own components, schemas, hooks, and server functions
2. **Service Layer**: HTTP communication abstracted through service classes with dependency injection
3. **Domain-Driven**: Domain models defined separately in `domain/` folder
4. **Type Safety**: Strict TypeScript configuration with runtime validation via Zod
5. **Server Functions**: TanStack Start server functions for SSR data fetching

## Folder Structure

### `/common` - Shared Resources

```
common/
├── components/
│   ├── ui/           # Base Shadcn components
│   └── fields/       # Form field components with built-in validation
├── hooks/            # Reusable React hooks
├── integrations/     # Third-party integrations (TanStack Query setup)
├── lib/              # Utility libraries (cn helper, etc.)
└── utils/            # Pure utility functions
```

### `/modules` - Feature Modules

Each module follows this structure:

```
modules/{feature}/
├── components/       # Feature-specific components
├── hooks/            # Feature-specific hooks
├── schemas/          # Zod validation schemas
├── server/           # TanStack Start server functions
├── providers/        # Context providers
├── domain/           # Domain types (alternatively in /domain)
└── constants/        # Feature constants
```

**Current Modules:**

- `auth` - Authentication and user management
- `pet` - Pet profile display and tracking
- `register-pet` - Multi-step pet registration form
- `landing-page` - Marketing pages and content

### `/services` - Service Layer

```
services/
├── http/
│   └── {entity}/
│       ├── {entity}-service.ts    # Service class
│       ├── use-{entity}-service.ts # React hook wrapper
│       └── index.ts                # Exports
├── adapters/         # HTTP client adapters (fetch, etc.)
└── factories/        # Service factories for DI
```

### `/domain` - Domain Models

Domain types and business entities:

- `{entity}.domain.ts` - Entity types, inputs, outputs

## Service Layer Pattern

### Service Class with Go-style Error Handling

All services now use tuple-based error handling `[Error | null, Data | null]` inspired by Go:

```tsx
export type IPetService = {
  getPetByTrackingCode(
    trackingCode: string
  ): Promise<[Error | null, GetPetByTrackingCodeResponse | null]>
  createPet(
    input: CreatePetInput,
    token: string
  ): Promise<[Error | null, PetOutput | null]>
}

export class PetService implements IPetService {
  constructor(readonly httpClient: HttpClient) {}

  async getPetByTrackingCode(
    trackingCode: string
  ): Promise<[Error | null, GetPetByTrackingCodeResponse | null]> {
    const [error, response] =
      await this.httpClient.request<GetPetByTrackingCodeResponse>({
        url: `/t/${trackingCode}`,
        method: 'GET'
      })

    if (error || !response) {
      return [error, null]
    }

    return [null, response.data]
  }
}
```

### Service Hook

```tsx
export function usePetService() {
  const httpClient = HttpClientFactory.create()
  return new PetService(httpClient)
}
```

**Rules:**

- Define interface for each service with tuple return types
- Constructor injection for dependencies
- Use factory pattern for service creation
- Provide React hook wrapper for component usage
- Always return `[Error | null, Data | null]` tuple
- Check error before accessing data

## State Management

### TanStack Query (Server State)

```tsx
const { data, isLoading } = useQuery({
  queryKey: ['pets', trackingCode],
  queryFn: () => petService.getPetByTrackingCode(trackingCode),
  staleTime: 1000 * 60 * 5, // 5 minutes
})
```

### Zustand (Client State)

```tsx
import { create } from 'zustand'

interface FormStore {
  currentStep: number
  setCurrentStep: (step: number) => void
}

export const useFormStore = create<FormStore>((set) => ({
  currentStep: 0,
  setCurrentStep: (step) => set({ currentStep: step }),
}))
```

**Rules:**

- Use TanStack Query for all server data
- Use Zustand for complex client state
- Use `useState` for simple component state
- Use Context + hooks for feature-scoped state (see `AuthProvider`)

## Performance Considerations

1. **React Compiler**: Enabled via Babel plugin for automatic memoization
2. **Route-based code splitting**: Automatic with TanStack Router
3. **Image optimization**: Use `@unpic/react` for responsive images
4. **Query caching**: TanStack Query with configured stale times

## Common Patterns

### Multi-step Forms

See `modules/register-pet` for reference:

- Use custom `useMultiStepForm` hook
- Store form state in Zustand
- Validate each step with Zod
- Show progress with `Stepper` component

### Protected Routes

Use TanStack Router's `beforeLoad`:

```tsx
export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const user = await getCurrentUserFn()
    if (!user) throw redirect({ to: '/' })
  },
})
```

### Error Handling

#### Go-style Tuple Error Handling

The application uses tuple-based error handling `[Error | null, Data | null]` for explicit error management:

```tsx
// In service layer
async getPetByTrackingCode(
  trackingCode: string
): Promise<[Error | null, GetPetByTrackingCodeResponse | null]> {
  const [error, response] = await this.httpClient.request<GetPetByTrackingCodeResponse>({
    url: `/t/${trackingCode}`,
    method: 'GET'
  })

  if (error || !response) {
    return [error, null]
  }

  return [null, response.data]
}

// In component or server function
const [error, pet] = await petService.getPetByTrackingCode(trackingCode)

if (error) {
  // Handle error explicitly
  console.error('Failed to fetch pet:', error)
  return null
}

// Type-safe data access (pet is guaranteed to be non-null here)
return pet
```

#### Custom Error Classes

```tsx
export class ApiError extends Error {
  status: number
  statusText?: string
  url?: string
  method?: string
  title?: string
  type?: string
  errors?: ApiErrorError[]
  messages?: string[]

  constructor(data: ApiErrorData) {
    const errorMessage =
      data.Message || data.message || data.detail || data.title || 'HTTP Error'
    super(errorMessage)

    this.status = data.status
    this.statusText = data.statusText
    this.url = data.url
    this.method = data.method
    // ... other properties
  }
}

// Specialized error classes
export class AuthenticationError extends ApiError {
  constructor() {
    super({ status: 401, title: 'Usuário não autorizado' })
  }
}

export class ForbiddenError extends ApiError {
  constructor() {
    super({ status: 403, title: 'Acesso proibido' })
  }
}
```

#### Error Serialization for SSR

For TanStack Start server functions, errors must be serializable:

```tsx
import { serializeApiError, type SerializedApiError } from '@/utils/serialize-api-error'

// Server function
export const getPetFn = createServerFn('GET', async (trackingCode: string) => {
  const petService = usePetService()
  const [error, pet] = await petService.getPetByTrackingCode(trackingCode)

  if (error) {
    // Serialize error for SSR
    return {
      error: serializeApiError(error),
      data: null
    }
  }

  return {
    error: null,
    data: pet
  }
})
```

#### HTTP Status Codes Constants

Use centralized HTTP status codes:

```tsx
import { HTTP_STATUS } from '@/common/constants/http-status'

if (error && 'status' in error) {
  if (error.status === HTTP_STATUS.UNAUTHORIZED) {
    // Handle unauthorized
  } else if (error.status === HTTP_STATUS.NOT_FOUND) {
    // Handle not found
  }
}
```

**Benefits of Tuple Error Handling:**

- ✅ Explicit error handling (no forgotten try/catch)
- ✅ Type-safe error checking
- ✅ No exception throwing in success path
- ✅ Clear separation of error and success cases
- ✅ Easier to test and reason about
- ✅ Consistent pattern across all services

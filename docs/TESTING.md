# Testing — Guia de Testes E2E com Playwright

## Visão Geral

O monorepo usa **Playwright** para testes E2E dos frontends (Portal e Backoffice). A configuração está na raiz do projeto em `playwright.config.ts` com dois projetos separados, cada um apontando para seu respectivo app.

| Projeto | App | Base URL | Diretório de Testes |
|---|---|---|---|
| `portal` | `apps/portal` | `http://localhost:3000` | `e2e/portal/` |
| `backoffice` | `apps/backoffice` | `http://localhost:3001` | `e2e/backoffice/` |

Os três dev servers (API, Portal, Backoffice) são iniciados automaticamente via `webServer` do Playwright.

---

## Estrutura de Diretórios

```
e2e/
├── portal/
│   ├── home.spec.ts
│   ├── sign-in.spec.ts
│   └── {feature}.spec.ts
└── backoffice/
    ├── home.spec.ts
    ├── sign-in.spec.ts
    └── {feature}.spec.ts
```

### Nomenclatura

- Arquivos de teste: `kebab-case.spec.ts` (ex: `sign-in.spec.ts`, `user-profile.spec.ts`)
- Descreva o que está testando no nome do arquivo, agrupando por feature

---

## Comandos

```bash
# Rodar todos os testes E2E
pnpm test:e2e

# Rodar apenas portal
pnpm test:e2e:portal

# Rodar apenas backoffice
pnpm test:e2e:backoffice

# UI Mode — debugging interativo com time travel
pnpm test:e2e:ui

# Rodar teste específico
npx playwright test e2e/portal/sign-in.spec.ts

# Com browser visível
npx playwright test --headed

# Ver relatório HTML após execução
npx playwright show-report

# Rodar em modo debug (passo a passo)
npx playwright test --debug
```

---

## Escrevendo Testes

### Estrutura básica

```ts
import { test, expect } from '@playwright/test'

test.describe('Sign In', () => {
  test('should sign in with valid credentials', async ({ page }) => {
    await page.goto('/auth/sign-in')

    await page.getByLabel('Email').fill('user@example.com')
    await page.getByLabel('Senha').fill('password123')
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByRole('heading')).toHaveText('Dashboard')
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/sign-in')

    await page.getByLabel('Email').fill('wrong@example.com')
    await page.getByLabel('Senha').fill('wrongpassword')
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page.getByText('Credenciais inválidas')).toBeVisible()
  })
})
```

---

## Boas Práticas

### 1. Use locators acessíveis

Prefira locators que refletem como o usuário interage com a página:

```ts
// ✅ Correto — locators acessíveis (resistentes a mudanças de UI)
page.getByRole('button', { name: 'Salvar' })
page.getByLabel('Email')
page.getByText('Bem-vindo')
page.getByPlaceholder('Digite seu nome')
page.getByTestId('user-avatar')  // quando não há alternativa acessível

// ❌ Incorreto — seletores frágeis
page.locator('.btn-primary')
page.locator('#submit-btn')
page.locator('div > form > button:nth-child(2)')
```

**Ordem de preferência:**
1. `getByRole()` — botões, links, headings, inputs
2. `getByLabel()` — campos de formulário
3. `getByText()` — texto visível
4. `getByPlaceholder()` — inputs com placeholder
5. `getByTestId()` — último recurso, adicionar `data-testid` no componente

### 2. Use web-first assertions

Assertions do Playwright fazem auto-retry até o timeout. Nunca extraia valores manualmente.

```ts
// ✅ Web-first assertions (auto-retry, async)
await expect(page.getByRole('heading')).toHaveText('Dashboard')
await expect(page.getByRole('button')).toBeEnabled()
await expect(page).toHaveURL('/dashboard')
await expect(page.getByText('Carregando')).not.toBeVisible()

// ❌ Assertions manuais (sem retry, flaky)
const text = await page.textContent('h1')
expect(text).toBe('Dashboard')
```

### 3. Isole os testes

Cada teste deve ser independente. Não dependa de estado deixado por testes anteriores.

```ts
// ✅ Cada teste configura seu próprio estado
test('should display user profile', async ({ page }) => {
  // Setup: navegar e logar
  await page.goto('/auth/sign-in')
  await page.getByLabel('Email').fill('user@example.com')
  await page.getByLabel('Senha').fill('password123')
  await page.getByRole('button', { name: 'Entrar' }).click()

  // Test: verificar perfil
  await page.goto('/profile')
  await expect(page.getByText('user@example.com')).toBeVisible()
})
```

### 4. Use `test.describe` para agrupar

```ts
test.describe('User Profile', () => {
  test.describe('when authenticated', () => {
    test('should display user info', async ({ page }) => { /* ... */ })
    test('should allow editing name', async ({ page }) => { /* ... */ })
  })

  test.describe('when not authenticated', () => {
    test('should redirect to sign-in', async ({ page }) => { /* ... */ })
  })
})
```

### 5. Evite `waitForTimeout`

Nunca use waits fixos. Use locators e assertions que fazem auto-retry.

```ts
// ✅ Espera inteligente via assertion
await expect(page.getByRole('table')).toBeVisible()

// ✅ Espera por navegação
await page.waitForURL('/dashboard')

// ❌ Wait fixo (flaky, lento)
await page.waitForTimeout(3000)
```

### 6. Use `beforeEach` para setup repetitivo

```ts
test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada teste
    await page.goto('/auth/sign-in')
    await page.getByLabel('Email').fill('admin@example.com')
    await page.getByLabel('Senha').fill('password123')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL('/dashboard')
  })

  test('should display stats', async ({ page }) => {
    await expect(page.getByText('Total de Usuários')).toBeVisible()
  })

  test('should display recent activity', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Atividade Recente' })).toBeVisible()
  })
})
```

---

## Padrões Avançados

### Interceptar e mockar API

```ts
test('should display users from API', async ({ page }) => {
  // Interceptar chamada à API
  await page.route('**/api/users', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: '1', name: 'João', email: 'joao@example.com' },
      ]),
    }),
  )

  await page.goto('/users')
  await expect(page.getByText('João')).toBeVisible()
})
```

### Testar navegação e redirects

```ts
test('should redirect unauthenticated user to sign-in', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/auth\/sign-in/)
})
```

### Testar formulários com validação

```ts
test('should validate required fields', async ({ page }) => {
  await page.goto('/auth/sign-up')

  // Submit sem preencher
  await page.getByRole('button', { name: 'Criar Conta' }).click()

  // Verificar mensagens de erro
  await expect(page.getByText('Email é obrigatório')).toBeVisible()
  await expect(page.getByText('Senha é obrigatória')).toBeVisible()
})
```

### Testar responsividade

```ts
test('should show mobile menu on small screens', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('/')

  await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible()
  await expect(page.getByRole('navigation')).not.toBeVisible()

  await page.getByRole('button', { name: 'Menu' }).click()
  await expect(page.getByRole('navigation')).toBeVisible()
})
```

---

## Debugging

### UI Mode

O modo mais poderoso para debugging. Permite ver o teste rodando, inspecionar o DOM, e fazer time travel entre steps.

```bash
pnpm test:e2e:ui
```

### Headed Mode

Ver o navegador durante a execução:

```bash
npx playwright test --headed
```

### Debug Mode

Pausar em cada step e inspecionar:

```bash
npx playwright test --debug
```

### Trace Viewer

Após falha, o Playwright gera traces automaticamente (em CI com retries). Para abrir:

```bash
npx playwright show-report
```

### Adicionar pause no código

```ts
test('debug this', async ({ page }) => {
  await page.goto('/')
  await page.pause()  // Abre o Playwright Inspector
  // ...
})
```

---

## Configuração

A configuração está em `playwright.config.ts` na raiz do monorepo. Principais opções:

| Opção | Valor | Descrição |
|---|---|---|
| `fullyParallel` | `true` | Testes rodam em paralelo |
| `forbidOnly` | `!!process.env.CI` | Falha se `.only` estiver no CI |
| `retries` | `2` em CI, `0` local | Retentativas automáticas |
| `workers` | `1` em CI, auto local | Número de workers paralelos |
| `reporter` | `'html'` | Relatório HTML |

### Web Servers

O Playwright inicia automaticamente 3 servers antes dos testes:

1. **API** (`@repo/api`) — `http://localhost:4000`
2. **Portal** (`@repo/portal`) — `http://localhost:3000`
3. **Backoffice** (`@repo/backoffice`) — `http://localhost:3001`

Em desenvolvimento local, se os servers já estiverem rodando, o Playwright os reutiliza (`reuseExistingServer: true`).

---

## Referências

- [Playwright — Getting Started](https://playwright.dev/docs/intro)
- [Playwright — Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright — Locators](https://playwright.dev/docs/locators)
- [Playwright — Assertions](https://playwright.dev/docs/test-assertions)
- [Playwright — Web Server](https://playwright.dev/docs/test-webserver)
- [Playwright — Test Configuration](https://playwright.dev/docs/test-configuration)

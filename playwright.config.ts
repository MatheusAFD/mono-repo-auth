import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  webServer: [
    {
      command: 'pnpm --filter @repo/api dev',
      url: 'http://localhost:4000/api/auth/ok',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      name: 'API',
    },
    {
      command: 'pnpm --filter @repo/portal dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      name: 'Portal',
    },
    {
      command: 'pnpm --filter @repo/backoffice dev',
      url: 'http://localhost:3001',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      name: 'Backoffice',
    },
  ],

  projects: [
    {
      name: 'portal',
      testDir: './e2e/portal',
      use: {
        baseURL: 'http://localhost:3000',
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'backoffice',
      testDir: './e2e/backoffice',
      use: {
        baseURL: 'http://localhost:3001',
        ...devices['Desktop Chrome'],
      },
    },
  ],
})

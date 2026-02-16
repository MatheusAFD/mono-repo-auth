import { test, expect } from '@playwright/test'

test.describe('Portal — Auth Redirects', () => {
  test.describe('when not authenticated', () => {
    test('root page redirects to /auth/sign-in', async ({ page }) => {
      await page.goto('/')

      await expect(page).toHaveURL(/\/auth\/sign-in/)
    })

    test('dashboard redirects to /auth/sign-in', async ({ page }) => {
      await page.goto('/dashboard')

      await expect(page).toHaveURL(/\/auth\/sign-in/)
    })

    test('sign-in page renders login form', async ({ page }) => {
      await page.goto('/auth/sign-in')

      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByLabel('Password')).toBeVisible()
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    })
  })

  // TODO: Add authenticated tests once test strategy for API calls is defined
})

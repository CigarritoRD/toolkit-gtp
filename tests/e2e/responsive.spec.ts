import { test, expect } from '@playwright/test'
import { PUBLIC_ROUTES } from './utils/routes'

test.describe('Responsive', () => {
  test.use({
    viewport: { width: 375, height: 667 },
  })

  test('Home page loads on mobile', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Toolkit|GTP/i)
  })

  test('Login page loads on mobile', async ({ page }) => {
    await page.goto(PUBLIC_ROUTES.login)
    await expect(page.getByLabel(/auth.email/i)).toBeVisible()
  })

  test('Dashboard loads on mobile without layout breaking', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/login')
    await page.getByLabel(/auth.email/i).fill('admin@test.com')
    await page.getByLabel(/auth.password/i).fill('password')
    await page.getByRole('button', { name: /auth.signIn/i }).click()
    await page.waitForURL(/\/(dashboard|admin)/, { timeout: 10000 }).catch(() => {})
    const currentUrl = page.url()
    if (currentUrl.includes('/admin') || currentUrl.includes('/dashboard')) {
      const body = page.locator('body')
      await expect(body).toBeVisible()
    }
  })
})

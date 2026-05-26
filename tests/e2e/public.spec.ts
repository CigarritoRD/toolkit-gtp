import { test, expect } from '@playwright/test'
import { PUBLIC_ROUTES } from './utils/routes'

test.describe('Public Pages', () => {
  test('Home page loads without errors', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Toolkit|GTP/i)
    await expect(page.getByRole('heading')).toBeVisible()
  })

  test('Resources page loads', async ({ page }) => {
    await page.goto(PUBLIC_ROUTES.resources)
    await expect(page.getByRole('heading')).toBeVisible()
  })

  test('Contributors page loads', async ({ page }) => {
    await page.goto(PUBLIC_ROUTES.contributors)
    await expect(page.getByRole('heading')).toBeVisible()
  })

  test('Login page loads', async ({ page }) => {
    await page.goto(PUBLIC_ROUTES.login)
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible()
    await expect(page.getByLabel(/auth.email/i)).toBeVisible()
    await expect(page.getByLabel(/auth.password/i)).toBeVisible()
  })

  test('Register page loads', async ({ page }) => {
    await page.goto(PUBLIC_ROUTES.register)
    await expect(page.getByRole('heading', { name: /register/i })).toBeVisible()
    await expect(page.getByLabel(/auth.fullName/i)).toBeVisible()
    await expect(page.getByLabel(/auth.email/i)).toBeVisible()
  })

  test('Forgot password page loads', async ({ page }) => {
    await page.goto(PUBLIC_ROUTES.forgotPassword)
    await expect(page.getByRole('heading', { name: /forgot/i })).toBeVisible()
    await expect(page.getByLabel(/auth.email/i)).toBeVisible()
  })

  test('Auth confirm page loads', async ({ page }) => {
    await page.goto(PUBLIC_ROUTES.authConfirm)
    await expect(page.getByRole('heading')).toBeVisible()
  })
})

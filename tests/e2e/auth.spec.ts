import { test, expect } from '@playwright/test'
import { PUBLIC_ROUTES } from './utils/routes'

test.describe('Auth Flows', () => {
  test('Login with invalid credentials shows inline error', async ({ page }) => {
    await page.goto(PUBLIC_ROUTES.login)
    await page.getByLabel(/auth.email/i).fill('invalid@test.com')
    await page.getByLabel(/auth.password/i).fill('wrongpassword')
    await page.getByRole('button', { name: /auth.signIn/i }).click()
    await expect(page.getByText(/invalid|incorrect/i)).toBeVisible({ timeout: 5000 })
  })

  test('Register shows validation errors for empty fields', async ({ page }) => {
    await page.goto(PUBLIC_ROUTES.register)
    await page.getByRole('button', { name: /auth.signUp/i }).click()
    await expect(page.getByText(/auth.nameRequired|name.*required/i)).toBeVisible()
  })

  test('Register shows error for mismatched passwords', async ({ page }) => {
    await page.goto(PUBLIC_ROUTES.register)
    await page.getByLabel(/auth.fullName/i).fill('Test User')
    await page.getByLabel(/auth.email/i).fill('test@example.com')
    await page.getByLabel(/auth.password/i).fill('password123')
    await page.getByLabel(/auth.confirmPassword/i).fill('differentpass')
    await page.getByRole('button', { name: /auth.signUp/i }).click()
    await expect(page.getByText(/auth.passwordsDoNotMatch/i)).toBeVisible()
  })

  test('Register shows error for short password', async ({ page }) => {
    await page.goto(PUBLIC_ROUTES.register)
    await page.getByLabel(/auth.fullName/i).fill('Test User')
    await page.getByLabel(/auth.email/i).fill('test@example.com')
    await page.getByLabel(/auth.password/i).fill('short')
    await page.getByLabel(/auth.confirmPassword/i).fill('short')
    await page.getByRole('button', { name: /auth.signUp/i }).click()
    await expect(page.getByText(/auth.passwordMinLength/i)).toBeVisible()
  })

  test('Forgot password shows success screen for valid email', async ({ page }) => {
    await page.goto(PUBLIC_ROUTES.forgotPassword)
    await page.getByLabel(/auth.email/i).fill('valid@test.com')
    await page.getByRole('button', { name: /auth.forgotPassword.submit/i }).click()
    await expect(page.getByText(/auth.forgotPassword.successTitle/i)).toBeVisible({ timeout: 5000 })
  })

  test('Login page has link to register', async ({ page }) => {
    await page.goto(PUBLIC_ROUTES.login)
    const registerLink = page.getByRole('link', { name: /nav.register/i })
    await expect(registerLink).toBeVisible()
  })

  test('Register page has link to login', async ({ page }) => {
    await page.goto(PUBLIC_ROUTES.register)
    const loginLink = page.getByRole('link', { name: /nav.login/i })
    await expect(loginLink).toBeVisible()
  })

  test('Forgot password page has link to login', async ({ page }) => {
    await page.goto(PUBLIC_ROUTES.forgotPassword)
    const loginLink = page.getByRole('link', { name: /nav.login/i })
    await expect(loginLink).toBeVisible()
  })
})

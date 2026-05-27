import { test, expect } from '@playwright/test'
import { PUBLIC_ROUTES } from './utils/routes'

test.describe('Auth Flows', () => {
  test('Login with invalid credentials shows inline error', async ({ page }) => {
    await page.goto(PUBLIC_ROUTES.login)
    await page.getByLabel(/correo/i).fill('invalid@test.com')
    await page.getByLabel(/contraseña/i).fill('wrongpassword')
    await page.getByRole('button', { name: /iniciar sesión/i }).click()
    await expect(page.getByText(/invalid|incorrect/i)).toBeVisible({ timeout: 5000 })
  })

  test('Register shows validation errors for empty fields', async ({ page }) => {
    await page.goto(PUBLIC_ROUTES.register)
    await page.getByRole('button', { name: /crear cuenta/i }).click()
    await expect(page.getByText(/nombre.*requerido|ingresa.*nombre/i)).toBeVisible()
  })

  test('Register shows error for mismatched passwords', async ({ page }) => {
    await page.goto(PUBLIC_ROUTES.register)
    await page.getByLabel(/nombre/i).fill('Test User')
    await page.getByLabel(/correo/i).fill('test@example.com')
    await page.getByLabel(/contraseña/i).first().fill('password123')
    await page.getByLabel(/confirmar/i).fill('differentpass')
    await page.getByRole('button', { name: /crear cuenta/i }).click()
    await expect(page.getByText(/contraseñas.*coinciden|no.*coinciden/i)).toBeVisible()
  })

  test('Register shows error for short password', async ({ page }) => {
    await page.goto(PUBLIC_ROUTES.register)
    await page.getByLabel(/nombre/i).fill('Test User')
    await page.getByLabel(/correo/i).fill('test@example.com')
    await page.getByLabel(/contraseña/i).first().fill('short')
    await page.getByLabel(/confirmar/i).fill('short')
    await page.getByRole('button', { name: /crear cuenta/i }).click()
    await expect(page.getByText(/mínimo.*6|al menos.*6/i)).toBeVisible()
  })

  test('Forgot password shows success screen for valid email', async ({ page }) => {
    await page.goto(PUBLIC_ROUTES.forgotPassword)
    await page.getByLabel(/correo/i).fill('valid@test.com')
    await page.getByRole('button', { name: /enviar enlace/i }).click()
    await expect(page.getByText(/revisa.*correo|correo.*enviado/i)).toBeVisible({ timeout: 5000 })
  })

  test('Login page has link to register', async ({ page }) => {
    await page.goto(PUBLIC_ROUTES.login)
    const registerLink = page.getByRole('main').getByRole('link', { name: /crear cuenta/i })
    await expect(registerLink).toBeVisible()
  })

  test('Register page has link to login', async ({ page }) => {
    await page.goto(PUBLIC_ROUTES.register)
    const loginLink = page.getByRole('main').getByRole('link', { name: /iniciar sesión/i })
    await expect(loginLink).toBeVisible()
  })

  test('Forgot password page has link to login', async ({ page }) => {
    await page.goto(PUBLIC_ROUTES.forgotPassword)
    const loginLink = page.getByRole('link', { name: /iniciar sesión/i }).first()
    await expect(loginLink).toBeVisible()
  })
})

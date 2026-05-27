import { test, expect } from '@playwright/test'
import { PUBLIC_ROUTES } from './utils/routes'

test.describe('Public Pages', () => {
  test('Home page loads without errors', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Toolkit|GTP/i)
    await expect(page.getByRole('heading').first()).toBeVisible()
  })

  test('Resources page loads', async ({ page }) => {
    await page.goto(PUBLIC_ROUTES.resources)
    await expect(page.getByRole('heading', { name: /explorar recursos/i })).toBeVisible()
  })

  test('Contributors page loads', async ({ page }) => {
    await page.goto(PUBLIC_ROUTES.contributors)
    await expect(page.getByRole('heading', { name: /^colaboradores$/i })).toBeVisible()
  })

  test('Login page loads', async ({ page }) => {
    await page.goto(PUBLIC_ROUTES.login)
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible()
    await expect(page.getByLabel(/correo/i)).toBeVisible()
    await expect(page.getByLabel(/contraseña/i)).toBeVisible()
  })

  test('Register page loads', async ({ page }) => {
    await page.goto(PUBLIC_ROUTES.register)
    await expect(page.getByRole('heading', { name: /crear cuenta/i })).toBeVisible()
    await expect(page.getByLabel(/nombre/i)).toBeVisible()
    await expect(page.getByLabel(/correo/i)).toBeVisible()
  })

  test('Forgot password page loads', async ({ page }) => {
    await page.goto(PUBLIC_ROUTES.forgotPassword)
    await expect(page.getByRole('heading', { name: /recuperar contraseña/i })).toBeVisible()
    await expect(page.getByLabel(/correo/i)).toBeVisible()
  })

  test('Auth confirm page loads', async ({ page }) => {
    await page.goto(PUBLIC_ROUTES.authConfirm)
    await expect(page.getByRole('heading', { name: /cuenta confirmada/i })).toBeVisible()
  })
})

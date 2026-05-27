import { test, expect } from '@playwright/test'
import { login } from './utils/auth'
import { validateE2ECredentials } from './utils/env'
import { E2E_USER_EMAIL, E2E_USER_PASSWORD } from './utils/env'
import { USER_ROUTES, ADMIN_ROUTES, PUBLIC_ROUTES } from './utils/routes'

test.describe('User Role', () => {
  test.beforeAll(() => {
    validateE2ECredentials()
  })

  test('User can login and is redirected to dashboard', async ({ page }) => {
    await login(page, E2E_USER_EMAIL, E2E_USER_PASSWORD)
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('User can access dashboard', async ({ page }) => {
    await login(page, E2E_USER_EMAIL, E2E_USER_PASSWORD)
    await page.goto(USER_ROUTES.dashboard)
    await expect(page.getByRole('heading', { name: /tu panel/i }).first()).toBeVisible({ timeout: 10000 })
  })

  test('User can access dashboard resources', async ({ page }) => {
    await login(page, E2E_USER_EMAIL, E2E_USER_PASSWORD)
    await page.goto(USER_ROUTES.resources)
    await expect(page.getByRole('heading', { name: /explorar recursos/i }).first()).toBeVisible()
  })

  test('User can access dashboard library', async ({ page }) => {
    await login(page, E2E_USER_EMAIL, E2E_USER_PASSWORD)
    await page.goto(USER_ROUTES.library)
    await expect(page.getByRole('navigation')).toBeVisible()
  })

  test('User can access dashboard downloads', async ({ page }) => {
    await login(page, E2E_USER_EMAIL, E2E_USER_PASSWORD)
    await page.goto(USER_ROUTES.downloads)
    await expect(page.getByRole('heading', { name: /mis descargas/i }).first()).toBeVisible()
  })

  test('User can access dashboard profile', async ({ page }) => {
    await login(page, E2E_USER_EMAIL, E2E_USER_PASSWORD)
    await page.goto(USER_ROUTES.profile)
    await expect(page.getByRole('heading', { name: /tu cuenta/i }).first()).toBeVisible()
  })

  test('User cannot access admin routes, redirected to dashboard', async ({ page }) => {
    await login(page, E2E_USER_EMAIL, E2E_USER_PASSWORD)
    await page.goto(ADMIN_ROUTES.dashboard)
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('User can logout', async ({ page }) => {
    await login(page, E2E_USER_EMAIL, E2E_USER_PASSWORD)
    await page.goto(USER_ROUTES.dashboard)
    await page.getByRole('button', { name: /cerrar sesión/i }).first().click()
    await expect(page).toHaveURL(PUBLIC_ROUTES.login, { timeout: 15000 })
  })
})
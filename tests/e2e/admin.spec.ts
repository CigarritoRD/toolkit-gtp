import { test, expect } from '@playwright/test'
import { login } from './utils/auth'
import { validateE2ECredentials } from './utils/env'
import { E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD } from './utils/env'
import { ADMIN_ROUTES, PUBLIC_ROUTES } from './utils/routes'

test.describe('Admin Role', () => {
  test.beforeAll(() => {
    validateE2ECredentials()
  })

  test('Admin can login and is redirected to admin dashboard', async ({ page }) => {
    await login(page, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD)
    await expect(page).toHaveURL(/\/admin/)
  })

  test('Admin can access admin dashboard', async ({ page }) => {
    await login(page, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD)
    await page.goto(ADMIN_ROUTES.dashboard)
    await expect(page.getByRole('heading').first()).toBeVisible()
  })

  test('Admin can access account page', async ({ page }) => {
    await login(page, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD)
    await page.goto(ADMIN_ROUTES.account)
    await expect(page.getByRole('heading').first()).toBeVisible()
  })

  test('Admin can access resources list', async ({ page }) => {
    await login(page, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD)
    await page.goto(ADMIN_ROUTES.resources)
    await expect(page.getByRole('heading').first()).toBeVisible()
  })

  test('Admin can access new resource page', async ({ page }) => {
    await login(page, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD)
    await page.goto(ADMIN_ROUTES.newResource)
    await expect(page.getByRole('heading').first()).toBeVisible()
  })

  test('Admin can access contributors list', async ({ page }) => {
    await login(page, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD)
    await page.goto(ADMIN_ROUTES.contributors)
    await expect(page.getByRole('heading').first()).toBeVisible()
  })

  test('Admin can access new contributor page', async ({ page }) => {
    await login(page, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD)
    await page.goto(ADMIN_ROUTES.newContributor)
    await expect(page.getByRole('heading').first()).toBeVisible()
  })

  test('Admin can access categories list', async ({ page }) => {
    await login(page, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD)
    await page.goto(ADMIN_ROUTES.categories)
    await expect(page.getByRole('heading').first()).toBeVisible()
  })

  test('Admin can access new category page', async ({ page }) => {
    await login(page, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD)
    await page.goto(ADMIN_ROUTES.newCategory)
    await expect(page.getByRole('heading').first()).toBeVisible()
  })

  test('Admin can access tags list', async ({ page }) => {
    await login(page, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD)
    await page.goto(ADMIN_ROUTES.tags)
    await expect(page.getByRole('heading').first()).toBeVisible()
  })

  test('Admin can access new tag page', async ({ page }) => {
    await login(page, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD)
    await page.goto(ADMIN_ROUTES.newTag)
    await expect(page.getByRole('heading').first()).toBeVisible()
  })

  test('Admin can access contributor applications', async ({ page }) => {
    await login(page, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD)
    await page.goto(ADMIN_ROUTES.applications)
    await expect(page.getByRole('heading').first()).toBeVisible()
  })

  test('Admin can access metrics page', async ({ page }) => {
    await login(page, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD)
    await page.goto(ADMIN_ROUTES.metrics)
    await expect(page.getByRole('heading').first()).toBeVisible()
  })

  test('Admin can logout', async ({ page }) => {
    await login(page, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD)
    await page.goto(ADMIN_ROUTES.dashboard)
    const logoutButton = page.getByRole('button', { name: /cerrar sesión/i })
    try {
      await logoutButton.click({ timeout: 2000 })
    } catch {
      const menuOpenButton = page.getByRole('button', { name: /abrir menú/i })
      if (await menuOpenButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await menuOpenButton.click()
        await page.waitForTimeout(1000)
        await logoutButton.click()
      } else {
        throw new Error('Logout button not found in sidebar or menu')
      }
    }
    await expect(page).toHaveURL(PUBLIC_ROUTES.login, { timeout: 15000 })
  })
})
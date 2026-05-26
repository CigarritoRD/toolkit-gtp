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
    await expect(page.getByRole('heading')).toBeVisible()
  })

  test('Admin can access account page', async ({ page }) => {
    await login(page, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD)
    await page.goto(ADMIN_ROUTES.account)
    await expect(page.getByRole('heading').or(page.getByLabel(/profile|account/i))).toBeVisible()
  })

  test('Admin can access resources list', async ({ page }) => {
    await login(page, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD)
    await page.goto(ADMIN_ROUTES.resources)
    await expect(page.getByRole('heading').or(page.getByRole('table'))).toBeVisible()
  })

  test('Admin can access new resource page', async ({ page }) => {
    await login(page, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD)
    await page.goto(ADMIN_ROUTES.newResource)
    await expect(page.getByRole('heading').or(page.getByRole('button'))).toBeVisible()
  })

  test('Admin can access contributors list', async ({ page }) => {
    await login(page, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD)
    await page.goto(ADMIN_ROUTES.contributors)
    await expect(page.getByRole('heading').or(page.getByRole('table'))).toBeVisible()
  })

  test('Admin can access new contributor page', async ({ page }) => {
    await login(page, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD)
    await page.goto(ADMIN_ROUTES.newContributor)
    await expect(page.getByRole('heading').or(page.getByRole('button'))).toBeVisible()
  })

  test('Admin can access categories list', async ({ page }) => {
    await login(page, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD)
    await page.goto(ADMIN_ROUTES.categories)
    await expect(page.getByRole('heading').or(page.getByRole('table'))).toBeVisible()
  })

  test('Admin can access new category page', async ({ page }) => {
    await login(page, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD)
    await page.goto(ADMIN_ROUTES.newCategory)
    await expect(page.getByRole('heading').or(page.getByRole('button'))).toBeVisible()
  })

  test('Admin can access tags list', async ({ page }) => {
    await login(page, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD)
    await page.goto(ADMIN_ROUTES.tags)
    await expect(page.getByRole('heading').or(page.getByRole('table'))).toBeVisible()
  })

  test('Admin can access new tag page', async ({ page }) => {
    await login(page, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD)
    await page.goto(ADMIN_ROUTES.newTag)
    await expect(page.getByRole('heading').or(page.getByRole('button'))).toBeVisible()
  })

  test('Admin can access contributor applications', async ({ page }) => {
    await login(page, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD)
    await page.goto(ADMIN_ROUTES.applications)
    await expect(page.getByRole('heading').or(page.getByRole('table'))).toBeVisible()
  })

  test('Admin can access metrics page', async ({ page }) => {
    await login(page, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD)
    await page.goto(ADMIN_ROUTES.metrics)
    await expect(page.getByRole('heading').or(page.locator('svg'))).toBeVisible()
  })

  test('Admin can logout', async ({ page }) => {
    await login(page, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD)
    await page.goto(ADMIN_ROUTES.dashboard)
    try {
      const logoutButton = page.getByRole('button').filter({ hasText: /signOut|logout|cerrar/i }).first()
      if (await logoutButton.isVisible()) {
        await logoutButton.click()
      } else {
        const menuButton = page.locator('[aria-label="menu"]').first()
        await menuButton.click()
        const logoutInMenu = page.getByRole('menuitem').filter({ hasText: /signOut|logout|cerrar/i }).first()
        await logoutInMenu.click()
      }
    } catch {
      await page.evaluate(() => localStorage.clear())
    }
    await page.waitForURL(PUBLIC_ROUTES.login, { timeout: 5000 }).catch(() => {
      expect(page.url()).not.toContain('/admin')
    })
  })
})

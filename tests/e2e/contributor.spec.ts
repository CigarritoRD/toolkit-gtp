import { test, expect } from '@playwright/test'
import { login } from './utils/auth'
import { validateE2ECredentials } from './utils/env'
import { E2E_CONTRIBUTOR_EMAIL, E2E_CONTRIBUTOR_PASSWORD } from './utils/env'
import { CONTRIBUTOR_ROUTES, ADMIN_ROUTES, PUBLIC_ROUTES } from './utils/routes'

test.describe('Contributor Role', () => {
  test.beforeAll(() => {
    validateE2ECredentials()
  })

  test('Contributor can login and is redirected to dashboard', async ({ page }) => {
    await login(page, E2E_CONTRIBUTOR_EMAIL, E2E_CONTRIBUTOR_PASSWORD)
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('Contributor can access contributor home', async ({ page }) => {
    await login(page, E2E_CONTRIBUTOR_EMAIL, E2E_CONTRIBUTOR_PASSWORD)
    await page.goto(CONTRIBUTOR_ROUTES.contributorHome)
    await expect(page.getByRole('heading', { name: /mi panel/i })).toBeVisible()
  })

  test('Contributor can access contributor profile', async ({ page }) => {
    await login(page, E2E_CONTRIBUTOR_EMAIL, E2E_CONTRIBUTOR_PASSWORD)
    await page.goto(CONTRIBUTOR_ROUTES.contributorProfile)
    await expect(page.getByRole('heading', { name: /mi perfil público/i })).toBeVisible()
  })

  test('Contributor can access contributor resources', async ({ page }) => {
    await login(page, E2E_CONTRIBUTOR_EMAIL, E2E_CONTRIBUTOR_PASSWORD)
    await page.goto(CONTRIBUTOR_ROUTES.contributorResources)
    await expect(page.getByRole('heading', { name: /mis recursos/i })).toBeVisible()
  })

  test('Contributor can access new resource page', async ({ page }) => {
    await login(page, E2E_CONTRIBUTOR_EMAIL, E2E_CONTRIBUTOR_PASSWORD)
    await page.goto(CONTRIBUTOR_ROUTES.contributorNewResource)
    await expect(page.getByRole('heading', { name: /nuevo recurso/i })).toBeVisible()
  })

  test('Contributor can access regular user routes', async ({ page }) => {
    await login(page, E2E_CONTRIBUTOR_EMAIL, E2E_CONTRIBUTOR_PASSWORD)
    await page.goto(CONTRIBUTOR_ROUTES.library)
    await expect(page.getByRole('heading')).toBeVisible()
  })

  test('Contributor cannot access admin routes, redirected to dashboard', async ({ page }) => {
    await login(page, E2E_CONTRIBUTOR_EMAIL, E2E_CONTRIBUTOR_PASSWORD)
    await page.goto(ADMIN_ROUTES.dashboard)
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('Contributor can logout', async ({ page }) => {
    await login(page, E2E_CONTRIBUTOR_EMAIL, E2E_CONTRIBUTOR_PASSWORD)
    await page.goto(CONTRIBUTOR_ROUTES.contributorHome)
    await page.getByRole('button', { name: /cerrar sesión/i }).first().click()
    await expect(page).toHaveURL(PUBLIC_ROUTES.login, { timeout: 15000 })
  })
})
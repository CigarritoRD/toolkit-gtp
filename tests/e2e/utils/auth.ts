import { type Page } from '@playwright/test'

export async function login(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto('/login')
  await page.getByLabel(/auth.email/i).fill(email)
  await page.getByLabel(/auth.password/i).fill(password)
  await page.getByRole('button', { name: /auth.signIn/i }).click()
  await page.waitForURL(/\/(dashboard|admin)/, { timeout: 10000 })
}

export async function logout(page: Page): Promise<void> {
  try {
    await page.goto('/dashboard')
    const logoutButton = page.getByRole('button', { name: /signOut|logout|cerrarSesión/i })
    if (await logoutButton.isVisible()) {
      await logoutButton.click()
    } else {
      const sidebar = page.locator('nav').first()
      const menuButton = sidebar.getByRole('button').first()
      await menuButton.click()
      const logoutInMenu = page.getByRole('menuitem').filter({ hasText: /signOut|logout|cerrar/i }).first()
      await logoutInMenu.click()
    }
  } catch {
    await page.evaluate(() => localStorage.clear())
  }
  await page.waitForURL('/login**', { timeout: 5000 }).catch(() => {})
}

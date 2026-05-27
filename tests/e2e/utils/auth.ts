import { type Page } from '@playwright/test'

export async function login(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto('/login')
  await page.getByLabel(/correo/i).fill(email)
  await page.getByLabel(/contraseña/i).fill(password)
  await page.getByRole('button', { name: /iniciar sesión/i }).click()

  const errorVisible = await page.getByText(/credenciales.*inv|lid|error/i).isVisible({ timeout: 3000 }).catch(() => false)
  if (errorVisible) {
    throw new Error('Login failed: invalid credentials displayed on page')
  }

  await page.waitForURL(/\/(dashboard|admin)/, { timeout: 10000 })
}

export async function logout(page: Page): Promise<void> {
  try {
    await page.goto('/dashboard', { timeout: 5000 }).catch(() => {})
    const logoutButton = page.getByRole('button', { name: /signOut|logout|cerrarSesión/i })
    if (await logoutButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await logoutButton.click()
    } else {
      const sidebar = page.locator('nav').first()
      const menuButton = sidebar.getByRole('button').first()
      await menuButton.click({ timeout: 3000 }).catch(() => {})
      const logoutInMenu = page.getByRole('menuitem').filter({ hasText: /signOut|logout|cerrar/i }).first()
      await logoutInMenu.click({ timeout: 3000 }).catch(() => {})
    }
    await page.waitForURL('/login**', { timeout: 5000 }).catch(() => {})
  } catch {
    // Browser context may be closed during parallel worker shutdown
  }
}
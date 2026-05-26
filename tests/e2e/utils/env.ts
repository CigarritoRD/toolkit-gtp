import 'dotenv/config'

export const E2E_USER_EMAIL = process.env.E2E_USER_EMAIL ?? ''
export const E2E_USER_PASSWORD = process.env.E2E_USER_PASSWORD ?? ''

export const E2E_CONTRIBUTOR_EMAIL = process.env.E2E_CONTRIBUTOR_EMAIL ?? ''
export const E2E_CONTRIBUTOR_PASSWORD = process.env.E2E_CONTRIBUTOR_PASSWORD ?? ''

export const E2E_ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? ''
export const E2E_ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? ''

export function validateE2ECredentials() {
  const missing: string[] = []

  if (!E2E_USER_EMAIL || !E2E_USER_PASSWORD) {
    missing.push('E2E_USER_EMAIL / E2E_USER_PASSWORD')
  }
  if (!E2E_CONTRIBUTOR_EMAIL || !E2E_CONTRIBUTOR_PASSWORD) {
    missing.push('E2E_CONTRIBUTOR_EMAIL / E2E_CONTRIBUTOR_PASSWORD')
  }
  if (!E2E_ADMIN_EMAIL || !E2E_ADMIN_PASSWORD) {
    missing.push('E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD')
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing E2E credentials in .env.local: ${missing.join(', ')}\n` +
      'Please fill in your test account credentials in .env.local',
    )
  }
}

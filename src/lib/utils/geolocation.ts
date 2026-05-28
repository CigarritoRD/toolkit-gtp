const COUNTRY_CACHE_KEY = 'toolkit_country'
const COUNTRY_CACHE_TTL_MS = 30 * 60 * 1000
const GEO_API_URL = 'https://ipapi.co/json/'
const GEO_API_TIMEOUT_MS = 5000

export const UNKNOWN_COUNTRY = 'Unknown'

type CachedCountry = {
  value: string
  timestamp: number
}

export async function getUserCountry(): Promise<string | null> {
  const cached = getCachedCountry()
  if (cached) return cached.value

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), GEO_API_TIMEOUT_MS)

    const res = await fetch(GEO_API_URL, { signal: controller.signal })
    clearTimeout(timeoutId)

    if (!res.ok) return null

    const data = await res.json()
    const country = typeof data?.country === 'string' && data.country.trim()
      ? data.country.trim().toUpperCase()
      : null

    if (country) {
      sessionStorage.setItem(
        COUNTRY_CACHE_KEY,
        JSON.stringify({ value: country, timestamp: Date.now() } satisfies CachedCountry),
      )
    }

    return country
  } catch {
    return null
  }
}

function getCachedCountry(): { value: string } | null {
  try {
    const raw = sessionStorage.getItem(COUNTRY_CACHE_KEY)
    if (!raw) return null

    const cached: CachedCountry = JSON.parse(raw)
    if (Date.now() - cached.timestamp > COUNTRY_CACHE_TTL_MS) {
      sessionStorage.removeItem(COUNTRY_CACHE_KEY)
      return null
    }

    return { value: cached.value }
  } catch {
    return null
  }
}
export async function getUserCountry(): Promise<string | null> {
  try {
    const res = await fetch('https://ipapi.co/json/')
    const data = await res.json()

    return data?.country || null // "DO", "US", etc.
  } catch (error) {
    console.error('Geolocation error:', error)
    return null
  }
}
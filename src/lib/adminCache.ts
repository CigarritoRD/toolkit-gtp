type CacheEntry<T> = {
  data: T
  timestamp: number
  ttl: number
}

const cache = new Map<string, CacheEntry<unknown>>()

const DEFAULT_TTL = 60_000

export function getCachedAdminData<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined
  if (!entry) return null

  const now = Date.now()
  if (now - entry.timestamp > entry.ttl) {
    cache.delete(key)
    return null
  }

  return entry.data
}

export function setCachedAdminData<T>(
  key: string,
  data: T,
  ttlMs = DEFAULT_TTL,
): void {
  cache.set(key, { data, timestamp: Date.now(), ttl: ttlMs })
}

export function invalidateAdminCache(key: string): void {
  cache.delete(key)
}

export function invalidateAdminCachePrefix(prefix: string): void {
  for (const k of cache.keys()) {
    if (k.startsWith(prefix)) {
      cache.delete(k)
    }
  }
}

export function clearAdminCache(): void {
  cache.clear()
}

export function adminCacheKeys(): string[] {
  return [...cache.keys()]
}
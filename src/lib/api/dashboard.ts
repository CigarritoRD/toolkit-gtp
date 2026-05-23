import { supabase } from '@/lib/supabaseClient'
import type { ResourceListItem } from '@/types/resources'
import { normalizeResource } from '@/utils/resources'

export async function getRecentLibraryResources(
  userId: string,
  limit = 4,
): Promise<ResourceListItem[]> {
  const { data, error } = await supabase
    .from('user_library')
    .select(`
      created_at,
      resource:resources (
        id,
        title,
        slug,
        description,
        short_description,
        thumbnail_url,
        resource_type,
        contributor:contributors (
          id,
          name,
          slug
        )
      )
    `)
    .eq('user_id', userId)
    .in('kind', ['saved', 'favorite'])
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((item: any) => item.resource?.[0])
    .filter(Boolean)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((resource: any) => normalizeResource(resource as Parameters<typeof normalizeResource>[0]))
}
export type DashboardLibraryItem = {
  library_id: string
  kind: 'saved' | 'favorite' | 'assigned' | 'unlocked' | 'downloaded'
  created_at: string
  resource: {
    id: string
    title: string
    slug: string
    short_description: string | null
    description: string | null
    thumbnail_url: string | null
    resource_type: string
    file_url: string | null
    external_url: string | null
    contributor: {
      id: string
      name: string
      slug: string
    } | null
  } | null
}

type RawDashboardLibraryItem = {
  id: string
  kind: DashboardLibraryItem['kind']
  created_at: string
  resource: {
    id: string
    title: string
    slug: string
    short_description: string | null
    description: string | null
    thumbnail_url: string | null
    resource_type: string
    file_url: string | null
    external_url: string | null
    contributor:
      | {
          id: string
          name: string
          slug: string
        }[]
      | {
          id: string
          name: string
          slug: string
        }
      | null
  } | null
}

export type DashboardStats = {
  savedCount: number
  favoriteCount: number
  downloadCount: number
}

export type RecentDownloadItem = {
  id: string
  created_at: string
  resource: {
    id: string
    title: string
    slug: string
    thumbnail_url: string | null
    resource_type: string
    file_url: string | null
    external_url: string | null
    contributor: {
      id: string
      name: string
      slug: string
    } | null
  } | null
}

export type DashboardResourceItem = {
  category: {
    id: string
    name: string
    slug: string
  } | null
  id: string
  title: string
  slug: string
  description: string | null
  short_description: string | null
  thumbnail_url: string | null
  resource_type: string
  file_url: string | null
  external_url: string | null
  contributor: {
    id: string
    name: string
    slug: string
  } | null
}

type RawRecentDownloadItem = {
  id: string
  created_at: string
  resource: {
    id: string
    title: string
    slug: string
    thumbnail_url: string | null
    resource_type: string
    file_url: string | null
    external_url: string | null
    contributor:
      | {
          id: string
          name: string
          slug: string
        }[]
      | {
          id: string
          name: string
          slug: string
        }
      | null
  } | null
}

function normalizeContributor(
  contributor:
    | {
        id: string
        name: string
        slug: string
      }[]
    | {
        id: string
        name: string
        slug: string
      }
    | null,
) {
  if (!contributor) return null
  if (Array.isArray(contributor)) return contributor[0] ?? null
  return contributor
}

function normalizeLibraryItem(item: RawDashboardLibraryItem): DashboardLibraryItem {
  return {
    library_id: item.id,
    kind: item.kind,
    created_at: item.created_at,
    resource: item.resource
      ? {
          ...item.resource,
          contributor: normalizeContributor(item.resource.contributor),
        }
      : null,
  }
}

function normalizeRecentDownload(item: RawRecentDownloadItem): RecentDownloadItem {
  return {
    id: item.id,
    created_at: item.created_at,
    resource: item.resource
      ? {
          ...item.resource,
          contributor: normalizeContributor(item.resource.contributor),
        }
      : null,
  }
}

export async function getMyLibrary(userId: string) {
  const { data, error } = await supabase
    .from('user_library')
    .select(`
      id,
      kind,
      created_at,
      resource:resources (
        id,
        title,
        slug,
        short_description,
        description,
        thumbnail_url,
        resource_type,
        file_url,
        external_url,
        contributor:contributors (
          id,
          name,
          slug
        )
      )
    `)
    .eq('user_id', userId)
    .in('kind', ['saved', 'favorite'])
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return ((data ?? []) as unknown as RawDashboardLibraryItem[])
    .map(normalizeLibraryItem)
    .filter((item) => item.resource !== null)
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const [
    { count: savedCount, error: savedError },
    { count: favoriteCount, error: favoriteError },
    { count: downloadCount, error: downloadError },
  ] = await Promise.all([
    supabase
      .from('user_library')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('kind', 'saved'),

    supabase
      .from('user_library')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('kind', 'favorite'),

    supabase
      .from('resource_downloads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId),
  ])

  if (savedError) throw new Error(savedError.message)
  if (favoriteError) throw new Error(favoriteError.message)
  if (downloadError) throw new Error(downloadError.message)

  return {
    savedCount: savedCount ?? 0,
    favoriteCount: favoriteCount ?? 0,
    downloadCount: downloadCount ?? 0,
  }
}

export async function getRecentDownloads(userId: string, limit = 5) {
  const { data, error } = await supabase
    .from('resource_downloads')
    .select(`
      id,
      created_at,
      resource:resources (
        id,
        title,
        slug,
        thumbnail_url,
        resource_type,
        file_url,
        external_url,
        contributor:contributors (
          id,
          name,
          slug
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(error.message)
  }

  return ((data ?? []) as unknown as RawRecentDownloadItem[])
    .map(normalizeRecentDownload)
    .filter((item) => item.resource !== null)
}

export async function getUserDownloads(
  userId: string,
): Promise<DashboardResourceItem[]> {
  const { data, error } = await supabase
    .from('resource_downloads')
    .select(`
      created_at,
      resource:resources (
        id,
        title,
        slug,
        description,
        short_description,
        thumbnail_url,
        resource_type,
        file_url,
        external_url,
        contributor:contributors (
          id,
          name,
          slug
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  const seen = new Set<string>()

  return (data ?? [])
    .map((item: { resource: unknown }) => normalizeResource(item.resource as ResourceListItem))
    .filter((resource): resource is ResourceListItem => {
      if (!resource) return false
      if (seen.has(resource.id)) return false
      seen.add(resource.id)
      return true
    })
    .map((resource) => ({
      category: resource.category,
      id: resource.id,
      title: resource.title,
      slug: resource.slug,
      description: resource.description,
      short_description: resource.short_description,
      thumbnail_url: resource.thumbnail_url,
      resource_type: resource.resource_type,
      file_url: resource.file_url as string | null,
      external_url: resource.external_url as string | null,
      contributor: resource.contributor ?? null,
    }))
}
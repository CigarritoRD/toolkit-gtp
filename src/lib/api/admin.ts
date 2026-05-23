import { supabase } from '@/lib/supabaseClient'

export type AdminDashboardStats = {
  totalContributors: number
  activeContributors: number
  totalResources: number
  publishedResources: number
  totalDownloads: number
}

export type AdminRecentContributor = {
  id: string
  name: string
  slug: string
  avatar_url?: string | null
  specialty?: string | null
  is_active: boolean
  created_at: string
}

export type AdminRecentResource = {
  id: string
  title: string
  slug: string
  thumbnail_url?: string | null
  resource_type?: string | null
  is_published: boolean
  is_featured: boolean
  created_at: string
  contributor?: {
    id: string
    name: string
    slug: string
  } | null
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const [
    contributorsRes,
    activeContributorsRes,
    resourcesRes,
    publishedResourcesRes,
    downloadsRes,
  ] = await Promise.all([
    supabase
      .from('contributors')
      .select('*', { count: 'exact', head: true }),

    supabase
      .from('contributors')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),

    supabase
      .from('resources')
      .select('*', { count: 'exact', head: true }),

    supabase
      .from('resources')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true),

    supabase
      .from('resource_downloads')
      .select('*', { count: 'exact', head: true }),
  ])

  const errors = [
    contributorsRes.error,
    activeContributorsRes.error,
    resourcesRes.error,
    publishedResourcesRes.error,
    downloadsRes.error,
  ].filter(Boolean)

  if (errors.length > 0) {
    throw new Error(errors[0]?.message ?? 'Failed to load dashboard stats.')
  }

  return {
    totalContributors: contributorsRes.count ?? 0,
    activeContributors: activeContributorsRes.count ?? 0,
    totalResources: resourcesRes.count ?? 0,
    publishedResources: publishedResourcesRes.count ?? 0,
    totalDownloads: downloadsRes.count ?? 0,
  }
}

export async function getRecentContributors(limit = 5) {
  const { data, error } = await supabase
    .from('contributors')
    .select(`
      id,
      name,
      slug,
      avatar_url,
      specialty,
      is_active,
      created_at
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return (data ?? []) as AdminRecentContributor[]
}

export async function getRecentResources(limit = 5) {
  const { data, error } = await supabase
    .from('resources')
    .select(`
      id,
      title,
      slug,
      thumbnail_url,
      resource_type,
      is_published,
      is_featured,
      created_at,
      contributor:contributors (
        id,
        name,
        slug
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as AdminRecentResource[]
}

export type MetricPeriod = '7d' | '30d' | '90d' | 'all'

export type ResourceMetricItem = {
  id: string
  title: string
  slug: string
  thumbnail_url: string | null
  total_views: number
  total_downloads: number
  unique_users: number
  conversion_rate: number
  last_view_at: string | null
  last_download_at: string | null
}

export type ResourceMetricEvent = {
  id: string
  event_type: string
  created_at: string
  user_id: string
  user_email: string | null
  user_full_name: string | null
}

export type ResourceMetricSummary = {
  total_views: number
  total_downloads: number
  unique_users: number
  active_resources: number
  conversion_rate: number
}

export type MetricSortKey = 'views' | 'downloads' | 'conversion' | 'last_activity'
export type MetricSortDir = 'asc' | 'desc'

function getPeriodStart(period: MetricPeriod): string | null {
  if (period === 'all') return null
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

export type MetricSort = { key: MetricSortKey; dir: MetricSortDir }

export async function getResourceMetricSummary(
  period: MetricPeriod = '30d',
): Promise<ResourceMetricSummary> {
  const startDate = getPeriodStart(period)

  const [viewsRes, downloadsRes] = await Promise.all([
    supabase
      .from('resource_events')
      .select('resource_id, user_id', { count: 'exact' })
      .eq('event_type', 'open')
      .gte('created_at', startDate ?? '1970-01-01'),

    supabase
      .from('resource_downloads')
      .select('resource_id, user_id', { count: 'exact' })
      .gte('created_at', startDate ?? '1970-01-01'),
  ])

  const totalViews = viewsRes.count ?? 0
  const totalDownloads = downloadsRes.count ?? 0

  const uniqueUserIds = new Set<string>()
  for (const row of viewsRes.data ?? []) {
    if (row.user_id) uniqueUserIds.add(row.user_id)
  }
  for (const row of downloadsRes.data ?? []) {
    if (row.user_id) uniqueUserIds.add(row.user_id)
  }

  const activeResources = new Set<string>()
  for (const row of viewsRes.data ?? []) activeResources.add(row.resource_id)
  for (const row of downloadsRes.data ?? []) activeResources.add(row.resource_id)

  return {
    total_views: totalViews,
    total_downloads: totalDownloads,
    unique_users: uniqueUserIds.size,
    active_resources: activeResources.size,
    conversion_rate: totalViews > 0 ? Math.round((totalDownloads / totalViews) * 100) : 0,
  }
}

function sortMetrics(
  items: ResourceMetricItem[],
  sort: MetricSort,
  searchQuery: string,
): ResourceMetricItem[] {
  let filtered = items
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase()
    filtered = items.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.slug.toLowerCase().includes(q),
    )
  }

  const dir = sort.dir === 'asc' ? 1 : -1
  return [...filtered].sort((a, b) => {
    if (sort.key === 'views') return dir * (a.total_views - b.total_views)
    if (sort.key === 'downloads') return dir * (a.total_downloads - b.total_downloads)
    if (sort.key === 'conversion') return dir * (a.conversion_rate - b.conversion_rate)
    const aLast = a.last_view_at ?? a.last_download_at ?? ''
    const bLast = b.last_view_at ?? b.last_download_at ?? ''
    return dir * aLast.localeCompare(bLast)
  })
}

export async function getResourceMetrics(
  period: MetricPeriod = '30d',
  sort: MetricSort = { key: 'views', dir: 'desc' },
  searchQuery = '',
): Promise<ResourceMetricItem[]> {
  const startDate = getPeriodStart(period)

  const viewsQuery = supabase
    .from('resource_events')
    .select('resource_id, event_type, created_at, user_id')
    .eq('event_type', 'open')
    .gte('created_at', startDate ?? '1970-01-01')

  const downloadsQuery = supabase
    .from('resource_downloads')
    .select('resource_id, created_at, user_id')
    .gte('created_at', startDate ?? '1970-01-01')

  const [{ data: viewsData }, { data: downloadsData }] = await Promise.all([
    viewsQuery,
    downloadsQuery,
  ])

  const resourceIds = new Set<string>()
  for (const row of viewsData ?? []) resourceIds.add(row.resource_id)
  for (const row of downloadsData ?? []) resourceIds.add(row.resource_id)

  if (resourceIds.size === 0) return []

  const { data: resourcesData, error: resourcesError } = await supabase
    .from('resources')
    .select('id, title, slug, thumbnail_url')
    .in('id', [...resourceIds])

  if (resourcesError) throw new Error(resourcesError.message)

  const viewByResource = new Map<string, { count: number; last_at: string | null; users: Set<string> }>()
  for (const row of viewsData ?? []) {
    const existing = viewByResource.get(row.resource_id) ?? { count: 0, last_at: null, users: new Set() }
    const newUsers = new Set(existing.users)
    if (row.user_id) newUsers.add(row.user_id)
    viewByResource.set(row.resource_id, {
      count: existing.count + 1,
      last_at: !existing.last_at || row.created_at > existing.last_at ? row.created_at : existing.last_at,
      users: newUsers,
    })
  }

  const downloadByResource = new Map<string, { count: number; last_at: string | null }>()
  for (const row of downloadsData ?? []) {
    const existing = downloadByResource.get(row.resource_id) ?? { count: 0, last_at: null }
    downloadByResource.set(row.resource_id, {
      count: existing.count + 1,
      last_at: !existing.last_at || row.created_at > existing.last_at ? row.created_at : existing.last_at,
    })
  }

  const items: ResourceMetricItem[] = (resourcesData ?? []).map((r) => {
    const v = viewByResource.get(r.id) ?? { count: 0, last_at: null, users: new Set() }
    const d = downloadByResource.get(r.id) ?? { count: 0, last_at: null }
    return {
      id: r.id,
      title: r.title,
      slug: r.slug,
      thumbnail_url: r.thumbnail_url,
      total_views: v.count,
      total_downloads: d.count,
      unique_users: v.users.size,
      conversion_rate: v.count > 0 ? Math.round((d.count / v.count) * 100) : 0,
      last_view_at: v.last_at,
      last_download_at: d.last_at,
    }
  })

  return sortMetrics(items, sort, searchQuery)
}

export async function getResourceMetricEvents(
  resourceId: string,
  period: MetricPeriod = '30d',
): Promise<ResourceMetricEvent[]> {
  const startDate = getPeriodStart(period)

  const [viewsRes, downloadsRes] = await Promise.all([
    supabase
      .from('resource_events')
      .select('id, event_type, created_at, user_id')
      .eq('resource_id', resourceId)
      .eq('event_type', 'open')
      .gte('created_at', startDate ?? '1970-01-01')
      .order('created_at', { ascending: false })
      .limit(100),

    supabase
      .from('resource_downloads')
      .select('id, action_type, created_at, user_id')
      .eq('resource_id', resourceId)
      .gte('created_at', startDate ?? '1970-01-01')
      .order('created_at', { ascending: false })
      .limit(100),
  ])

  if (viewsRes.error) throw new Error(viewsRes.error.message)
  if (downloadsRes.error) throw new Error(downloadsRes.error.message)

  interface RawEvent {
    id: string
    event_type: string
    action_type?: string
    created_at: string
    user_id: string
  }

  const allEvents: RawEvent[] = [
    ...(viewsRes.data ?? []).map((e) => ({ ...e, event_type: 'open' as const })),
    ...(downloadsRes.data ?? []).map((e) => ({ ...e, event_type: e.action_type ?? 'download' as const })),
  ]

  allEvents.sort((a, b) => b.created_at.localeCompare(a.created_at))

  const userIds = [...new Set(allEvents.map((e) => e.user_id).filter(Boolean))]
  if (userIds.length === 0) return []

  const { data: profilesData } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', userIds)

  const profileById = new Map(
    (profilesData ?? []).map((p) => [p.id, p]),
  )

  return allEvents.map((e) => {
    const profile = profileById.get(e.user_id)
    return {
      id: e.id,
      event_type: e.event_type,
      created_at: e.created_at,
      user_id: e.user_id,
      user_email: profile?.email ?? null,
      user_full_name: profile?.full_name ?? null,
    }
  })
}
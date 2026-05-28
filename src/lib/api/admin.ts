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
  country: string | null
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

export type MetricSort = { key: MetricSortKey; dir: MetricSortDir }

export type MetricExportData = {
  summary: ResourceMetricSummary
  resources: ResourceMetricItem[]
  countries: Array<{ country: string; total: number; unique_users: number }>
  generated_at: string
  period: string
}

export async function getResourceMetricSummary(
  period: MetricPeriod = '30d',
): Promise<ResourceMetricSummary> {
  const { data, error } = await supabase.rpc('get_admin_metric_summary', {
    p_period: period,
  })

  if (error) throw new Error(error.message)
  return data as ResourceMetricSummary
}

export async function getResourceMetrics(
  period: MetricPeriod = '30d',
  sort: MetricSort = { key: 'views', dir: 'desc' },
  searchQuery = '',
): Promise<ResourceMetricItem[]> {
  const { data, error } = await supabase.rpc('get_admin_resource_metrics', {
    p_period: period,
    p_sort_key: sort.key,
    p_sort_dir: sort.dir,
    p_search: searchQuery,
  })

  if (error) throw new Error(error.message)
  const items = (data ?? []) as ResourceMetricItem[]

  return items.map((item) => ({
    ...item,
    total_views: Number(item.total_views),
    total_downloads: Number(item.total_downloads),
    unique_users: Number(item.unique_users),
    conversion_rate: Number(item.conversion_rate),
    thumbnail_url: item.thumbnail_url ?? null,
  }))
}

export async function getResourceMetricEvents(
  resourceId: string,
  period: MetricPeriod = '30d',
): Promise<ResourceMetricEvent[]> {
  const { data, error } = await supabase.rpc('get_admin_resource_metric_events', {
    p_resource_id: resourceId,
    p_period: period,
  })

  if (error) throw new Error(error.message)
  return (data ?? []) as ResourceMetricEvent[]
}

export async function getMetricExportData(
  period: MetricPeriod = '30d',
): Promise<MetricExportData> {
  const { data, error } = await supabase.rpc('get_admin_metric_export', {
    p_period: period,
  })

  if (error) throw new Error(error.message)
  return data as MetricExportData
}
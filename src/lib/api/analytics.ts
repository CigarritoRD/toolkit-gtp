import { supabase } from '@/lib/supabaseClient'

export type ResourceEventType = 'open' | 'download'

export type ContributorEventType =
  | 'profile_view'
  | 'website_click'
  | 'instagram_click'
  | 'facebook_click'
  | 'linkedin_click'
  | 'youtube_click'

export type TopResourceMetric = {
  id: string
  title: string
  slug: string
  total_opens: number
}

export type TopContributorMetric = {
  id: string
  name: string
  slug: string
  total_views: number
}

export type CountryMetric = {
  country: string
  total: number
}

export type ResourceRatingMetric = {
  id: string
  title: string
  slug: string
  average_rating: number
  total_ratings: number
}

export type ContributorRatingMetric = {
  id: string
  name: string
  slug: string
  average_rating: number
  total_ratings: number
}

export type AdminOverviewMetric = {
  total_resources: number
  published_resources: number
  total_contributors: number
  active_contributors: number
  total_downloads: number
  total_opens: number
  pending_applications: number
  total_resource_ratings: number
  total_contributor_ratings: number
}

async function getUserCountry(): Promise<string> {
  try {
    const cached = sessionStorage.getItem('toolkit_country')

    if (cached) {
      return cached
    }

    const response = await fetch('https://ipapi.co/json/')

    if (!response.ok) {
      return 'Unknown'
    }

    const data = await response.json()
    const country =
      typeof data?.country === 'string' && data.country.trim()
        ? data.country.trim().toUpperCase()
        : 'Unknown'

    sessionStorage.setItem('toolkit_country', country)

    return country
  } catch (error) {
    console.error('getUserCountry error:', error)
    return 'Unknown'
  }
}

export async function trackResourceEvent(
  resourceId: string,
  eventType: ResourceEventType,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const country = await getUserCountry()

  const { error } = await supabase.from('resource_events').insert({
    resource_id: resourceId,
    event_type: eventType,
    country,
    user_id: user.id,
  })

  if (error) {
    console.error('trackResourceEvent error:', error.message)
  }
}

export async function trackContributorEvent(
  contributorId: string,
  eventType: ContributorEventType,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const country = await getUserCountry()

  const { error } = await supabase.from('contributor_events').insert({
    contributor_id: contributorId,
    event_type: eventType,
    country,
    user_id: user.id,
  })

  if (error) {
    console.error('trackContributorEvent error:', error.message)
  }
}

export async function getTopResources(
  limit = 5,
): Promise<TopResourceMetric[]> {
  const { data, error } = await supabase
    .from('analytics_top_resources')
    .select('id, title, slug, total_opens')
    .order('total_opens', { ascending: false })
    .limit(limit)

  if (error) throw error

  return (data ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    total_opens: Number(item.total_opens ?? 0),
  }))
}

export async function getTopContributorsByViews(
  limit = 5,
): Promise<TopContributorMetric[]> {
  const { data, error } = await supabase
    .from('analytics_top_contributors')
    .select('id, name, slug, total_views')
    .order('total_views', { ascending: false })
    .limit(limit)

  if (error) throw error

  return (data ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    total_views: Number(item.total_views ?? 0),
  }))
}

export async function getResourceEventsByCountry(
  limit = 10,
): Promise<CountryMetric[]> {
  const { data, error } = await supabase
    .from('analytics_resource_countries')
    .select('country, total')
    .order('total', { ascending: false })
    .limit(limit)

  if (error) throw error

  return (data ?? []).map((item) => ({
    country: item.country,
    total: Number(item.total ?? 0),
  }))
}

export async function getTopRatedResources(
  limit = 5,
): Promise<ResourceRatingMetric[]> {
  const { data, error } = await supabase
    .from('analytics_resource_ratings')
    .select('id, title, slug, average_rating, total_ratings')
    .order('total_ratings', { ascending: false })
    .order('average_rating', { ascending: false })
    .limit(limit)

  if (error) throw error

  return (data ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    average_rating: Number(item.average_rating ?? 0),
    total_ratings: Number(item.total_ratings ?? 0),
  }))
}

export async function getTopRatedContributors(
  limit = 5,
): Promise<ContributorRatingMetric[]> {
  const { data, error } = await supabase
    .from('analytics_contributor_ratings')
    .select('id, name, slug, average_rating, total_ratings')
    .order('total_ratings', { ascending: false })
    .order('average_rating', { ascending: false })
    .limit(limit)

  if (error) throw error

  return (data ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    average_rating: Number(item.average_rating ?? 0),
    total_ratings: Number(item.total_ratings ?? 0),
  }))
}

export async function getAdminOverview(): Promise<AdminOverviewMetric> {
  const { data, error } = await supabase
    .from('analytics_admin_overview')
    .select(
      `
      total_resources,
      published_resources,
      total_contributors,
      active_contributors,
      total_downloads,
      total_opens,
      pending_applications,
      total_resource_ratings,
      total_contributor_ratings
    `,
    )
    .single()

  if (error) throw error

  return {
    total_resources: Number(data?.total_resources ?? 0),
    published_resources: Number(data?.published_resources ?? 0),
    total_contributors: Number(data?.total_contributors ?? 0),
    active_contributors: Number(data?.active_contributors ?? 0),
    total_downloads: Number(data?.total_downloads ?? 0),
    total_opens: Number(data?.total_opens ?? 0),
    pending_applications: Number(data?.pending_applications ?? 0),
    total_resource_ratings: Number(data?.total_resource_ratings ?? 0),
    total_contributor_ratings: Number(data?.total_contributor_ratings ?? 0),
  }
}

export type PublicPlatformStats = {
  resourcesCount: number
  contributorsCount: number
  categoriesCount: number
}

export async function getPublicPlatformStats(): Promise<PublicPlatformStats> {
  const [resourcesRes, contributorsRes, categoriesRes] = await Promise.all([
    supabase
      .from('resources')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true),

    supabase
      .from('contributors')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),

    supabase
      .from('resource_categories')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),
  ])

  if (resourcesRes.error) throw resourcesRes.error
  if (contributorsRes.error) throw contributorsRes.error
  if (categoriesRes.error) throw categoriesRes.error

  return {
    resourcesCount: resourcesRes.count ?? 0,
    contributorsCount: contributorsRes.count ?? 0,
    categoriesCount: categoriesRes.count ?? 0,
  }
}
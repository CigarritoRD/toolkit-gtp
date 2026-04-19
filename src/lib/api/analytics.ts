/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabaseClient'

export type ResourceEventType = 'open' | 'download'

export type ContributorEventType =
  | 'profile_view'
  | 'website_click'
  | 'instagram_click'
  | 'facebook_click'
  | 'linkedin_click'
  | 'youtube_click'

function getCountryHint() {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale || ''
    return locale.split('-')[1] || 'Unknown'
  } catch {
    return 'Unknown'
  }
}

export async function trackResourceEvent(
  resourceId: string,
  eventType: ResourceEventType,
) {
  const { error } = await supabase.from('resource_events').insert({
    resource_id: resourceId,
    event_type: eventType,
    country: getCountryHint(),
  })

  if (error) {
    console.error('trackResourceEvent error:', error.message)
  }
}

export async function trackContributorEvent(
  contributorId: string,
  eventType: ContributorEventType,
) {
  const { error } = await supabase.from('contributor_events').insert({
    contributor_id: contributorId,
    event_type: eventType,
    country: getCountryHint(),
  })

  if (error) {
    console.error('trackContributorEvent error:', error.message)
  }
}

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

export async function getTopResources(limit = 5): Promise<TopResourceMetric[]> {
  const { data, error } = await supabase
    .from('resources')
    .select('id, title, slug, resource_events!left(id, event_type)')

  if (error) throw error

  const mapped = (data ?? []).map((item: any) => {
    const events = (item.resource_events ?? []).filter((ev: any) =>
      ['open', 'download'].includes(ev.event_type),
    )

    return {
      id: item.id,
      title: item.title,
      slug: item.slug,
      total_opens: events.length,
    }
  })

  return mapped.sort((a, b) => b.total_opens - a.total_opens).slice(0, limit)
}

export async function getTopContributorsByViews(
  limit = 5,
): Promise<TopContributorMetric[]> {
  const { data, error } = await supabase
    .from('contributors')
    .select('id, name, slug, contributor_events!left(id, event_type)')

  if (error) throw error

  const mapped = (data ?? []).map((item: any) => {
    const views = (item.contributor_events ?? []).filter(
      (ev: any) => ev.event_type === 'profile_view',
    )

    return {
      id: item.id,
      name: item.name,
      slug: item.slug,
      total_views: views.length,
    }
  })

  return mapped.sort((a, b) => b.total_views - a.total_views).slice(0, limit)
}

export async function getResourceEventsByCountry(
  limit = 10,
): Promise<CountryMetric[]> {
  const { data, error } = await supabase
    .from('resource_events')
    .select('country')

  if (error) throw error

  const totals = new Map<string, number>()

  for (const row of data ?? []) {
    const key = row.country || 'Unknown'
    totals.set(key, (totals.get(key) ?? 0) + 1)
  }

  return Array.from(totals.entries())
    .map(([country, total]) => ({ country, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit)
}
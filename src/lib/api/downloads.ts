import { supabase } from '@/lib/supabaseClient'
import { getUserCountry } from '@/lib/utils/geolocation'

export type ResourceDownloadInput = {
  resource_id: string
  action_type?: 'download' | 'open_external' | 'preview'
}

export async function trackResourceDownload(input: ResourceDownloadInput) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) throw new Error(authError.message)
  if (!user) throw new Error('You must be signed in to access this resource.')

  const country = await getUserCountry()

  const { error } = await supabase.from('resource_downloads').insert({
    user_id: user.id,
    resource_id: input.resource_id,
    action_type: input.action_type ?? 'download',
    country,
  })

  if (error) throw new Error(error.message)
}

export async function getMyDownloads() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) throw new Error(authError.message)
  if (!user) throw new Error('You must be signed in.')

  const { data, error } = await supabase
    .from('resource_downloads')
    .select(`
      id,
      action_type,
      created_at,
      country,
      resource:resources (
        id,
        title,
        slug,
        thumbnail_url,
        short_description,
        resource_type
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}
import { supabase } from '@/lib/supabaseClient'

export type ContributorApplicationInput = {
  user_id?: string | null

  contact_name: string
  contact_role?: string | null
  contact_email: string
  contact_phone?: string | null

  organization_name: string
  avatar_url?: string | null
  country?: string | null
  organization?: string | null
  specialty?: string | null
  short_bio?: string | null
  full_bio?: string | null
  website_url?: string | null
  instagram_url?: string | null
  facebook_url?: string | null
  linkedin_url?: string | null
  youtube_url?: string | null
}

export async function createContributorApplication(
  values: ContributorApplicationInput,
) {
  const payload = {
    ...values,

    // compatibilidad temporal con columnas viejas
    full_name: values.organization_name,
    email: values.contact_email,

    status: 'pending_review',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('contributor_applications')
    .insert(payload)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function uploadContributorApplicationAvatar(
  file: File,
  userOrEmailKey: string,
) {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const safeKey = userOrEmailKey.replace(/[^a-zA-Z0-9_-]/g, '_')
  const filePath = `${safeKey}/application-avatar-${Date.now()}.${extension}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (uploadError) {
    throw uploadError
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)

  return data.publicUrl
}
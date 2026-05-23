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

function normalizeOptionalUrl(value?: string | null) {
  const trimmed = value?.trim() || ''
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export async function createContributorApplication(
  values: ContributorApplicationInput,
) {
  if (values.user_id) {
    const { data: existing, error: checkError } = await supabase
      .from('contributor_applications')
      .select('id, status')
      .eq('user_id', values.user_id)
      .in('status', ['pending_review', 'approved'])
      .maybeSingle()

    if (checkError) throw checkError

    if (existing) {
      if (existing.status === 'pending_review') {
        throw new Error('Ya tienes una solicitud en revisión.')
      }
      if (existing.status === 'approved') {
        throw new Error('Ya tienes un perfil contributor aprobado.')
      }
    }
  }

  const payload = {
    user_id: values.user_id ?? null,
    full_name: values.organization_name.trim(),
    email: values.contact_email.trim().toLowerCase(),
    avatar_url: values.avatar_url ?? null,
    country: values.country?.trim() || null,
    organization: values.organization?.trim() || null,
    specialty: values.specialty?.trim() || null,
    short_bio: values.short_bio?.trim() || null,
    full_bio: values.full_bio?.trim() || null,
    website_url: normalizeOptionalUrl(values.website_url),
    instagram_url: normalizeOptionalUrl(values.instagram_url),
    facebook_url: normalizeOptionalUrl(values.facebook_url),
    linkedin_url: normalizeOptionalUrl(values.linkedin_url),
    youtube_url: normalizeOptionalUrl(values.youtube_url),
    status: 'pending_review',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    contact_name: values.contact_name.trim(),
    contact_role: values.contact_role?.trim() || null,
    contact_email: values.contact_email.trim().toLowerCase(),
    contact_phone: values.contact_phone?.trim() || null,
    organization_name: values.organization_name.trim(),
  }

  const { error } = await supabase
    .from('contributor_applications')
    .insert(payload)

  if (error) throw error
  return true
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

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
  return data.publicUrl
}

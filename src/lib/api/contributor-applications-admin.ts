import { supabase } from '@/lib/supabaseClient'

export type ContributorApplicationRecord = {
  id: string
  user_id: string | null
  contact_name: string | null
  contact_role: string | null
  contact_email: string | null
  contact_phone: string | null
  organization_name: string | null
  full_name: string | null
  email: string | null
  avatar_url: string | null
  country: string | null
  organization: string | null
  specialty: string | null
  short_bio: string | null
  full_bio: string | null
  website_url: string | null
  instagram_url: string | null
  facebook_url: string | null
  linkedin_url: string | null
  youtube_url: string | null
  status: 'pending_review' | 'approved' | 'rejected'
  admin_notes: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

function clean(value?: string | null) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function ensureUniqueContributorSlug(baseName: string) {
  const baseSlug = slugify(baseName) || 'contributor'

  const { data, error } = await supabase
    .from('contributors')
    .select('slug')
    .ilike('slug', `${baseSlug}%`)

  if (error) throw error

  const existing = new Set((data ?? []).map((item) => item.slug))

  if (!existing.has(baseSlug)) return baseSlug

  let counter = 2
  while (existing.has(`${baseSlug}-${counter}`)) counter += 1

  return `${baseSlug}-${counter}`
}

const applicationSelect = `
  id,
  user_id,
  contact_name,
  contact_role,
  contact_email,
  contact_phone,
  organization_name,
  full_name,
  email,
  avatar_url,
  country,
  organization,
  specialty,
  short_bio,
  full_bio,
  website_url,
  instagram_url,
  facebook_url,
  linkedin_url,
  youtube_url,
  status,
  admin_notes,
  reviewed_by,
  reviewed_at,
  created_at,
  updated_at
`

export async function getContributorApplications(status?: string) {
  let query = supabase
    .from('contributor_applications')
    .select(applicationSelect)
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) throw error

  return (data ?? []) as ContributorApplicationRecord[]
}

export async function getMyApplication(userId: string) {
  const { data, error } = await supabase
    .from('contributor_applications')
    .select(applicationSelect)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as ContributorApplicationRecord[]
}

export async function getContributorApplicationById(id: string) {
  const { data, error } = await supabase
    .from('contributor_applications')
    .select(applicationSelect)
    .eq('id', id)
    .single()

  if (error) throw error

  return data as ContributorApplicationRecord
}

export async function approveContributorApplication(
  applicationId: string,
  adminUserId: string,
  adminNotes?: string,
) {
  const application = await getContributorApplicationById(applicationId)

  if (application.status !== 'pending_review') {
    throw new Error('Esta solicitud ya fue revisada.')
  }

  if (!application.user_id) {
    throw new Error('La solicitud no tiene usuario asociado.')
  }

  const { data: existingContributor } = await supabase
    .from('contributors')
    .select('id, user_id, name')
    .eq('user_id', application.user_id)
    .maybeSingle()

  if (existingContributor) {
    throw new Error('Este usuario ya tiene un perfil contributor vinculado.')
  }

  const contributorName =
    clean(application.organization_name) ||
    clean(application.full_name) ||
    clean(application.contact_name) ||
    'Contributor'

  const slug = await ensureUniqueContributorSlug(contributorName)

  const { error: contributorError } = await supabase.from('contributors').insert({
    user_id: application.user_id,
    name: contributorName,
    slug,
    short_bio: clean(application.short_bio),
    full_bio: clean(application.full_bio),
    specialty: clean(application.specialty),
    avatar_url: clean(application.avatar_url),
    website_url: clean(application.website_url),
    instagram_url: clean(application.instagram_url),
    facebook_url: clean(application.facebook_url),
    linkedin_url: clean(application.linkedin_url),
    youtube_url: clean(application.youtube_url),
    country: clean(application.country),
    organization: clean(application.organization || application.organization_name),
    is_featured: false,
    is_active: true,
    contact_name: clean(application.contact_name),
    contact_role: clean(application.contact_role),
    contact_email: clean(application.contact_email),
    contact_phone: clean(application.contact_phone),
  })

  if (contributorError) throw contributorError

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'contributor' })
    .eq('id', application.user_id)

  if (profileError) {
    console.error('Failed to update profile role:', profileError)
  }

  const { error: updateError } = await supabase
    .from('contributor_applications')
    .update({
      status: 'approved',
      admin_notes: clean(adminNotes),
      reviewed_by: adminUserId,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', applicationId)

  if (updateError) throw updateError
}

export async function rejectContributorApplication(
  applicationId: string,
  adminUserId: string,
  adminNotes?: string,
) {
  const { error } = await supabase
    .from('contributor_applications')
    .update({
      status: 'rejected',
      admin_notes: clean(adminNotes),
      reviewed_by: adminUserId,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', applicationId)

  if (error) throw error
}

export async function getPendingContributorApplicationsCount() {
  const { count, error } = await supabase
    .from('contributor_applications')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending_review')

  if (error) throw error

  return count ?? 0
}
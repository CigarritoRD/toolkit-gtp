import { supabase } from '@/lib/supabaseClient'

export type ContributorProfile = {
  id: string
  user_id: string | null
  name: string | null
  slug: string | null
  short_bio: string | null
  full_bio: string | null
  specialty: string | null
  avatar_url: string | null
  website_url: string | null
  instagram_url: string | null
  facebook_url: string | null
  linkedin_url: string | null
  youtube_url: string | null
  is_featured: boolean
  is_active: boolean
  contact_name: string | null
  contact_role: string | null
  contact_email: string | null
  contact_phone: string | null
  country: string | null
  organization: string | null
  created_at: string
  access_type: 'account' | 'external'
}

export type ContributorResourceListItem = {
  id: string
  title: string
  slug: string
  short_description: string | null
  thumbnail_url: string | null
  resource_type: string | null
  is_featured: boolean
  is_public: boolean
  is_published: boolean
  approval_status: 'draft' | 'pending_review' | 'approved' | 'rejected'
  rejection_reason: string | null
  submitted_at: string | null
  created_at: string
  contributor_id: string
  category_id: string
  category: {
    id: string
    name: string
    slug: string
  } | null
}

export async function getMyContributorProfile(userId: string) {
  const { data, error } = await supabase
    .from('contributors')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data as ContributorProfile
}

export async function updateMyContributorProfile(
  userId: string,
  input: Partial<ContributorProfile>,
) {
  const { data, error } = await supabase
    .from('contributors')
    .update({
      name: input.name,
      short_bio: input.short_bio,
      full_bio: input.full_bio,
      specialty: input.specialty,
      avatar_url: input.avatar_url,
      website_url: input.website_url,
      instagram_url: input.instagram_url,
      facebook_url: input.facebook_url,
      linkedin_url: input.linkedin_url,
      youtube_url: input.youtube_url,
      contact_name: input.contact_name,
      contact_role: input.contact_role,
      contact_email: input.contact_email,
      contact_phone: input.contact_phone,
      country: input.country,
      organization: input.organization,
    })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data as ContributorProfile
}

export async function getMyContributorResources(userId: string) {
  const { data, error } = await supabase
    .from('resources')
    .select(`
      id,
      title,
      slug,
      short_description,
      thumbnail_url,
      resource_type,
      is_featured,
      is_public,
      is_published,
      approval_status,
      rejection_reason,
      submitted_at,
      created_at,
      contributor_id,
      category_id,
      category:categories (
        id,
        name,
        slug
      )
    `)
    .eq('created_by', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as unknown as ContributorResourceListItem[]
}

export async function getMyContributorResourceById(
  userId: string,
  resourceId: string,
) {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('id', resourceId)
    .eq('created_by', userId)
    .single()

  if (error) throw error
  return data
}

export type ContributorResourceInput = {
  title: string
  slug: string
  description?: string | null
  short_description?: string | null
  full_description?: string | null
  thumbnail_url?: string | null
  resource_type?: string | null
  category_id: string
  file_url?: string | null
  external_url?: string | null
  is_public?: boolean
}

export async function createContributorResource(
  userId: string,
  input: ContributorResourceInput,
) {
  const { data, error } = await supabase
    .from('resources')
    .insert({
      title: input.title,
      slug: input.slug,
      description: input.description ?? null,
      short_description: input.short_description ?? null,
      full_description: input.full_description ?? null,
      thumbnail_url: input.thumbnail_url ?? null,
      resource_type: input.resource_type ?? null,
      category_id: input.category_id,
      file_url: input.file_url ?? null,
      external_url: input.external_url ?? null,
      is_public: input.is_public ?? false,
      is_published: false,
      is_featured: false,
      approval_status: 'draft',
      created_by: userId,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateContributorResource(
  userId: string,
  resourceId: string,
  input: Partial<ContributorResourceInput>,
) {
  const { data, error } = await supabase
    .from('resources')
    .update({
      title: input.title,
      slug: input.slug,
      description: input.description ?? null,
      short_description: input.short_description ?? null,
      full_description: input.full_description ?? null,
      thumbnail_url: input.thumbnail_url ?? null,
      resource_type: input.resource_type ?? null,
      category_id: input.category_id,
      file_url: input.file_url ?? null,
      external_url: input.external_url ?? null,
      is_public: input.is_public ?? false,
    })
    .eq('id', resourceId)
    .eq('created_by', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function submitContributorResourceForReview(resourceId: string) {
  const { error } = await supabase
    .from('resources')
    .update({
      approval_status: 'pending_review',
      submitted_at: new Date().toISOString(),
    })
    .eq('id', resourceId)

  if (error) throw error
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) throw error
  return data ?? []
}
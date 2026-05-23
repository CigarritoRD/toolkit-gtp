import { supabase } from '@/lib/supabaseClient'
import type { ContributorListItem, ContributorDetail, ContributorListItemAdmin } from '@/types/contributors'
import type { ResourceListItem } from '@/types/resources'

export type { ContributorDetail } from '@/types/contributors'

export async function getActiveContributors(): Promise<ContributorListItem[]> {
  const { data, error } = await supabase
    .from('contributors')
    .select(`
      id,
      name,
      slug,
      short_bio,
      specialty,
      avatar_url,
      website_url,
      is_featured,
      is_active,
      created_at
    `)
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('name', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as ContributorListItem[]
}

export async function deactivateContributor(id: string) {
  const { error } = await supabase
    .from('contributors')
    .update({ is_active: false })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function activateContributor(id: string) {
  const { error } = await supabase
    .from('contributors')
    .update({ is_active: true })
    .eq('id', id)

  if (error) throw new Error(error.message)
}
export async function getContributorBySlug(
  slug: string,
): Promise<ContributorDetail | null> {
  const { data, error } = await supabase
    .from('contributors')
    .select(`
      id,
      name,
      slug,
      short_bio,
      full_bio,
      specialty,
      avatar_url,
      website_url,
      instagram_url,
      facebook_url,
      linkedin_url,
      youtube_url,
      is_featured,
      is_active,
      created_at
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }

  return data as ContributorDetail
}

export async function getContributorResources(
  contributorId: string,
): Promise<ResourceListItem[]> {
  const { data, error } = await supabase
    .from('resources')
    .select(`
      id,
      title,
      slug,
      description,
      short_description,
      thumbnail_url,
      resource_type,
      contributor_id,
      category_id,
      is_featured,
      is_public,
      is_published,
      created_at,
      contributor:contributors (
        id,
        name,
        slug
      ),
      category:categories (
        id,
        name,
        slug
      )
    `)
    .eq('contributor_id', contributorId)
    .eq('is_public', true)
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as unknown as ResourceListItem[]
}

export async function getFeaturedContributors(): Promise<ContributorListItem[]> {
  const { data, error } = await supabase
    .from('contributors')
    .select(`
      id,
      name,
      slug,
      short_bio,
      specialty,
      avatar_url,
      website_url,
      is_featured,
      is_active,
      created_at
    `)
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('name', { ascending: true })
    .limit(3)

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as ContributorListItem[]
}

export type AdminContributorInput = {
  name: string
  slug: string
  short_bio?: string | null
  full_bio?: string | null
  specialty?: string | null
  avatar_url?: string | null
  website_url?: string | null
  instagram_url?: string | null
  facebook_url?: string | null
  linkedin_url?: string | null
  youtube_url?: string | null
  contact_name?: string | null
  contact_role?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  is_featured?: boolean
  is_active?: boolean
}

export async function getAdminContributors(): Promise<ContributorListItemAdmin[]> {
  const { data, error } = await supabase
    .from('contributors')
    .select(`
      id,
      name,
      slug,
      short_bio,
      specialty,
      avatar_url,
      website_url,
      is_featured,
      is_active,
      created_at,
      user_id,
      access_type
    `)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as ContributorListItemAdmin[]
}

export async function getContributorById(id: string): Promise<ContributorDetail | null> {
  const { data, error } = await supabase
    .from('contributors')
    .select(`
      id,
      name,
      slug,
      short_bio,
      full_bio,
      specialty,
      avatar_url,
      website_url,
      instagram_url,
      facebook_url,
      linkedin_url,
      youtube_url,
      is_featured,
      is_active,
      created_at,
      user_id,
      access_type,
      contact_name,
      contact_role,
      contact_email,
      contact_phone
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }

  return data as ContributorDetail
}

export async function createContributor(input: AdminContributorInput) {
  const { data, error } = await supabase
    .from('contributors')
    .insert({
      name: input.name,
      slug: input.slug,
      short_bio: input.short_bio ?? null,
      full_bio: input.full_bio ?? null,
      specialty: input.specialty ?? null,
      avatar_url: input.avatar_url ?? null,
      website_url: input.website_url ?? null,
      instagram_url: input.instagram_url ?? null,
      facebook_url: input.facebook_url ?? null,
      linkedin_url: input.linkedin_url ?? null,
      youtube_url: input.youtube_url ?? null,
      is_featured: input.is_featured ?? false,
      is_active: input.is_active ?? true,
      contact_name: input.contact_name ?? null,
      contact_role: input.contact_role ?? null,
      contact_email: input.contact_email ?? null,
      contact_phone: input.contact_phone ?? null,
      access_type: 'external',
      user_id: null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateContributor(id: string, input: AdminContributorInput) {
  const { data, error } = await supabase
    .from('contributors')
    .update({
      name: input.name,
      slug: input.slug,
      short_bio: input.short_bio ?? null,
      full_bio: input.full_bio ?? null,
      specialty: input.specialty ?? null,
      avatar_url: input.avatar_url ?? null,
      website_url: input.website_url ?? null,
      instagram_url: input.instagram_url ?? null,
      facebook_url: input.facebook_url ?? null,
      linkedin_url: input.linkedin_url ?? null,
      youtube_url: input.youtube_url ?? null,
      is_featured: input.is_featured ?? false,
      is_active: input.is_active ?? true,
      contact_name: input.contact_name ?? null,
      contact_role: input.contact_role ?? null,
      contact_email: input.contact_email ?? null,
      contact_phone: input.contact_phone ?? null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function getUserByEmail(email: string): Promise<{ id: string; email: string; full_name: string | null } | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('email', email.toLowerCase())
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }

  return data as { id: string; email: string; full_name: string | null }
}

export async function linkContributorToUser(
  contributorId: string,
  userId: string,
) {
  const { data, error } = await supabase.rpc('link_contributor_to_user', {
    p_contributor_id: contributorId,
    p_user_id: userId,
  })

  if (error) throw new Error(error.message)
  return data as { id: string; name: string; userId: string }
}

export async function unlinkContributorUser(contributorId: string) {
  const { error } = await supabase
    .from('contributors')
    .update({
      user_id: null,
      access_type: 'external',
    })
    .eq('id', contributorId)

  if (error) throw new Error(error.message)
}

function sanitizeFileName(fileName: string) {
  return fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
}

export async function uploadContributorAvatar(file: File, contributorSlug: string) {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const safeName = sanitizeFileName(file.name.replace(/\.[^.]+$/, ''))
  const filePath = `${contributorSlug}/${Date.now()}-${safeName}.${extension}`

  const { error: uploadError } = await supabase.storage
    .from('contributors')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const { data } = supabase.storage.from('contributors').getPublicUrl(filePath)

  return data.publicUrl
}


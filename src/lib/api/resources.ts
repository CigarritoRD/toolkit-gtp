import { supabase } from '@/lib/supabaseClient'

export type AdminResourceInput = {
  title: string
  slug: string
  description?: string | null
  short_description?: string | null
  full_description?: string | null
  thumbnail_url?: string | null
  resource_type?: string | null
  contributor_id: string
  category_id: string
  file_url?: string | null
  external_url?: string | null
  is_featured?: boolean
  is_public?: boolean
  is_published?: boolean
}

export async function getAdminResources() {
  const { data, error } = await supabase
    .from('resources')
    .select(`
      id,
      title,
      slug,
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
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getResourceById(id: string) {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function createResource(input: AdminResourceInput) {
  const { data, error } = await supabase
    .from('resources')
    .insert({
      title: input.title,
      slug: input.slug,
      file_url: input.file_url ?? null,
      external_url: input.external_url ?? null,
      description: input.description ?? null,
      short_description: input.short_description ?? null,
      full_description: input.full_description ?? null,
      thumbnail_url: input.thumbnail_url ?? null,
      resource_type: input.resource_type ?? null,
      contributor_id: input.contributor_id,
      category_id: input.category_id,
      is_featured: input.is_featured ?? false,
      is_public: input.is_public ?? true,
      is_published: input.is_published ?? true,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateResource(id: string, input: AdminResourceInput) {
  const { data, error } = await supabase
    .from('resources')
    .update({
      title: input.title,
      slug: input.slug,
      file_url: input.file_url ?? null,
      external_url: input.external_url ?? null,
      description: input.description ?? null,
      short_description: input.short_description ?? null,
      full_description: input.full_description ?? null,
      thumbnail_url: input.thumbnail_url ?? null,
      resource_type: input.resource_type ?? null,
      contributor_id: input.contributor_id,
      category_id: input.category_id,
      is_featured: input.is_featured ?? false,
      is_public: input.is_public ?? true,
      is_published: input.is_published ?? true,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deactivateResource(id: string) {
  const { error } = await supabase
    .from('resources')
    .update({ is_published: false })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function activateResource(id: string) {
  const { error } = await supabase
    .from('resources')
    .update({ is_published: true })
    .eq('id', id)

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
// SUBE LA MINIATURA DEL RECURSO Y DEVUELVE LA URL PÚBLICA
export async function uploadResourceThumbnail(
  file: File,
  slug: string,
  contributorId: string,
) {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const safe = sanitizeFileName(file.name.replace(/\.[^.]+$/, ''))
  const path = `${contributorId}/${slug}/${Date.now()}-${safe}.${ext}`

  const { error } = await supabase.storage
    .from('thumbnail')
    .upload(path, file, { upsert: true })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from('thumbnail').getPublicUrl(path)
  return data.publicUrl
}



export async function uploadResourceFile(file: File, slug: string) {
  const ext = file.name.split('.').pop() ?? 'pdf'
  const safe = sanitizeFileName(file.name.replace(/\.[^.]+$/, ''))
  const path = `resources/${slug}/${Date.now()}-${safe}.${ext}`

  const { error } = await supabase.storage
    .from('resources')
    .upload(path, file, { upsert: true })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from('resources').getPublicUrl(path)
  return data.publicUrl
}

export type ResourceCategory = {
  id: string
  name: string
  slug: string
  description?: string | null
  icon?: string | null
  is_active?: boolean
}

export async function getActiveResourceCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, description, icon, is_active')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as ResourceCategory[]
}

export async function getFeaturedResources() {
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
        slug,
        avatar_url
      ),
      category:categories (
        id,
        name,
        slug
      ),
      resource_tags (
        tag:tags (
          id,
          name,
          slug
        )
      )
    `)
    .eq('is_featured', true)
    .eq('is_public', true)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getPublishedResources() {
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
        slug,
        avatar_url
      ),
      category:categories (
        id,
        name,
        slug
      ),
      resource_tags (
        tag:tags (
          id,
          name,
          slug
        )
      )
    `)
    .eq('is_public', true)
    .eq('is_published', true)
    .eq('approval_status', 'approved')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getPublishedResourceBySlug(slug: string) {
  const { data, error } = await supabase
    .from('resources')
    .select(`
      id,
      title,
      slug,
      file_url,
      external_url,
      description,
      short_description,
      thumbnail_url,
      resource_type,
      contributor_id,
      category_id,
      is_featured,
      is_public,
      is_published,
      approval_status,
      created_at,
      contributor:contributors (
        id,
        name,
        slug,
        avatar_url,
        short_bio
      ),
      category:categories (
        id,
        name,
        slug
      ),
      resource_tags (
        tag:tags (
          id,
          name,
          slug
        )
      )
    `)
    .eq('slug', slug)
    .eq('is_public', true)
    .eq('is_published', true)
    .eq('approval_status', 'approved')
    .single()

  if (error) throw new Error(error.message)
  return data
}

export type ResourceApprovalStatus = 'draft' | 'pending_review' | 'approved' | 'rejected'

export async function getPendingReviewResources() {
  const { data, error } = await supabase
    .from('resources')
    .select(`
      id,
      title,
      slug,
      short_description,
      thumbnail_url,
      resource_type,
      contributor_id,
      created_by,
      approval_status,
      rejection_reason,
      submitted_at,
      created_at,
      contributor:contributors (
        id,
        name,
        slug
      )
    `)
    .eq('approval_status', 'pending_review')
    .order('submitted_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function approveResource(resourceId: string, adminId: string) {
  const { error } = await supabase
    .from('resources')
    .update({
      approval_status: 'approved',
      is_published: true,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', resourceId)

  if (error) throw new Error(error.message)
}

export async function rejectResource(
  resourceId: string,
  adminId: string,
  reason?: string,
) {
  const { error } = await supabase
    .from('resources')
    .update({
      approval_status: 'rejected',
      rejection_reason: reason ?? null,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', resourceId)

  if (error) throw new Error(error.message)
}

export async function submitResourceForReview(resourceId: string) {
  const { error } = await supabase
    .from('resources')
    .update({
      approval_status: 'pending_review',
      submitted_at: new Date().toISOString(),
    })
    .eq('id', resourceId)

  if (error) throw new Error(error.message)
}
import { supabase } from '@/lib/supabaseClient'

export type TagRecord = {
  id: string
  name: string
  slug: string
  description?: string | null
  group_key?: string | null
  is_active: boolean
  created_at?: string
}

export type TagInput = {
  name: string
  slug?: string
  description?: string | null
  group_key?: string | null
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

export async function getTags() {
  const { data, error } = await supabase
    .from('tags')
    .select('id, name, slug, description, group_key, is_active, created_at')
    .order('name', { ascending: true })

  if (error) throw error
  return (data ?? []) as TagRecord[]
}

export async function getActiveTags() {
  const { data, error } = await supabase
    .from('tags')
    .select('id, name, slug, description, group_key, is_active, created_at')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) throw error
  return (data ?? []) as TagRecord[]
}

export async function createTag(values: TagInput) {
  const finalSlug = values.slug?.trim() || slugify(values.name)

  const { data, error } = await supabase
    .from('tags')
    .insert({
      name: values.name.trim(),
      slug: finalSlug,
      description: values.description ?? null,
      group_key: values.group_key ?? null,
      is_active: true,
    })
    .select('id, name, slug, description, group_key, is_active, created_at')
    .single()

  if (error) throw error
  return data as TagRecord
}

export async function updateTag(
  id: string,
  values: Partial<TagInput> & { is_active?: boolean },
) {
  const payload = {
    ...(values.name !== undefined ? { name: values.name.trim() } : {}),
    ...(values.slug !== undefined
      ? { slug: values.slug.trim() || (values.name ? slugify(values.name) : undefined) }
      : values.name !== undefined
        ? { slug: slugify(values.name) }
        : {}),
    ...(values.description !== undefined
      ? { description: values.description }
      : {}),
    ...(values.group_key !== undefined
      ? { group_key: values.group_key }
      : {}),
    ...(values.is_active !== undefined
      ? { is_active: values.is_active }
      : {}),
  }

  const { data, error } = await supabase
    .from('tags')
    .update(payload)
    .eq('id', id)
    .select('id, name, slug, description, group_key, is_active, created_at')
    .single()

  if (error) throw error
  return data as TagRecord
}

export async function setResourceTags(resourceId: string, tagIds: string[]) {
  const { error } = await supabase.rpc('set_resource_tags', {
    p_resource_id: resourceId,
    p_tag_ids: tagIds,
  })

  if (error) throw new Error(error.message)
}

export async function getResourceTagIds(resourceId: string) {
  const { data, error } = await supabase
    .from('resource_tags')
    .select('tag_id')
    .eq('resource_id', resourceId)

  if (error) throw error
  return (data ?? []).map((item) => item.tag_id as string)
}
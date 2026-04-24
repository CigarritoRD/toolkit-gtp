import { supabase } from '@/lib/supabaseClient'

type UpdateMyProfileInput = {
  full_name?: string
  avatar_url?: string | null
  country?: string | null
}

export async function updateMyProfile(
  userId: string,
  values: UpdateMyProfileInput,
) {
  const payload = {
    ...values,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId)

  if (error) throw error
}

export async function uploadProfileAvatar(file: File, userId: string) {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const filePath = `${userId}/avatar-${Date.now()}.${extension}`

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
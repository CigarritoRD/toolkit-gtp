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
  const { data, error } = await supabase.rpc('approve_contributor_application', {
    p_application_id: applicationId,
    p_admin_user_id: adminUserId,
    p_admin_notes: adminNotes ?? null,
  })

  if (error) throw new Error(error.message)
  return data
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
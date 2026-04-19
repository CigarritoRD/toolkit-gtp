import { supabase } from '@/lib/supabaseClient'

export type RatingSummary = {
  average_rating: number
  total_ratings: number
}

export type RatingReview = {
  id: string
  rating: number
  review_text: string | null
  created_at: string
  user_id: string
  profile?: {
    full_name?: string | null
    avatar_url?: string | null
  } | null
}

async function getCurrentUserId() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user?.id ?? null
}

export async function upsertResourceRating(
  resourceId: string,
  rating: number,
  reviewText?: string,
) {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('AUTH_REQUIRED')

  const { data, error } = await supabase
    .from('resource_ratings')
    .upsert(
      {
        resource_id: resourceId,
        user_id: userId,
        rating,
        review_text: reviewText?.trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'resource_id,user_id' },
    )
    .select()
    .single()

  if (error) throw error
  return data
}

export async function upsertContributorRating(
  contributorId: string,
  rating: number,
  reviewText?: string,
) {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('AUTH_REQUIRED')

  const { data, error } = await supabase
    .from('contributor_ratings')
    .upsert(
      {
        contributor_id: contributorId,
        user_id: userId,
        rating,
        review_text: reviewText?.trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'contributor_id,user_id' },
    )
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getResourceRatingSummary(
  resourceId: string,
): Promise<RatingSummary> {
  const { data, error } = await supabase
    .from('resource_rating_summary')
    .select('average_rating, total_ratings')
    .eq('resource_id', resourceId)
    .maybeSingle()

  if (error) throw error

  return {
    average_rating: Number(data?.average_rating ?? 0),
    total_ratings: Number(data?.total_ratings ?? 0),
  }
}

export async function getContributorRatingSummary(
  contributorId: string,
): Promise<RatingSummary> {
  const { data, error } = await supabase
    .from('contributor_rating_summary')
    .select('average_rating, total_ratings')
    .eq('contributor_id', contributorId)
    .maybeSingle()

  if (error) throw error

  return {
    average_rating: Number(data?.average_rating ?? 0),
    total_ratings: Number(data?.total_ratings ?? 0),
  }
}

export async function getMyResourceRating(resourceId: string) {
  const userId = await getCurrentUserId()
  if (!userId) return null

  const { data, error } = await supabase
    .from('resource_ratings')
    .select('id, rating, review_text, created_at, user_id')
    .eq('resource_id', resourceId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function getMyContributorRating(contributorId: string) {
  const userId = await getCurrentUserId()
  if (!userId) return null

  const { data, error } = await supabase
    .from('contributor_ratings')
    .select('id, rating, review_text, created_at, user_id')
    .eq('contributor_id', contributorId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function getResourceReviews(
  resourceId: string,
  limit = 10,
): Promise<RatingReview[]> {
  const { data, error } = await supabase
    .from('resource_ratings')
    .select(`
      id,
      rating,
      review_text,
      created_at,
      user_id,
      profile:profiles(full_name, avatar_url)
    `)
    .eq('resource_id', resourceId)
    .not('review_text', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as RatingReview[]
}

export async function getContributorReviews(
  contributorId: string,
  limit = 10,
): Promise<RatingReview[]> {
  const { data, error } = await supabase
    .from('contributor_ratings')
    .select(`
      id,
      rating,
      review_text,
      created_at,
      user_id,
      profile:profiles(full_name, avatar_url)
    `)
    .eq('contributor_id', contributorId)
    .not('review_text', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as RatingReview[]
}
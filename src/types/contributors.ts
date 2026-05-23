export type ContributorListItem = {
  id: string
  name: string
  slug: string
  short_bio: string | null
  specialty: string | null
  avatar_url: string | null
  website_url: string | null
  is_featured: boolean
  is_active: boolean
  created_at: string
}

export type ContributorAccessType = 'account' | 'external'

export type ContributorListItemAdmin = ContributorListItem & {
  user_id: string | null
  access_type: ContributorAccessType
}

export type ContributorDetail = {
  id: string
  name: string
  slug: string
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
  created_at: string
  user_id: string | null
  access_type: ContributorAccessType
  contact_name: string | null
  contact_role: string | null
  contact_email: string | null
  contact_phone: string | null
}

export type ContributorProfileCard = {
  id: string
  name: string
  slug: string
  short_bio: string | null
  specialty: string | null
  avatar_url: string | null
  website_url: string | null
  instagram_url: string | null
  facebook_url: string | null
  linkedin_url: string | null
  youtube_url: string | null
  is_featured: boolean
  is_active: boolean
  created_at: string
  user_id: string | null
  access_type: ContributorAccessType
  contact_name: string | null
  contact_role: string | null
  contact_email: string | null
  contact_phone: string | null
  email?: string | null
}
import type { Session } from '@supabase/supabase-js'

export type Profile = {
  id: string
  full_name: string | null
  email: string | null
  role: 'user' | 'contributor' | 'admin'
  country: string | null
  organization: string | null
  avatar_url: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

export type AuthContextType = {
  user: Session['user'] | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (
    email: string,
    password: string,
    fullName: string,
    country?: string,
    phone?: string,
  ) => Promise<unknown>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
}
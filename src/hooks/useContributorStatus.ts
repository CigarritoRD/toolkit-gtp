import { useEffect, useState } from 'react'
import { useAuth } from '@/auth/useAuth'
import { getMyApplication } from '@/lib/api/contributor-applications-admin'
import { getMyContributorProfile } from '@/lib/api/contributor-dashboard'

export type ContributorStatus =
  | 'user'
  | 'pending'
  | 'contributor'

export function useContributorStatus() {
  const { user, profile, refreshProfile } = useAuth()

  const [contributorProfile, setContributorProfile] = useState<Record<string, unknown> | null>(null)
  const [latestApplication, setLatestApplication] = useState<{ id: string; status: string; admin_notes: string | null } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function load() {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        const [applicationData, profileData] = await Promise.all([
          getMyApplication(user.id),
          getMyContributorProfile(user.id).catch(() => null),
        ])

        if (!active) return

        setLatestApplication(applicationData[0] ?? null)
        setContributorProfile(profileData as typeof contributorProfile)

        if (applicationData[0]?.status === 'approved' && profile?.role !== 'contributor') {
          await refreshProfile()
        }
      } catch {
        if (active) setLatestApplication(null)
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [user?.id, profile?.role, refreshProfile])

  const status: ContributorStatus =
    profile?.role === 'contributor' || profile?.role === 'admin' || latestApplication?.status === 'approved'
      ? 'contributor'
      : latestApplication?.status === 'pending_review'
        ? 'pending'
        : 'user'

  return {
    status,
    contributorProfile,
    latestApplication,
    loading,
  }
}
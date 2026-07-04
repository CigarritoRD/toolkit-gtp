import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/auth/useAuth'
import { LoadingState } from '@/components/ui/Skeleton'

export default function ContributorRoute() {
  const { t } = useTranslation()
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingState variant="fullPage" text={t('loading.preparing')} />
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!profile) {
    return <Navigate to="/login" replace state={{ from: location, reason: 'profile_missing' }} />
  }

  if (profile.role !== 'contributor' && profile.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/auth/useAuth'
import { LoadingState } from '@/components/ui/Skeleton'

export default function GuestRoute() {
  const { t } = useTranslation()
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingState variant="fullPage" text={t('loading.preparing')} />
  }

  if (user) {
    return <Navigate to="/dashboard" replace state={{ from: location }} />
  }

  return <Outlet />
}

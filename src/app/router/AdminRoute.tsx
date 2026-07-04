import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/auth/useAuth'
import { LoadingState } from '@/components/ui/Skeleton'

type AdminRouteProps = {
  children: ReactNode
}

export default function AdminRoute({ children }: AdminRouteProps) {
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
    return <LoadingState variant="fullPage" text={t('loading.profile')} />
  }

  if (profile.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

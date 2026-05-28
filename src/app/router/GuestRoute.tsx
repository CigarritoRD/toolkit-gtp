import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { LoadingState } from '@/components/ui/Skeleton'

export default function GuestRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingState variant="fullPage" text="Preparando tu espacio..." />
  }

  if (user) {
    return <Navigate to="/dashboard" replace state={{ from: location }} />
  }

  return <Outlet />
}

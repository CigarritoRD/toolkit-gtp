import { Link, NavLink, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/auth/useAuth'
import { useContributorStatus } from '@/hooks/useContributorStatus'

const navItems = [
  { label: 'Inicio', to: '/dashboard' },
  { label: 'Mi librería', to: '/dashboard/library' },
  { label: 'Descargas', to: '/dashboard/downloads' },
  { label: 'Perfil', to: '/dashboard/profile' },
]

const contributorNavItems = [
  { label: 'Mi perfil', to: '/dashboard/contributor/profile' },
  { label: 'Mis recursos', to: '/dashboard/contributor/resources' },
]

type DashboardSidebarProps = {
  onNavigate?: () => void
}

export default function DashboardSidebar({
  onNavigate,
}: DashboardSidebarProps) {
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()
  const { t } = useTranslation()
  const { status, loading } = useContributorStatus()

  const displayName =
    profile?.full_name?.trim() || user?.email?.split('@')[0] || 'Usuario'

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Sesión cerrada correctamente.')
      onNavigate?.()
      navigate('/')
    } catch (error) {
      console.error(error)
      toast.error('No se pudo cerrar sesión.')
    }
  }

  return (
    <aside className="sticky top-0 h-screen w-64 shrink-0 border-r border-surface-border bg-surface/60 p-6 backdrop-blur-xl">
      <div className="mb-8">
        <p className="font-heading text-xl text-text-primary">Toolkit</p>
        <p className="mt-1 text-sm text-brand-primary">Panel de usuario</p>
      </div>

      <div className="mb-8 rounded-3xl border border-surface-border bg-bg-soft p-4">
        <p className="font-medium text-text-primary">{displayName}</p>
        <p className="mt-1 text-sm text-brand-primary">{user?.email}</p>
      </div>

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                'rounded-2xl px-4 py-3 text-sm font-medium transition',
                isActive
                  ? 'bg-brand-primary text-white'
                  : 'text-brand-primary hover:bg-bg-soft hover:text-text-primary',
              ].join(' ')
            }
          >
            {item.label}
          </NavLink>
        ))}

        {loading ? null : status === 'user' && (
          <>
            <div className="my-2 border-t border-surface-border" />
            <p className="mb-1 px-4 text-xs font-medium uppercase tracking-wider text-text-secondary">
              {t('dashboard.title')}
            </p>
            <Link
              to="/become-a-contributor"
              className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-brand-accent transition hover:bg-bg-soft hover:text-text-primary"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t('dashboard.contributorCta.button')}
            </Link>
          </>
        )}

        {status === 'pending' && (
          <>
            <div className="my-2 border-t border-surface-border" />
            <p className="mb-1 px-4 text-xs font-medium uppercase tracking-wider text-text-secondary">
              {t('dashboard.title')}
            </p>
            <Link
              to="/become-a-contributor"
              className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-yellow-600 transition hover:bg-bg-soft hover:text-text-primary"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('dashboard.contributorCta.pendingShort') ?? t('dashboard.contributorCta.pendingTitle')}
            </Link>
          </>
        )}

        {(status === 'contributor') && (
          <>
            <div className="my-2 border-t border-surface-border" />
            <p className="mb-1 px-4 text-xs font-medium uppercase tracking-wider text-text-secondary">
              Colaborador
            </p>
            {contributorNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard/contributor'}
                onClick={onNavigate}
                className={({ isActive }) =>
                  [
                    'rounded-2xl px-4 py-3 text-sm font-medium transition',
                    isActive
                      ? 'bg-brand-accent text-white'
                      : 'text-brand-primary hover:bg-bg-soft hover:text-text-primary',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/dashboard/contributor/resources/new"
              className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-brand-accent transition hover:bg-bg-soft hover:text-text-primary"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t('contributorDashboard.newResource')}
            </Link>
          </>
        )}
      </nav>

      <button
        type="button"
        onClick={handleSignOut}
        className="mt-8 w-full rounded-2xl border border-surface-border bg-bg-soft px-4 py-3 text-sm font-medium text-text-primary transition hover:bg-surface-hover"
      >
        Cerrar sesión
      </button>
    </aside>
  )
}
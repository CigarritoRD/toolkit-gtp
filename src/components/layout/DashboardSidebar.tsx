import { Link, NavLink, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/auth/useAuth'
import { useContributorStatus } from '@/hooks/useContributorStatus'
import { Home, Library, Download, User, Plus, UserCircle, FileText, Clock, LogOut } from 'lucide-react'
import gtpLogo from '@/assets/gtp-logo.png'

const navItems = [
  { label: 'Inicio', to: '/dashboard', icon: Home },
  { label: 'Mi librería', to: '/dashboard/library', icon: Library },
  { label: 'Descargas', to: '/dashboard/downloads', icon: Download },
  { label: 'Perfil', to: '/dashboard/profile', icon: User },
]

const contributorNavItems = [
  { label: 'Mi perfil', to: '/dashboard/contributor/profile', icon: UserCircle },
  { label: 'Mis recursos', to: '/dashboard/contributor/resources', icon: FileText },
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
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-surface-border bg-surface/60 backdrop-blur-xl">
      <div className="px-6 pt-6">
        <div className="flex items-center gap-3">
          <img src={gtpLogo} alt="GTP" className="h-9 w-9 rounded-xl object-contain" />
          <div>
            <p className="font-heading text-base font-semibold text-text-primary">Toolkit</p>
            <p className="text-xs text-brand-primary">Panel de usuario</p>
          </div>
        </div>
      </div>

      <div className="mx-4 mt-4 rounded-2xl border border-surface-border bg-bg-soft p-4">
        <p className="truncate font-medium text-text-primary text-sm">{displayName}</p>
        <p className="mt-0.5 truncate text-xs text-brand-primary">{user?.email}</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-4">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              onClick={onNavigate}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                  isActive
                    ? 'bg-brand-primary text-white'
                    : 'text-brand-primary hover:bg-bg-soft hover:text-text-primary',
                ].join(' ')
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          )
        })}

        {loading ? null : status === 'user' && (
          <>
            <div className="my-2 border-t border-surface-border" />
            <p className="mb-1 px-4 text-xs font-medium uppercase tracking-wider text-text-secondary">
              {t('dashboard.title')}
            </p>
            <Link
              to="/become-a-contributor"
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-brand-accent transition hover:bg-bg-soft hover:text-text-primary"
            >
              <Plus className="h-4 w-4 shrink-0" />
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
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-yellow-600 transition hover:bg-bg-soft hover:text-text-primary"
            >
              <Clock className="h-4 w-4 shrink-0" />
              {t('dashboard.contributorCta.pendingShort') ?? t('dashboard.contributorCta.pendingTitle')}
            </Link>
          </>
        )}

        {status === 'contributor' && (
          <>
            <div className="my-2 border-t border-surface-border" />
            <p className="mb-1 px-4 text-xs font-medium uppercase tracking-wider text-text-secondary">
              Colaborador
            </p>
            {contributorNavItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard/contributor'}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                      isActive
                        ? 'bg-brand-accent text-white'
                        : 'text-brand-primary hover:bg-bg-soft hover:text-text-primary',
                    ].join(' ')
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </NavLink>
              )
            })}
            <Link
              to="/dashboard/contributor/resources/new"
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-brand-accent transition hover:bg-bg-soft hover:text-text-primary"
            >
              <Plus className="h-4 w-4 shrink-0" />
              {t('contributorDashboard.newResource')}
            </Link>
          </>
        )}
      </nav>

      <div className="px-4 pb-6">
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-2xl border border-surface-border bg-bg-soft px-4 py-3 text-sm font-medium text-text-primary transition hover:bg-surface-hover"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
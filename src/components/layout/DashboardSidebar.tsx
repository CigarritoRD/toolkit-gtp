import { NavLink, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/auth/useAuth'

const navItems = [
  { label: 'Inicio', to: '/dashboard' },
  { label: 'Mi librería', to: '/dashboard/library' },
  { label: 'Descargas', to: '/dashboard/downloads' },
  { label: 'Perfil', to: '/dashboard/profile' },
]

type DashboardSidebarProps = {
  onNavigate?: () => void
}

export default function DashboardSidebar({
  onNavigate,
}: DashboardSidebarProps) {
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()

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
    <aside className="h-full border-r border-surface-border bg-surface/60 p-6 backdrop-blur-xl">
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
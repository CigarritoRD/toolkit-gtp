import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import DashboardSidebar from '@/components/layout/DashboardSidebar'
import ThemeToggle from '@/components/layout/ThemeToggle'
import { useAuth } from '@/auth/useAuth'

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, profile } = useAuth()

  const displayName =
    profile?.full_name?.trim() || user?.email?.split('@')[0] || 'Usuario'

  const closeMobileMenu = () => {
    setMobileOpen(false)
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary md:grid md:grid-cols-[280px_1fr]">
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 border-b border-surface-border/60 bg-bg/85 backdrop-blur-xl md:hidden">
          <div className="flex items-center justify-between px-4 py-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/15 text-brand-accent shadow-[var(--shadow-soft)]">
                <span className="font-heading text-sm font-semibold">TB</span>
              </div>

              <div>
                <p className="font-heading text-base leading-none text-text-primary">
                  Toolkit
                </p>
                <p className="mt-1 text-xs leading-none text-brand-primary">
                  {displayName}
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <ThemeToggle />

              <button
                type="button"
                onClick={() => setMobileOpen((prev) => !prev)}
                aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-surface-border bg-surface text-text-primary shadow-[var(--shadow-soft)] transition hover:bg-surface-hover"
              >
                <span className="text-lg">{mobileOpen ? '✕' : '☰'}</span>
              </button>
            </div>
          </div>

          {mobileOpen ? (
            <div className="border-t border-surface-border/60 bg-bg px-4 py-4">
              <div className="rounded-3xl overflow-hidden border border-surface-border shadow-[var(--shadow-soft)]">
                <DashboardSidebar onNavigate={closeMobileMenu} />
              </div>
            </div>
          ) : null}
        </header>

        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
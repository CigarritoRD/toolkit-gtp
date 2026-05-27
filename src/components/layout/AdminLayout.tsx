import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  ArrowLeft,
  BarChart3,
  FileSearch,
  FolderKanban,
  Grid2x2,
  LayoutDashboard,
  LogOut,
  Menu,
  Tag,
  UserCircle,
  Users,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/auth/useAuth'
import AppButton from '@/components/ui/AppButton'
import LanguageSwitcher from '@/components/layout/LanguageSwitcher'
import ThemeToggle from '@/components/layout/ThemeToggle'
import gtpLogo from '@/assets/gtp-logo.png'

type AdminNavItem = {
  label: string
  to: string
  icon: React.ComponentType<{ className?: string }>
  end?: boolean
}

function navLinkClass(isActive: boolean) {
  return [
    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
    isActive
      ? 'bg-brand-primary text-white shadow-[var(--shadow-soft)]'
      : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
  ].join(' ')
}

export default function AdminLayout() {
  const { t } = useTranslation()
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const adminNavItems: AdminNavItem[] = [
    {
      label: t('admin.nav.dashboard'),
      to: '/admin',
      icon: LayoutDashboard,
      end: true,
    },
    {
      label: t('admin.nav.contributors'),
      to: '/admin/contributors',
      icon: Users,
    },
    {
      label: t('admin.nav.applications'),
      to: '/admin/contributor-applications',
      icon: FileSearch,
    },
    {
      label: t('admin.nav.resources'),
      to: '/admin/resources',
      icon: FolderKanban,
    },
    {
      label: t('admin.nav.categories'),
      to: '/admin/categories',
      icon: Grid2x2,
    },
    {
      label: t('admin.nav.tags'),
      to: '/admin/tags',
      icon: Tag,
    },
    {
      label: t('admin.nav.metrics'),
      to: '/admin/metrics',
      icon: BarChart3,
    },
    {
      label: t('admin.nav.account'),
      to: '/admin/account',
      icon: UserCircle,
    },
  ]

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-surface-border bg-surface xl:flex xl:flex-col">
          <div className="border-b border-surface-border px-6 py-6">
            <NavLink to="/admin" className="block">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-surface-border bg-surface shadow-[var(--shadow-soft)]">
                  <img
                    src={gtpLogo}
                    alt="GTP"
                    className="h-12 w-12 object-contain"
                  />
                </div>

                <div>
                  <p className="font-heading text-[1.65rem] leading-none text-text-primary">
                    Toolkit
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-brand-primary">
                    {t('admin.layout.adminPanel')}
                  </p>
                </div>
              </div>
            </NavLink>
          </div>

          <div className="flex-1 px-4 py-6">
            <nav className="space-y-2">
              {adminNavItems.map((item) => {
                const Icon = item.icon

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) => navLinkClass(isActive)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                )
              })}
            </nav>

            <div className="mt-8 rounded-xl border border-surface-border bg-bg-soft p-4 shadow-[var(--shadow-soft)]">
              <p className="text-xs uppercase tracking-[0.2em] text-brand-primary">
                {t('admin.layout.signedInAs')}
              </p>
              <p className="mt-2 font-medium text-text-primary">
                {profile?.full_name || profile?.email || t('admin.layout.admin')}
              </p>
              <p className="mt-1 text-sm capitalize text-text-secondary">
                {profile?.role || t('admin.layout.admin')}
              </p>

              <div className="mt-4 flex items-center gap-2">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            </div>
          </div>

          <div className="border-t border-surface-border px-4 py-4">
            <div className="space-y-2">
              <NavLink
                to="/"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-surface-hover hover:text-text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('admin.layout.backToSite')}
              </NavLink>

              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-text-secondary transition hover:bg-surface-hover hover:text-text-primary"
              >
                <LogOut className="h-4 w-4" />
                {t('admin.layout.signOut')}
              </button>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="border-b border-surface-border bg-surface xl:hidden">
            <div className="flex items-center justify-between px-4 py-4 sm:px-6">
              <NavLink to="/admin" className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-surface-border bg-surface shadow-[var(--shadow-soft)]">
                  <img
                    src={gtpLogo}
                    alt="GTP"
                    className="h-10 w-10 object-contain"
                  />
                </div>

                <div>
                  <p className="font-heading text-xl leading-none text-text-primary">
                    Toolkit
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-brand-primary">
                    {t('admin.layout.adminPanel')}
                  </p>
                </div>
              </NavLink>

              <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <ThemeToggle />

                <AppButton
                  variant="secondary"
                  aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                >
                  {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </AppButton>
              </div>
            </div>

            <AnimatePresence>
              {isMenuOpen ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="overflow-hidden border-t border-surface-border px-4 py-4 sm:px-6"
                >
                  <nav className="space-y-2">
                    {adminNavItems.map((item) => {
                      const Icon = item.icon

                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          end={item.end}
                          onClick={() => setIsMenuOpen(false)}
                          className={({ isActive }) => navLinkClass(isActive)}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </NavLink>
                      )
                    })}
                  </nav>

                  <div className="mt-4 rounded-xl border border-surface-border bg-bg-soft p-4 shadow-[var(--shadow-soft)]">
                    <p className="text-xs uppercase tracking-[0.2em] text-brand-primary">
                      {t('admin.layout.signedInAs')}
                    </p>
                    <p className="mt-2 font-medium text-text-primary">
                      {profile?.full_name || profile?.email || t('admin.layout.admin')}
                    </p>
                    <p className="mt-1 text-sm capitalize text-text-secondary">
                      {profile?.role || t('admin.layout.admin')}
                    </p>

                    <div className="mt-4 flex items-center gap-2">
                      <LanguageSwitcher />
                      <ThemeToggle />
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 border-t border-surface-border pt-4">
                    <NavLink
                      to="/"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-surface-hover hover:text-text-primary"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      {t('admin.layout.backToSite')}
                    </NavLink>

                    <button
                      type="button"
                      onClick={() => void handleSignOut()}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-text-secondary transition hover:bg-surface-hover hover:text-text-primary"
                    >
                      <LogOut className="h-4 w-4" />
                      {t('admin.layout.signOut')}
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </header>

          <main className="flex-1 px-4 py-4 sm:px-6 lg:px-8">
            <Outlet />
          </main>

          <footer className="border-t border-surface-border bg-surface">
            <div className="flex flex-col gap-2 px-6 py-4 text-sm text-text-secondary md:flex-row md:items-center md:justify-between">
              <p>{t('admin.layout.footerTitle')}</p>
              <p>{t('admin.layout.footerBody')}</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
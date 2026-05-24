import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  LayoutDashboard,
  Library,
  LogOut,
  Shield,
  UserPlus,
  User,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import LanguageSwitcher from '@/components/layout/LanguageSwitcher'
import ThemeToggle from '@/components/layout/ThemeToggle'
import { useAuth } from '@/auth/useAuth'
import gtpLogo from '@/assets/gtp-logo.png'

export default function PublicNavbar() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user, profile, signOut, loading } = useAuth()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  const displayName =
    profile?.full_name?.trim() || user?.email?.split('@')[0] || 'Usuario'

  const initials = displayName.trim().slice(0, 1).toUpperCase()
  const avatarUrl = profile?.avatar_url ?? ''

  const isAuthenticated = !!user
  const isAdmin = profile?.role === 'admin'

  const navItems = useMemo(
    () => [
      { label: t('nav.resources'), to: '/resources' },
      { label: t('nav.contributors'), to: '/contributors' },
    ],
    [t],
  )

  const closeMobileMenu = () => {
    setMobileOpen(false)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success(t('nav.logout'))
      setMenuOpen(false)
      closeMobileMenu()
      navigate('/')
    } catch (error) {
      console.error(error)
      toast.error('No se pudo cerrar sesión.')
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-50 border-b border-surface-border/70 bg-bg shadow-[var(--shadow-soft)] backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-10 lg:px-16">
        <Link to="/" className="flex items-center gap-3" onClick={closeMobileMenu}>
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-surface-border bg-surface shadow-[var(--shadow-soft)]">
            <img
              src={gtpLogo}
              alt="GTP"
              className="h-12 w-12 object-contain"
            />
          </div>

          <div className="min-w-0">
            <p className="font-heading text-gl leading-none text-text-primary">
              Toolkit
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-brand-primary">
              by GTP
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'text-sm font-medium transition',
                  isActive
                    ? 'text-text-primary'
                    : 'text-brand-primary hover:text-text-primary',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {!isAdmin ? (
            <Link
              to="/become-a-contributor"
              className="inline-flex items-center gap-2 rounded-xl border border-surface-border bg-surface px-4 py-2 text-sm font-semibold text-text-primary transition hover:bg-surface-hover"
            >
              <UserPlus className="h-4 w-4 text-brand-primary" />
              {t('nav.becomeContributor')}
            </Link>
          ) : null}

          <LanguageSwitcher />
          <ThemeToggle />

          {loading ? (
            <div className="rounded-xl border border-surface-border bg-surface px-4 py-2 text-sm text-brand-primary">
              {t('common.loading')}
            </div>
          ) : !isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="rounded-xl border border-surface-border bg-surface px-4 py-2 text-sm font-semibold text-text-primary transition hover:bg-surface-hover"
              >
                {t('nav.login')}
              </Link>

              <Link
                to="/register"
                className="inline-flex rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                {t('nav.register')}
              </Link>
            </>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="inline-flex items-center gap-3 rounded-xl border border-surface-border bg-surface px-3 py-2 text-sm text-text-primary shadow-[var(--shadow-soft)] transition hover:bg-surface-hover"
              >
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-brand-primary/15 text-xs font-semibold text-brand-primary">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>

                <div className="hidden text-left lg:block">
                  <p className="max-w-[140px] truncate text-sm font-medium text-text-primary">
                    {displayName}
                  </p>
                  <p className="text-xs text-brand-primary">
                    {isAdmin ? t('nav.admin') : t('nav.profile')}
                  </p>
                </div>

                <ChevronDown
                  className={`h-4 w-4 text-brand-primary transition ${menuOpen ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {menuOpen ? (
                <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-surface-border bg-bg-soft shadow-[var(--shadow-card)]">
                  <div className="border-b border-surface-border px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-brand-primary/15 text-sm font-semibold text-brand-primary">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={displayName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          initials
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-medium text-text-primary">
                          {displayName}
                        </p>
                        <p className="truncate text-sm text-brand-primary">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    {isAdmin ? (
                      <Link
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-text-primary transition hover:bg-surface-hover"
                      >
                        <Shield className="h-4 w-4 text-brand-primary" />
                        {t('nav.admin')}
                      </Link>
                    ) : (
                      <>
                        <Link
                          to="/dashboard"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-text-primary transition hover:bg-surface-hover"
                        >
                          <LayoutDashboard className="h-4 w-4 text-brand-primary" />
                          {t('nav.dashboard')}
                        </Link>

                        <Link
                          to="/dashboard/library"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-text-primary transition hover:bg-surface-hover"
                        >
                          <Library className="h-4 w-4 text-brand-primary" />
                          {t('nav.library')}
                        </Link>

                        <Link
                          to="/dashboard/profile"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-text-primary transition hover:bg-surface-hover"
                        >
                          <User className="h-4 w-4 text-brand-primary" />
                          {t('nav.profile')}
                        </Link>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-text-primary transition hover:bg-surface-hover"
                    >
                      <LogOut className="h-4 w-4 text-brand-primary" />
                      {t('nav.logout')}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <ThemeToggle />

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-surface-border bg-surface text-text-primary shadow-[var(--shadow-soft)] transition hover:bg-surface-hover"
          >
            <span className="text-lg">{mobileOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-surface-border/70 bg-bg/95 px-6 py-5 shadow-[var(--shadow-soft)] md:hidden">
          <div className="mx-auto max-w-6xl">
            {loading ? (
              <div className="rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm text-brand-primary">
                {t('common.loading')}
              </div>
            ) : (
              <>
                {!isAdmin ? (
                  <Link
                    to="/become-a-contributor"
                    onClick={closeMobileMenu}
                    className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm font-semibold text-text-primary transition hover:bg-surface-hover"
                  >
                    <UserPlus className="h-4 w-4 text-brand-primary" />
                    {t('nav.becomeContributor')}
                  </Link>
                ) : null}

                {isAuthenticated ? (
                  <div className="mb-4 rounded-xl border border-surface-border bg-surface p-4 shadow-[var(--shadow-soft)]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-brand-primary/15 text-sm font-semibold text-brand-primary">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={displayName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          initials
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-medium text-text-primary">
                          {displayName}
                        </p>
                        <p className="truncate text-sm text-brand-primary">
                          {user?.email}
                        </p>
                      </div>
                    </div>

                    {isAdmin ? (
                      <p className="mt-3 text-xs uppercase tracking-[0.2em] text-brand-primary">
                        {t('nav.admin')}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={closeMobileMenu}
                      className={({ isActive }) =>
                        [
                          'rounded-xl px-4 py-3 text-sm font-medium transition',
                          isActive
                            ? 'bg-brand-primary text-white'
                            : 'border border-surface-border bg-surface text-text-primary hover:bg-surface-hover',
                        ].join(' ')
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </nav>

                <div className="mt-4 flex flex-col gap-2">
                  {!isAuthenticated ? (
                    <>
                      <Link
                        to="/login"
                        onClick={closeMobileMenu}
                        className="rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm font-semibold text-text-primary transition hover:bg-surface-hover"
                      >
                        {t('nav.login')}
                      </Link>

                      <Link
                        to="/register"
                        onClick={closeMobileMenu}
                        className="rounded-xl bg-brand-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                      >
                        {t('nav.register')}
                      </Link>
                    </>
                  ) : isAdmin ? (
                    <>
                      <Link
                        to="/admin"
                        onClick={closeMobileMenu}
                        className="rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm font-semibold text-text-primary transition hover:bg-surface-hover"
                      >
                        {t('nav.openAdmin')}
                      </Link>

                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="rounded-xl bg-brand-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                      >
                        {t('nav.logout')}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/dashboard"
                        onClick={closeMobileMenu}
                        className="rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm font-semibold text-text-primary transition hover:bg-surface-hover"
                      >
                        {t('nav.openDashboard')}
                      </Link>

                      <Link
                        to="/dashboard/library"
                        onClick={closeMobileMenu}
                        className="rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm font-semibold text-text-primary transition hover:bg-surface-hover"
                      >
                        {t('nav.library')}
                      </Link>

                      <Link
                        to="/dashboard/profile"
                        onClick={closeMobileMenu}
                        className="rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm font-semibold text-text-primary transition hover:bg-surface-hover"
                      >
                        {t('nav.profile')}
                      </Link>

                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="rounded-xl bg-brand-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                      >
                        {t('nav.logout')}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  )
}
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/auth/useAuth'
import SectionCard from '@/components/ui/SectionCard'
import ChangePasswordForm from '@/components/account/ChangePasswordForm'

export default function AdminAccountPage() {
  const { t } = useTranslation()
  const { user, profile } = useAuth()

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.22em] text-brand-primary">
          {t('admin.account.badge')}
        </p>
        <h1 className="mt-2 font-heading text-3xl md:text-4xl">
          {t('admin.account.title')}
        </h1>
        <p className="mt-3 text-sm text-text-secondary">
          {t('admin.account.subtitle')}
        </p>
      </div>

      <SectionCard className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium text-text-primary">
              {t('profile.fullName')}
            </p>
            <div className="rounded-2xl border border-surface-border bg-bg-soft px-4 py-3 text-sm text-text-primary">
              {profile?.full_name || '—'}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-text-primary">
              {t('profile.email')}
            </p>
            <div className="rounded-2xl border border-surface-border bg-bg-soft px-4 py-3 text-sm text-text-primary">
              {user?.email || '—'}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-text-primary">
              {t('profile.country')}
            </p>
            <div className="rounded-2xl border border-surface-border bg-bg-soft px-4 py-3 text-sm text-text-primary">
              {profile?.country || '—'}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-text-primary">
              {t('profile.accountStatus')}
            </p>
            <div className="rounded-2xl border border-surface-border bg-bg-soft px-4 py-3 text-sm capitalize text-text-primary">
              {profile?.role || '—'}
            </div>
          </div>
        </div>
      </SectionCard>

      <ChangePasswordForm />
    </div>
  )
}
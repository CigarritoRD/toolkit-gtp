import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/auth/useAuth'
import { getMyContributorProfile } from '@/lib/api/contributor-dashboard'
import SectionCard from '@/components/ui/SectionCard'
import AppButton from '@/components/ui/AppButton'
import { LoadingState } from '@/components/ui/Skeleton'

export default function ContributorHomePage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [hasProfile, setHasProfile] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkContributor() {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        const contributor = await getMyContributorProfile(user.id)
        setHasProfile(!!contributor)
      } catch {
        setHasProfile(false)
      } finally {
        setLoading(false)
      }
    }

    void checkContributor()
  }, [user?.id])

  if (loading) {
    return <LoadingState variant="section" text={t('loading.panel')} />
  }

  if (!hasProfile) {
    return (
      <div className="space-y-6">
        <SectionCard className="p-8 text-center">
          <p className="text-lg font-medium text-text-primary">
            {t('contributorDashboard.notContributorTitle')}
          </p>
          <p className="mt-2 text-sm text-brand-primary">
            {t('contributorDashboard.notContributorBody')}
          </p>
          <AppButton
            className="mt-4"
            onClick={() => navigate('/become-a-contributor')}
          >
            {t('contributorDashboard.applyToBecome')}
          </AppButton>
        </SectionCard>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.22em] text-brand-primary">
          {t('contributorDashboard.badge')}
        </p>
        <h1 className="mt-2 font-heading text-3xl md:text-4xl">
          {t('contributorDashboard.title')}
        </h1>
        <p className="mt-3 text-sm text-text-secondary">
          {t('contributorDashboard.subtitle')}
        </p>
      </div>

      <SectionCard className="flex flex-col gap-4 border-2 border-brand-accent/30 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-accent/10">
            <svg className="h-5 w-5 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="font-heading text-lg text-text-primary">
              {t('contributorDashboard.badge')}
            </h3>
            <p className="mt-1 text-sm text-brand-primary">
              {t('contributorDashboard.subtitle')}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <AppButton variant="secondary" onClick={() => navigate('/dashboard/contributor/profile')}>
            {t('contributorDashboard.myProfile')}
          </AppButton>
          <AppButton onClick={() => navigate('/dashboard/contributor/resources/new')}>
            {t('contributorDashboard.newResource')}
          </AppButton>
        </div>
      </SectionCard>

      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard
          className="cursor-pointer p-6 transition hover:border-brand-accent"
          onClick={() => navigate('/dashboard/contributor/profile')}
        >
          <h2 className="font-heading text-lg text-text-primary">
            {t('contributorDashboard.myProfile')}
          </h2>
          <p className="mt-2 text-sm text-brand-primary">
            {t('contributorDashboard.myProfileDesc')}
          </p>
        </SectionCard>

        <SectionCard
          className="cursor-pointer p-6 transition hover:border-brand-accent"
          onClick={() => navigate('/dashboard/contributor/resources')}
        >
          <h2 className="font-heading text-lg text-text-primary">
            {t('contributorDashboard.myResources')}
          </h2>
          <p className="mt-2 text-sm text-brand-primary">
            {t('contributorDashboard.myResourcesDesc')}
          </p>
        </SectionCard>
      </div>
    </div>
  )
}
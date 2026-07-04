import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Bookmark, CheckCircle2, Clock, Download, Heart, UserPlus, XCircle } from 'lucide-react'
import ResourceCard from '@/components/resources/ResourceCard'
import EmptyState from '@/components/ui/EmptyState'
import SectionCard from '@/components/ui/SectionCard'
import StatCard from '@/components/ui/StatCard'
import AppButton from '@/components/ui/AppButton'
import {
  getDashboardStats,
  getRecentDownloads,
  getRecentLibraryResources,
  type DashboardStats,
} from '@/lib/api/dashboard'
import { getResourceRatingSummaries } from '@/lib/api/ratings'
import { useAuth } from '@/auth/useAuth'
import { useTranslation } from 'react-i18next'
import { useContributorStatus } from '@/hooks/useContributorStatus'
import type { ResourceListItem } from '@/types/resources'

type RatingMap = Map<
  string,
  {
    average_rating: number
    total_ratings: number
  }
>

function normalizeResource(resource: unknown): ResourceListItem {
  const r = resource as Record<string, unknown>
  return {
    ...(r as Record<string, unknown>),
    title: (r?.title as string) ?? (r?.resource as Record<string, unknown>)?.title as string ?? '',
    slug: (r?.slug as string) ?? (r?.resource as Record<string, unknown>)?.slug as string ?? '',
    description:
      (r?.description as string) ??
      (r?.resource as Record<string, unknown>)?.description as string ??
      null,
    short_description:
      (r?.short_description as string) ??
      (r?.resource as Record<string, unknown>)?.short_description as string ??
      null,
    thumbnail_url:
      (r?.thumbnail_url as string) ??
      (r?.resource as Record<string, unknown>)?.thumbnail_url as string ??
      null,
    resource_type:
      (r?.resource_type as string) ??
      (r?.resource as Record<string, unknown>)?.resource_type as string ??
      'resource',
    contributor:
      (r?.contributor as ResourceListItem['contributor']) ??
      (r?.resource as Record<string, unknown>)?.contributor as ResourceListItem['contributor'] ??
      null,
  } as ResourceListItem
}

export default function DashboardHomePage() {
  const { user, profile } = useAuth()
  const { t } = useTranslation()
  const { status, latestApplication } = useContributorStatus()

  const [stats, setStats] = useState<DashboardStats>({
    savedCount: 0,
    favoriteCount: 0,
    downloadCount: 0,
  })
  const [recentLibrary, setRecentLibrary] = useState<ResourceListItem[]>([])
  const [recentDownloads, setRecentDownloads] = useState<ResourceListItem[]>([])
  const [resourceRatings, setResourceRatings] = useState<RatingMap>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const loadDashboard = async () => {
      if (!user) return

      try {
        setLoading(true)
        setError(null)

        const [statsData, libraryData, downloadData] = await Promise.all([
          getDashboardStats(user.id),
          getRecentLibraryResources(user.id),
          getRecentDownloads(user.id),
        ])

        if (!active) return

        const normalizedLibrary = (libraryData ?? []).map(normalizeResource)
        const normalizedDownloads = (downloadData ?? []).map(normalizeResource)

        setStats(statsData)
        setRecentLibrary(normalizedLibrary)
        setRecentDownloads(normalizedDownloads)

        const allResourceIds = Array.from(
          new Set(
            [...normalizedLibrary, ...normalizedDownloads]
              .map((resource) => resource.id)
              .filter(Boolean),
          ),
        )

        const ratingsMap = await getResourceRatingSummaries(allResourceIds)

        if (!active) return
        setResourceRatings(ratingsMap)
      } catch (err) {
        if (!active) return
        const message =
          err instanceof Error ? err.message : t('dashboardHome.errorFallback')
        setError(message)
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadDashboard()

    return () => {
      active = false
    }
  }, [user, t])

  return (
    <div className="bg-bg text-text-primary">
      <section className="py-2">
        <SectionCard className="p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-brand-primary">
                {t('dashboardHome.badge')}
              </p>
              <h1 className="mt-3 font-heading text-4xl md:text-5xl">
                {t('dashboardHome.greeting')}{profile?.full_name ? `, ${profile.full_name}` : ''}
              </h1>
              <p className="mt-4 max-w-2xl font-body text-lg text-brand-primary">
                {t('dashboardHome.subtitle')}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/resources"
                className="inline-flex items-center gap-2 rounded-2xl bg-brand-primary px-5 py-3 font-medium text-white transition hover:opacity-90"
              >
                {t('dashboardHome.exploreResources')}
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/dashboard/library"
                className="rounded-2xl border border-surface-border bg-bg-soft px-5 py-3 font-medium text-text-primary transition hover:bg-surface-hover"
              >
                {t('dashboardHome.viewLibrary')}
              </Link>
            </div>
          </div>
        </SectionCard>
      </section>

      <section className="py-8">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-3xl border border-surface-border bg-surface p-6"
              >
                <div className="h-4 w-24 rounded bg-bg-soft" />
                <div className="mt-4 h-10 w-16 rounded bg-bg-soft" />
                <div className="mt-4 h-4 w-32 rounded bg-bg-soft" />
              </div>
            ))}
          </div>
        ) : error ? (
          <SectionCard className="border-red-500/20 bg-red-500/10 p-6">
            <h2 className="font-heading text-xl">{t('dashboardHome.errorTitle')}</h2>
            <p className="mt-2 text-sm text-brand-primary">{error}</p>
          </SectionCard>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            <StatCard
              label={t('dashboardHome.saved')}
              value={stats.savedCount}
              icon={<Bookmark className="h-4 w-4" />}
            />
            <StatCard
              label={t('dashboardHome.favorites')}
              value={stats.favoriteCount}
              icon={<Heart className="h-4 w-4" />}
            />
            <StatCard
              label={t('dashboardHome.downloads')}
              value={stats.downloadCount}
              icon={<Download className="h-4 w-4" />}
            />
          </div>
        )}
      </section>

      {status === 'pending' && (
        <section className="py-8">
          <SectionCard className="flex flex-col gap-4 border-2 border-yellow-200/50 bg-yellow-50/50 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-100">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-heading text-lg text-text-primary">
                  {t('dashboard.contributorCta.pendingTitle')}
                </h3>
                <p className="mt-1 text-sm text-brand-primary">
                  {t('dashboard.contributorCta.pendingBody')}
                </p>
                {latestApplication?.admin_notes && (
                  <p className="mt-2 rounded-lg bg-surface px-4 py-3 text-sm text-brand-primary">
                    <strong>{t('contributorApply.adminFeedback')}:</strong> {latestApplication.admin_notes}
                  </p>
                )}
              </div>
            </div>
            <Link to="/become-a-contributor">
              <AppButton variant="secondary" className="shrink-0">
                {t('common.viewAll')}
              </AppButton>
            </Link>
          </SectionCard>
        </section>
      )}

      {status === 'rejected' && (
        <section className="py-8">
          <SectionCard className="flex flex-col gap-4 border-2 border-red-200/50 bg-red-50/50 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-heading text-lg text-text-primary">
                  {t('dashboard.contributorCta.rejectedTitle')}
                </h3>
                <p className="mt-1 text-sm text-brand-primary">
                  {t('dashboard.contributorCta.rejectedBody')}
                </p>
                {latestApplication?.admin_notes && (
                  <p className="mt-2 rounded-lg bg-surface px-4 py-3 text-sm text-brand-primary">
                    <strong>{t('contributorApply.adminFeedback')}:</strong> {latestApplication.admin_notes}
                  </p>
                )}
              </div>
            </div>
            <Link to="/become-a-contributor">
              <AppButton className="shrink-0">
                {t('dashboard.contributorCta.reSubmitButton')}
              </AppButton>
            </Link>
          </SectionCard>
        </section>
      )}

      {status === 'contributor' && (
        <section className="py-8">
          <SectionCard className="flex flex-col gap-4 border-2 border-brand-accent/30 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-accent/10">
                <CheckCircle2 className="h-5 w-5 text-brand-accent" />
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
              <Link to="/dashboard/contributor/profile">
                <AppButton variant="secondary">
                  {t('contributorDashboard.myProfile')}
                </AppButton>
              </Link>
              <Link to="/dashboard/contributor/resources">
                <AppButton variant="secondary">
                  {t('contributorDashboard.myResources')}
                </AppButton>
              </Link>
              <Link to="/dashboard/contributor/resources/new">
                <AppButton>
                  {t('contributorDashboard.newResource')}
                </AppButton>
              </Link>
            </div>
          </SectionCard>
        </section>
      )}

      {status === 'user' && (
        <section className="py-8">
          <SectionCard className="flex flex-col gap-4 border-2 border-brand-accent/30 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-accent/10">
                <UserPlus className="h-5 w-5 text-brand-accent" />
              </div>
              <div>
                <h3 className="font-heading text-lg text-text-primary">
                  {t('dashboard.contributorCta.title')}
                </h3>
                <p className="mt-1 text-sm text-brand-primary">
                  {t('dashboard.contributorCta.body')}
                </p>
              </div>
            </div>
            <Link to="/become-a-contributor">
              <AppButton className="shrink-0">
                {t('dashboard.contributorCta.button')}
              </AppButton>
            </Link>
          </SectionCard>
        </section>
      )}

      <section className="py-4">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-brand-primary">
              {t('dashboardHome.yourActivity')}
            </p>
            <h2 className="mt-2 font-heading text-3xl">{t('dashboardHome.recentResources')}</h2>
          </div>
          <Link to="/dashboard/library" className="text-sm text-brand-accent">
            {t('dashboardHome.viewAll')}
          </Link>
        </div>

        {recentLibrary.length === 0 ? (
          <EmptyState
            icon={<UserPlus className="h-5 w-5" />}
            title={t('dashboardHome.emptyLibraryTitle')}
            description={t('dashboardHome.emptyLibraryBody')}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {recentLibrary.map((resource) => (
              <div key={resource.id} className="transition-transform duration-200 hover:-translate-y-1">
                <ResourceCard
                  id={resource.id}
                  title={resource.title}
                  description={resource.short_description || resource.description}
                  thumbnailUrl={resource.thumbnail_url}
                  type={resource.resource_type}
                  contributorName={resource.contributor?.name ?? null}
                  slug={resource.slug}
                  averageRating={
                    resourceRatings.get(resource.id)?.average_rating ?? 0
                  }
                  totalRatings={
                    resourceRatings.get(resource.id)?.total_ratings ?? 0
                  }
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="py-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-brand-primary">
              {t('dashboardHome.history')}
            </p>
            <h2 className="mt-2 font-heading text-3xl">{t('dashboardHome.recentDownloads')}</h2>
          </div>
          <Link to="/dashboard/downloads" className="text-sm text-brand-accent">
            {t('dashboardHome.viewDownloads')}
          </Link>
        </div>

        {recentDownloads.length === 0 ? (
          <EmptyState
            icon={<Download className="h-5 w-5" />}
            title={t('dashboardHome.emptyDownloadsTitle')}
            description={t('dashboardHome.emptyDownloadsBody')}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {recentDownloads.map((resource) => (
              <div key={resource.id} className="transition-transform duration-200 hover:-translate-y-1">
                <ResourceCard
                  id={resource.id}
                  title={resource.title}
                  description={resource.short_description || resource.description}
                  thumbnailUrl={resource.thumbnail_url}
                  type={resource.resource_type}
                  contributorName={resource.contributor?.name ?? null}
                  slug={resource.slug}
                  averageRating={
                    resourceRatings.get(resource.id)?.average_rating ?? 0
                  }
                  totalRatings={
                    resourceRatings.get(resource.id)?.total_ratings ?? 0
                  }
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import CountryFlag from '@/components/ui/CountryFlag'
import { getCountryLabel } from '@/lib/constants/countries'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import {
  BarChart3,
  FileSearch,
  FolderKanban,
  Grid2x2,
  ShieldCheck,
  TrendingUp,
  Users,
  Star,
  Globe2,
  Clock,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  getRecentContributors,
  getRecentResources,
  type AdminRecentContributor,
  type AdminRecentResource,
} from '@/lib/api/admin'
import {
  getContributorApplications,
  type ContributorApplicationRecord,
} from '@/lib/api/contributor-applications-admin'
import {
  getAdminOverview,
  getResourceEventsByCountry,
  getTopContributorsByViews,
  getTopRatedContributors,
  getTopRatedResources,
  getTopResources,
  type AdminOverviewMetric,
  type ContributorRatingMetric,
  type CountryMetric,
  type ResourceRatingMetric,
  type TopContributorMetric,
  type TopResourceMetric,
} from '@/lib/api/analytics'
import { getPendingReviewResources } from '@/lib/api/resources'
import AppButton from '@/components/ui/AppButton'
import EmptyState from '@/components/ui/EmptyState'
import SectionCard from '@/components/ui/SectionCard'
import StatusBadge from '@/components/ui/StatusBadge'
import RatingSummaryBadge from '@/components/ratings/RatingSummaryBadge'
import {
  getCachedAdminData,
  setCachedAdminData,
} from '@/lib/adminCache'

const CACHE_KEY = 'admin:dashboard'
const CACHE_TTL = 60_000

type DashboardCache = {
  overview: AdminOverviewMetric | null
  recentContributors: AdminRecentContributor[]
  recentResources: AdminRecentResource[]
  pendingApplications: ContributorApplicationRecord[]
  pendingResources: ResourceListItem[]
  topResources: TopResourceMetric[]
  topContributors: TopContributorMetric[]
  countryMetrics: CountryMetric[]
  topRatedResources: ResourceRatingMetric[]
  topRatedContributors: ContributorRatingMetric[]
}

type ResourceListItem = {
  id: string
  title: string
  slug: string
  short_description?: string | null
  thumbnail_url?: string | null
  resource_type?: string | null
  contributor_id: string
  category_id?: string
  is_featured?: boolean
  is_public?: boolean
  is_published?: boolean
  approval_status?: string | null
  created_at: string
  contributor?: {
    id: string
    name: string
    slug: string
  } | null
}

export default function AdminDashboardPage() {
  const { t } = useTranslation()

  const cached = getCachedAdminData<DashboardCache>(CACHE_KEY)

  const [overview, setOverview] = useState<AdminOverviewMetric | null>(
    cached?.overview ?? null,
  )
  const [recentContributors, setRecentContributors] = useState<
    AdminRecentContributor[]
  >(cached?.recentContributors ?? [])
  const [recentResources, setRecentResources] = useState<AdminRecentResource[]>(
    cached?.recentResources ?? [],
  )
  const [pendingApplications, setPendingApplications] = useState<
    ContributorApplicationRecord[]
  >(cached?.pendingApplications ?? [])
  const [pendingResources, setPendingResources] = useState<ResourceListItem[]>(
    cached?.pendingResources ?? [],
  )
  const [topResources, setTopResources] = useState<TopResourceMetric[]>(
    cached?.topResources ?? [],
  )
  const [topContributors, setTopContributors] = useState<TopContributorMetric[]>(
    cached?.topContributors ?? [],
  )
  const [countryMetrics, setCountryMetrics] = useState<CountryMetric[]>(
    cached?.countryMetrics ?? [],
  )
  const [topRatedResources, setTopRatedResources] = useState<ResourceRatingMetric[]>(
    cached?.topRatedResources ?? [],
  )
  const [topRatedContributors, setTopRatedContributors] = useState<
    ContributorRatingMetric[]
  >(cached?.topRatedContributors ?? [])
  const [loading, setLoading] = useState(() => !getCachedAdminData(CACHE_KEY))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDashboard() {
      try {
        setError(null)

        const [
          overviewData,
          contributorsData,
          resourcesData,
          applicationsData,
          pendingResourcesData,
          topResourcesData,
          topContributorsData,
          countryMetricsData,
          topRatedResourcesData,
          topRatedContributorsData,
        ] = await Promise.all([
          getAdminOverview(),
          getRecentContributors(5),
          getRecentResources(5),
          getContributorApplications('pending_review'),
          getPendingReviewResources(),
          getTopResources(5),
          getTopContributorsByViews(5),
          getResourceEventsByCountry(10),
          getTopRatedResources(5),
          getTopRatedContributors(5),
        ])

        const dashboardData: DashboardCache = {
          overview: overviewData,
          recentContributors: contributorsData,
          recentResources: resourcesData,
          pendingApplications: applicationsData.slice(0, 5),
          pendingResources: (pendingResourcesData ?? []).slice(0, 5) as unknown as ResourceListItem[],
          topResources: topResourcesData,
          topContributors: topContributorsData,
          countryMetrics: countryMetricsData,
          topRatedResources: topRatedResourcesData,
          topRatedContributors: topRatedContributorsData,
        }

        setOverview(overviewData)
        setRecentContributors(contributorsData)
        setRecentResources(resourcesData)
        setPendingApplications(applicationsData.slice(0, 5))
        setPendingResources((pendingResourcesData ?? []).slice(0, 5) as unknown as ResourceListItem[])
        setTopResources(topResourcesData)
        setTopContributors(topContributorsData)
        setCountryMetrics(countryMetricsData)
        setTopRatedResources(topRatedResourcesData)
        setTopRatedContributors(topRatedContributorsData)

        setCachedAdminData(CACHE_KEY, dashboardData, CACHE_TTL)
      } catch (err) {
        setError(err instanceof Error ? err.message : t('admin.dashboard.error'))
      } finally {
        setLoading(false)
      }
    }

    void loadDashboard()
  }, [t])

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionCard className="p-6">
          <p className="text-sm text-text-secondary">{t('common.loading')}</p>
        </SectionCard>
      </div>
    )
  }

  if (error || !overview) {
    return (
      <div className="space-y-6">
        <SectionCard className="border-red-200 bg-red-50 p-6">
          <h1 className="text-lg font-semibold text-red-700">
            {t('admin.dashboard.errorTitle')}
          </h1>
          <p className="mt-2 text-sm text-red-600">
            {error ?? t('admin.dashboard.error')}
          </p>
        </SectionCard>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-brand-primary">
            {t('admin.dashboard.badge')}
          </p>
          <h1 className="mt-2 font-heading text-3xl md:text-4xl">
            {t('admin.dashboard.title')}
          </h1>
          <p className="mt-3 text-sm text-text-secondary">
            {t('admin.dashboard.subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/admin/contributor-applications">
            <AppButton variant="secondary">
              {t('admin.dashboard.reviewApplications')}
            </AppButton>
          </Link>
          <Link to="/admin/resources/new">
            <AppButton>{t('admin.dashboard.newResource')}</AppButton>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label={t('admin.dashboard.contributors')}
          value={overview.total_contributors}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label={t('admin.dashboard.activeContributors')}
          value={overview.active_contributors}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label={t('admin.dashboard.resources')}
          value={overview.total_resources}
          icon={<FolderKanban className="h-4 w-4" />}
        />
        <StatCard
          label={t('admin.dashboard.published')}
          value={overview.published_resources}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          label={t('admin.dashboard.downloads')}
          value={overview.total_downloads}
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <QuickActionCard
          icon={<FileSearch className="h-5 w-5" />}
          title={t('admin.dashboard.qaApplicationsTitle')}
          description={t('admin.dashboard.qaApplicationsBody')}
          to="/admin/contributor-applications"
          actionLabel={t('admin.dashboard.qaApplicationsAction')}
        />

        <QuickActionCard
          icon={<Users className="h-5 w-5" />}
          title={t('admin.dashboard.qaContributorsTitle')}
          description={t('admin.dashboard.qaContributorsBody')}
          to="/admin/contributors/new"
          actionLabel={t('admin.dashboard.qaContributorsAction')}
        />

        <QuickActionCard
          icon={<FolderKanban className="h-5 w-5" />}
          title={t('admin.dashboard.qaResourcesTitle')}
          description={t('admin.dashboard.qaResourcesBody')}
          to="/admin/resources/new"
          actionLabel={t('admin.dashboard.qaResourcesAction')}
        />

        <QuickActionCard
          icon={<Grid2x2 className="h-5 w-5" />}
          title={t('admin.dashboard.qaCategoriesTitle')}
          description={t('admin.dashboard.qaCategoriesBody')}
          to="/admin/categories"
          actionLabel={t('admin.dashboard.qaCategoriesAction')}
        />

        <QuickActionCard
          icon={<BarChart3 className="h-5 w-5" />}
          title={t('admin.dashboard.qaMetricsTitle')}
          description={t('admin.dashboard.qaMetricsBody')}
          to="/admin/metrics"
          actionLabel={t('admin.dashboard.qaMetricsAction')}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SectionCard className="overflow-hidden xl:col-span-1">
          <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
            <div>
              <h2 className="font-heading text-lg text-text-primary">
                {t('admin.dashboard.pendingTitle')}
              </h2>
              <p className="text-sm text-text-secondary">
                {t('admin.dashboard.pendingSubtitle')}
              </p>
            </div>

            <Link to="/admin/contributor-applications">
              <AppButton variant="ghost">{t('common.viewAll')}</AppButton>
            </Link>
          </div>

          <div className="divide-y divide-surface-border">
            {pendingApplications.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  icon={<ShieldCheck className="h-5 w-5" />}
                  title={t('admin.dashboard.noPendingTitle')}
                  description={t('admin.dashboard.noPendingBody')}
                />
              </div>
            ) : (
              pendingApplications.map((item) => {
                const displayName =
                  item.organization_name ||
                  item.full_name ||
                  t('admin.dashboard.unnamed')

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 px-5 py-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-text-primary">
                        {displayName}
                      </p>

                      <p className="truncate text-sm text-text-secondary">
                        {t('admin.dashboard.contact')}:{' '}
                        {item.contact_name || t('admin.dashboard.notAvailable')}
                        {item.contact_role ? ` • ${item.contact_role}` : ''}
                      </p>

                      <p className="mt-1 text-xs text-text-secondary">
                        {item.contact_email || t('admin.dashboard.notAvailable')}
                        {item.country ? ` · ${getCountryLabel(item.country)}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge label={t('admin.dashboard.pending')} tone="warning" />

                      <Link to={`/admin/contributor-applications/${item.id}`}>
                        <AppButton variant="secondary">
                          {t('common.review')}
                        </AppButton>
                      </Link>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </SectionCard>

        <SectionCard className="overflow-hidden xl:col-span-1">
          <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
            <div>
              <h2 className="font-heading text-lg text-text-primary">
                {t('admin.dashboard.pendingResourcesTitle')}
              </h2>
              <p className="text-sm text-text-secondary">
                {t('admin.dashboard.pendingResourcesSubtitle')}
              </p>
            </div>

            <Link to="/admin/resources?filter=pending_review">
              <AppButton variant="ghost">{t('common.viewAll')}</AppButton>
            </Link>
          </div>

          <div className="divide-y divide-surface-border">
            {pendingResources.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  icon={<Clock className="h-5 w-5" />}
                  title={t('admin.dashboard.noPendingResourcesTitle')}
                  description={t('admin.dashboard.noPendingResourcesBody')}
                />
              </div>
            ) : (
              pendingResources.map((item) => {
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 px-5 py-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-text-primary">
                        {item.title}
                      </p>
                      <p className="truncate text-sm text-text-secondary">
                        {item.contributor?.name ?? t('admin.dashboard.noContributor')} ·{' '}
                        {item.resource_type ?? t('admin.dashboard.noType')}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge label={t('admin.resources.statusPending')} tone="warning" />
                      <Link to={`/admin/resources/${item.id}/edit`}>
                        <AppButton variant="secondary">
                          {t('common.review')}
                        </AppButton>
                      </Link>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </SectionCard>

        <SectionCard className="overflow-hidden xl:col-span-1">
          <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
            <div>
              <h2 className="font-heading text-lg text-text-primary">
                {t('admin.dashboard.recentContributorsTitle')}
              </h2>
              <p className="text-sm text-text-secondary">
                {t('admin.dashboard.recentContributorsSubtitle')}
              </p>
            </div>

            <Link to="/admin/contributors">
              <AppButton variant="ghost">{t('common.viewAll')}</AppButton>
            </Link>
          </div>

          <div className="divide-y divide-surface-border">
            {recentContributors.length === 0 ? (
              <div className="px-5 py-8 text-sm text-text-secondary">
                {t('admin.dashboard.noContributors')}
              </div>
            ) : (
              recentContributors.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {item.avatar_url ? (
                      <img
                        src={item.avatar_url}
                        alt={item.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-surface-border bg-bg-soft text-sm font-medium text-text-secondary">
                        {item.name.slice(0, 1).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate font-medium text-text-primary">
                        {item.name}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {item.specialty ?? t('admin.dashboard.noSpecialty')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge
                      label={
                        item.is_active
                          ? t('admin.dashboard.active')
                          : t('admin.dashboard.inactive')
                      }
                      tone={item.is_active ? 'success' : 'muted'}
                    />

                    <Link to={`/admin/contributors/${item.id}/edit`}>
                      <AppButton variant="secondary">
                        {t('admin.dashboard.edit')}
                      </AppButton>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard className="overflow-hidden xl:col-span-1">
          <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
            <div>
              <h2 className="font-heading text-lg text-text-primary">
                {t('admin.dashboard.recentResourcesTitle')}
              </h2>
              <p className="text-sm text-text-secondary">
                {t('admin.dashboard.recentResourcesSubtitle')}
              </p>
            </div>

            <Link to="/admin/resources">
              <AppButton variant="ghost">{t('common.viewAll')}</AppButton>
            </Link>
          </div>

          <div className="divide-y divide-surface-border">
            {recentResources.length === 0 ? (
              <div className="px-5 py-8 text-sm text-text-secondary">
                {t('admin.dashboard.noResources')}
              </div>
            ) : (
              recentResources.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {item.thumbnail_url ? (
                      <img
                        src={item.thumbnail_url}
                        alt={item.title}
                        className="h-12 w-12 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-surface-border bg-bg-soft text-sm font-medium text-text-secondary">
                        {item.title.slice(0, 1).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate font-medium text-text-primary">
                        {item.title}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {item.contributor?.name ?? t('admin.dashboard.noContributor')} ·{' '}
                        {item.resource_type ?? t('admin.dashboard.noType')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {item.is_featured ? (
                      <StatusBadge label={t('admin.dashboard.featured')} tone="warning" />
                    ) : null}

                    <StatusBadge
                      label={
                        item.is_published
                          ? t('admin.dashboard.publishedStatus')
                          : t('admin.dashboard.draft')
                      }
                      tone={item.is_published ? 'success' : 'muted'}
                    />

                    <Link to={`/admin/resources/${item.id}/edit`}>
                      <AppButton variant="secondary">
                        {t('admin.dashboard.edit')}
                      </AppButton>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <MetricListCard
          title={t('admin.analytics.topResourcesTitle')}
          subtitle={t('admin.analytics.topResourcesSubtitle')}
          emptyText={t('admin.analytics.noResourceData')}
          items={topResources.map((item) => ({
            key: item.id,
            title: item.title,
            subtitle: `@${item.slug}`,
            value: item.total_opens,
          }))}
        />

        <MetricListCard
          title={t('admin.analytics.topContributorsTitle')}
          subtitle={t('admin.analytics.topContributorsSubtitle')}
          emptyText={t('admin.analytics.noContributorData')}
          items={topContributors.map((item) => ({
            key: item.id,
            title: item.name,
            subtitle: `@${item.slug}`,
            value: item.total_views,
          }))}
        />

        <CountryAnalyticsCard
  title={t('admin.analytics.countriesTitle')}
  subtitle={t('admin.analytics.countriesSubtitle')}
  emptyText={t('admin.analytics.noCountryData')}
  items={countryMetrics}
/>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RatingMetricCard
          title={t('admin.analytics.topRatedResourcesTitle')}
          subtitle={t('admin.analytics.topRatedResourcesSubtitle')}
          emptyText={t('admin.analytics.noTopRatedResources')}
          items={topRatedResources.map((item) => ({
            key: item.id,
            title: item.title,
            subtitle: `@${item.slug}`,
            average: item.average_rating,
            count: item.total_ratings,
          }))}
        />

        <RatingMetricCard
          title={t('admin.analytics.topRatedContributorsTitle')}
          subtitle={t('admin.analytics.topRatedContributorsSubtitle')}
          emptyText={t('admin.analytics.noTopRatedContributors')}
          items={topRatedContributors.map((item) => ({
            key: item.id,
            title: item.name,
            subtitle: `@${item.slug}`,
            average: item.average_rating,
            count: item.total_ratings,
          }))}
        />
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon: ReactNode
}) {
  return (
    <SectionCard className="p-5">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
          {icon}
        </div>

        <div>
          <p className="text-sm text-text-secondary">{label}</p>
          <p className="font-heading text-2xl text-text-primary">{value}</p>
        </div>
      </div>
    </SectionCard>
  )
}

function QuickActionCard({
  icon,
  title,
  description,
  to,
  actionLabel,
}: {
  icon: ReactNode
  title: string
  description: string
  to: string
  actionLabel: string
}) {
  return (
    <SectionCard className="p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
        {icon}
      </div>

      <h2 className="mt-4 font-heading text-lg text-text-primary">{title}</h2>
      <p className="mt-2 text-sm text-text-secondary">{description}</p>

      <div className="mt-4">
        <Link to={to}>
          <AppButton>{actionLabel}</AppButton>
        </Link>
      </div>
    </SectionCard>
  )
}

function MetricListCard({
  title,
  subtitle,
  emptyText,
  items,
  icon,
}: {
  title: string
  subtitle: string
  emptyText: string
  items: Array<{
    key: string
    title: string
    subtitle: string
    value: number
  }>
  icon?: ReactNode
}) {
  return (
    <SectionCard className="overflow-hidden">
      <div className="border-b border-surface-border px-5 py-4">
        <div className="flex items-center gap-2">
          {icon ? <span className="text-brand-primary">{icon}</span> : null}
          <h2 className="font-heading text-lg text-text-primary">{title}</h2>
        </div>
        <p className="text-sm text-text-secondary">{subtitle}</p>
      </div>

      <div className="divide-y divide-surface-border">
        {items.length === 0 ? (
          <div className="px-5 py-8 text-sm text-text-secondary">{emptyText}</div>
        ) : (
          items.map((item, index) => (
            <div
              key={item.key}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-text-primary">
                  {index + 1}. {item.title}
                </p>
                {item.subtitle ? (
                  <p className="text-sm text-text-secondary">{item.subtitle}</p>
                ) : null}
              </div>

              <div className="shrink-0 text-sm font-semibold text-brand-primary">
                {item.value}
              </div>
            </div>
          ))
        )}
      </div>
    </SectionCard>
  )
}

function RatingMetricCard({
  title,
  subtitle,
  emptyText,
  items,
}: {
  title: string
  subtitle: string
  emptyText: string
  items: Array<{
    key: string
    title: string
    subtitle: string
    average: number
    count: number
  }>
}) {
  return (
    <SectionCard className="overflow-hidden">
      <div className="border-b border-surface-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-brand-primary" />
          <h2 className="font-heading text-lg text-text-primary">{title}</h2>
        </div>
        <p className="text-sm text-text-secondary">{subtitle}</p>
      </div>

      <div className="divide-y divide-surface-border">
        {items.length === 0 ? (
          <div className="px-5 py-8 text-sm text-text-secondary">{emptyText}</div>
        ) : (
          items.map((item, index) => (
            <div
              key={item.key}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-text-primary">
                  {index + 1}. {item.title}
                </p>
                <p className="text-sm text-text-secondary">{item.subtitle}</p>
              </div>

              <div className="shrink-0">
                <RatingSummaryBadge average={item.average} count={item.count} />
              </div>
            </div>
          ))
        )}
      </div>
    </SectionCard>
  )
}
function CountryAnalyticsCard({
  title,
  subtitle,
  emptyText,
  items,
}: {
  title: string
  subtitle: string
  emptyText: string
  items: CountryMetric[]
}) {
  const chartData = items.map((item) => ({
    country: item.country,
    label: getCountryLabel(item.country),
    total: item.total,
  }))

  return (
    <SectionCard className="overflow-hidden">
      <div className="border-b border-surface-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-brand-primary" />
          <h2 className="font-heading text-lg text-text-primary">{title}</h2>
        </div>
        <p className="text-sm text-text-secondary">{subtitle}</p>
      </div>

      {items.length === 0 ? (
        <div className="px-5 py-8 text-sm text-text-secondary">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-5 p-5">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis
                  dataKey="country"
                  tick={{ fontSize: 12 }}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => [value, 'Events']}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.label ?? ''
                  }
                />
                <Bar dataKey="total" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="divide-y divide-surface-border rounded-2xl border border-surface-border">
            {items.map((item, index) => (
              <div
                key={`${item.country}-${index}`}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <CountryFlag code={item.country} className="text-xl" />

                  <p className="truncate text-sm font-medium text-text-primary">
                    {index + 1}. {getCountryLabel(item.country)}
                  </p>
                </div>

                <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary">
                  {item.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  )
}
import { useEffect, useState, useCallback, useDeferredValue, startTransition, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BarChart3,
  Download,
  Eye,
  TrendingUp,
  Users,
  Zap,
  ArrowUpRight,
  Search,
  ChevronDown,
  FileSpreadsheet,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import SectionCard from '@/components/ui/SectionCard'
import AppButton from '@/components/ui/AppButton'
import EmptyState from '@/components/ui/EmptyState'
import Skeleton from '@/components/ui/Skeleton'
import {
  getResourceMetrics,
  getResourceMetricSummary,
  getResourceMetricEvents,
  getMetricExportData,
  type MetricPeriod,
  type MetricSort,
  type ResourceMetricItem,
  type ResourceMetricEvent,
  type ResourceMetricSummary,
} from '@/lib/api/admin'
import {
  getCachedAdminData,
  setCachedAdminData,
} from '@/lib/adminCache'
import { exportMetricsToExcel } from '@/lib/utils/exportMetrics'

const CACHE_KEY_PREFIX = 'admin:metrics:'
const CACHE_TTL = 60_000

const MS_PER_MINUTE = 60_000
const MINUTES_PER_HOUR = 60
const HOURS_PER_DAY = 24
const DAYS_PER_MONTH_APPROX = 30
const MS_PER_DAY = 86_400_000

const HOT_BADGE_MIN_VIEWS = 100
const HOT_BADGE_MIN_CONVERSION = 15
const HIGH_CONVERSION_THRESHOLD = 20
const RECENT_BADGE_DAYS = 7

const PERIOD_OPTIONS: { value: MetricPeriod; labelKey: string }[] = [
  { value: '7d', labelKey: 'admin.metrics.period7d' },
  { value: '30d', labelKey: 'admin.metrics.period30d' },
  { value: '90d', labelKey: 'admin.metrics.period90d' },
  { value: 'all', labelKey: 'admin.metrics.periodAll' },
]

const SORT_OPTIONS: { value: MetricSort['key']; labelKey: string }[] = [
  { value: 'views', labelKey: 'admin.metrics.mostViews' },
  { value: 'downloads', labelKey: 'admin.metrics.mostDownloads' },
  { value: 'conversion', labelKey: 'admin.metrics.bestConversion' },
  { value: 'last_activity', labelKey: 'admin.metrics.recentActivity' },
]

function formatRelative(iso: string | null): string {
  if (!iso) return '\u2014'
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / MS_PER_MINUTE)
  if (mins < MINUTES_PER_HOUR) return `${mins}m`
  const hrs = Math.floor(mins / MINUTES_PER_HOUR)
  if (hrs < HOURS_PER_DAY) return `${hrs}h`
  const days = Math.floor(hrs / HOURS_PER_DAY)
  if (days < DAYS_PER_MONTH_APPROX) return `${days}d`
  const months = Math.floor(days / DAYS_PER_MONTH_APPROX)
  return `${months}mo`
}

function formatDate(iso: string | null) {
  if (!iso) return '\u2014'
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getResourceBadge(item: ResourceMetricItem): { label: string; className: string } | null {
  if (item.total_views >= HOT_BADGE_MIN_VIEWS && item.conversion_rate >= HOT_BADGE_MIN_CONVERSION) {
    return { label: 'admin.metrics.hot', className: 'bg-red-100 text-red-700 border-red-200' }
  }
  if (item.conversion_rate >= HIGH_CONVERSION_THRESHOLD) {
    return { label: 'admin.metrics.highConversion', className: 'bg-green-100 text-green-700 border-green-200' }
  }
  if (item.total_downloads === 0 && item.total_views > 0) {
    return { label: 'admin.metrics.noDownloads', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' }
  }
  const daysSince = item.last_view_at ?? item.last_download_at
  if (daysSince && Date.now() - new Date(daysSince).getTime() < RECENT_BADGE_DAYS * MS_PER_DAY) {
    return { label: 'admin.metrics.recent', className: 'bg-blue-100 text-blue-700 border-blue-200' }
  }
  return null
}

interface KpiCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
}

function KpiCard({ icon, label, value, sub }: KpiCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-surface-border bg-surface p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
          {label}
        </p>
        <p className="mt-0.5 font-heading text-2xl text-text-primary">{value}</p>
        {sub && <p className="text-xs text-text-secondary">{sub}</p>}
      </div>
    </div>
  )
}

function SortDropdown({
  value,
  onChange,
  options,
}: {
  value: MetricSort['key']
  onChange: (v: MetricSort['key']) => void
  options: { value: MetricSort['key']; labelKey: string }[]
}) {
  const { t } = useTranslation()

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as MetricSort['key'])}
        className="h-9 appearance-none rounded-lg border border-surface-border bg-surface px-3 pr-8 text-sm text-text-primary cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {t(o.labelKey)}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
    </div>
  )
}

function ResourceRow({
  resource,
  isSelected,
  onClick,
}: {
  resource: ResourceMetricItem
  isSelected: boolean
  onClick: () => void
}) {
  const { t } = useTranslation()
  const badge = getResourceBadge(resource)

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-all hover:bg-surface-hover ${
        isSelected ? 'bg-brand-primary/5 ring-1 ring-brand-primary/30' : ''
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        {resource.thumbnail_url ? (
          <img
            src={resource.thumbnail_url}
            alt={resource.title}
            className="h-10 w-10 rounded-lg object-cover shrink-0"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-surface-border bg-bg-soft text-sm font-medium text-text-secondary shrink-0">
            {resource.title.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium text-text-primary text-sm">
              {resource.title}
            </p>
            {badge && (
              <span
                className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium ${badge.className}`}
              >
                {t(badge.label)}
              </span>
            )}
          </div>
          <p className="truncate text-xs text-text-secondary">
            {t('admin.metrics.lastActivity')}: {formatRelative(resource.last_view_at ?? resource.last_download_at)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-5 shrink-0">
        <div className="hidden sm:flex flex-col items-center">
          <Eye className="h-3.5 w-3.5 text-text-secondary" />
          <span className="text-sm font-semibold text-text-primary">{resource.total_views}</span>
          <span className="text-[10px] text-text-secondary">{t('admin.metrics.views')}</span>
        </div>
        <div className="hidden sm:flex flex-col items-center">
          <Download className="h-3.5 w-3.5 text-text-secondary" />
          <span className="text-sm font-semibold text-text-primary">{resource.total_downloads}</span>
          <span className="text-[10px] text-text-secondary">{t('admin.metrics.downloads')}</span>
        </div>
        <div className="flex flex-col items-center">
          <TrendingUp className="h-3.5 w-3.5 text-brand-primary" />
          <span className="text-sm font-semibold text-brand-primary">{resource.conversion_rate}%</span>
          <span className="text-[10px] text-text-secondary">{t('admin.metrics.conversion')}</span>
        </div>
        <ArrowUpRight className="h-4 w-4 text-text-secondary" />
      </div>
    </button>
  )
}

function EventTimelineItem({ event }: { event: ResourceMetricEvent }) {
  const { t } = useTranslation()
  const isDownload = event.event_type === 'download' || event.event_type === 'open_external'

  const initial = event.user_full_name?.[0]?.toUpperCase() ?? event.user_email?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-xs font-semibold text-brand-primary">
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary">
          {event.user_full_name || event.user_email || '\u2014'}
        </p>
        {event.user_full_name && event.user_email && (
          <p className="truncate text-xs text-text-secondary">{event.user_email}</p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span
          className={`text-[10px] font-semibold uppercase tracking-wide ${
            isDownload ? 'text-brand-primary' : 'text-brand-accent'
          }`}
        >
          {event.event_type === 'download'
            ? t('admin.metrics.download')
            : event.event_type === 'open_external'
              ? t('admin.metrics.openExternal')
              : t('admin.metrics.view')}
        </span>
        <span className="text-xs text-text-secondary">
          {formatRelative(event.created_at)} {t('admin.metrics.ago')}
        </span>
        <span className="text-[10px] text-text-secondary">{formatDate(event.created_at)}</span>
      </div>
    </div>
  )
}

function MetricsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <Skeleton width={80} height={12} variant="text" />
          <Skeleton width={220} height={36} />
          <Skeleton width={300} height={16} />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} width={80} height={36} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-surface-border bg-surface p-4">
            <Skeleton width={80} height={12} variant="text" />
            <Skeleton width={60} height={28} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionCard className="overflow-hidden">
          <div className="border-b border-surface-border px-5 py-4">
            <Skeleton width={120} height={20} />
            <Skeleton width={200} height={14} className="mt-1" />
          </div>
          <div className="divide-y divide-surface-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <Skeleton width={40} height={40} variant="circular" />
                <div className="flex-1 space-y-2">
                  <Skeleton width="50%" height={16} />
                  <Skeleton width="30%" height={12} />
                </div>
                <Skeleton width={60} height={16} />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
            <div>
              <Skeleton width={140} height={20} />
              <Skeleton width={200} height={14} className="mt-1" />
            </div>
          </div>
          <div className="flex items-center justify-center p-12">
            <EmptyState
              icon={<TrendingUp className="h-5 w-5" />}
              title="admin.metrics.selectResource"
              description="admin.metrics.selectResourceDesc"
            />
          </div>
        </SectionCard>
      </div>
    </div>
  )
}

export default function AdminMetricsPage() {
  const { t } = useTranslation()
  const [period, setPeriod] = useState<MetricPeriod>('30d')
  const [sort, setSort] = useState<MetricSort>({ key: 'views', dir: 'desc' })
  const [searchInput, setSearchInput] = useState('')
  const deferredSearch = useDeferredValue(searchInput)

  const [resources, setResources] = useState<ResourceMetricItem[]>([])
  const [summary, setSummary] = useState<ResourceMetricSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [selectedResource, setSelectedResource] = useState<ResourceMetricItem | null>(null)
  const [events, setEvents] = useState<ResourceMetricEvent[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const fetchMetrics = useCallback(async (targetPeriod: MetricPeriod, targetSort: MetricSort, searchQuery: string, signal?: AbortSignal) => {
    try {
      const cacheKey = `${CACHE_KEY_PREFIX}${targetPeriod}:${targetSort.key}:${targetSort.dir}:${searchQuery}`
      const cachedSummary = getCachedAdminData<ResourceMetricSummary>(`${CACHE_KEY_PREFIX}summary:${targetPeriod}`)
      const cachedResources = getCachedAdminData<ResourceMetricItem[]>(cacheKey)

      if (cachedSummary && cachedResources) {
        setSummary(cachedSummary)
        setResources(cachedResources)
        return
      }

      const [metricsData, summaryData] = await Promise.all([
        getResourceMetrics(targetPeriod, targetSort, searchQuery),
        getResourceMetricSummary(targetPeriod),
      ])

      if (signal?.aborted) return

      setResources(metricsData)
      setSummary(summaryData)
      setCachedAdminData(cacheKey, metricsData, CACHE_TTL)
      setCachedAdminData(`${CACHE_KEY_PREFIX}summary:${targetPeriod}`, summaryData, CACHE_TTL)
    } catch (err) {
      if (signal?.aborted) return
      setError(err instanceof Error ? err.message : t('common.error'))
    }
  }, [t])

  useEffect(() => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    if (loading) {
      void fetchMetrics(period, sort, deferredSearch, controller.signal)
        .finally(() => setLoading(false))
    } else {
      setUpdating(true)
      void fetchMetrics(period, sort, deferredSearch, controller.signal)
        .finally(() => setUpdating(false))
    }

    return () => { controller.abort() }
  }, [period, sort, deferredSearch, fetchMetrics, loading])

  function handlePeriodChange(newPeriod: MetricPeriod) {
    startTransition(() => {
      setPeriod(newPeriod)
      setSelectedResource(null)
      setEvents([])
    })
  }

  function handleSortChange(key: MetricSort['key']) {
    startTransition(() => {
      setSort((prev) => ({ ...prev, key }))
    })
  }

  async function handleSelectResource(resource: ResourceMetricItem) {
    setSelectedResource(resource)
    setLoadingEvents(true)
    try {
      const data = await getResourceMetricEvents(resource.id, period)
      setEvents(data)
    } catch {
      setEvents([])
    } finally {
      setLoadingEvents(false)
    }
  }

  function handleCloseDetail() {
    setSelectedResource(null)
    setEvents([])
  }

  async function handleExport() {
    setExporting(true)
    try {
      const data = await getMetricExportData(period)
      await exportMetricsToExcel(data, {
        period,
        periodLabel: PERIOD_OPTIONS.find((o) => o.value === period)?.labelKey ?? period,
      })
      toast.success(t('admin.metrics.exportSuccess'))
    } catch (err) {
      console.error(err)
      toast.error(t('admin.metrics.exportError'))
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return <MetricsSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-brand-primary">
            {t('admin.metrics.badge')}
          </p>
          <h1 className="mt-2 font-heading text-3xl md:text-4xl">
            {t('admin.metrics.title')}
          </h1>
          <p className="mt-3 text-sm text-text-secondary">
            {t('admin.metrics.subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <AppButton
            variant="secondary"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            {exporting ? t('admin.metrics.exporting') : t('admin.metrics.exportExcel')}
          </AppButton>

          {PERIOD_OPTIONS.map((opt) => (
            <AppButton
              key={opt.value}
              variant={period === opt.value ? 'primary' : 'secondary'}
              onClick={() => handlePeriodChange(opt.value)}
            >
              {t(opt.labelKey)}
            </AppButton>
          ))}
        </div>
      </div>

      {updating && (
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Loader2 className="h-4 w-4 animate-spin text-brand-primary" />
          {t('admin.metrics.updating')}
        </div>
      )}

      {error ? (
        <SectionCard className="border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-600">{error}</p>
        </SectionCard>
      ) : null}

      {summary && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <KpiCard
            icon={<Eye className="h-5 w-5" />}
            label={t('admin.metrics.viewsCount')}
            value={summary.total_views.toLocaleString()}
            sub={t('admin.metrics.kpis')}
          />
          <KpiCard
            icon={<Download className="h-5 w-5" />}
            label={t('admin.metrics.downloadsCount')}
            value={summary.total_downloads.toLocaleString()}
          />
          <KpiCard
            icon={<Users className="h-5 w-5" />}
            label={t('admin.metrics.usersCount')}
            value={summary.unique_users.toLocaleString()}
          />
          <KpiCard
            icon={<Zap className="h-5 w-5" />}
            label={t('admin.metrics.conversionRate')}
            value={`${summary.conversion_rate}%`}
            sub={`${summary.active_resources} ${t('admin.metrics.activeResources')}`}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionCard className="overflow-hidden">
          <div className="border-b border-surface-border px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-heading text-lg text-text-primary">
                  {t('admin.metrics.byResource')}
                </h2>
                <p className="text-sm text-text-secondary">
                  {t('admin.metrics.byResourceSubtitle')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder={t('admin.metrics.searchPlaceholder')}
                    className="h-9 w-44 rounded-lg border border-surface-border bg-surface pl-9 pr-3 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-brand-primary/50"
                  />
                </div>
                <SortDropdown value={sort.key} onChange={handleSortChange} options={SORT_OPTIONS} />
              </div>
            </div>
          </div>

          {resources.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<BarChart3 className="h-5 w-5" />}
                title={t('admin.metrics.noData')}
                description={t('admin.metrics.noDataDesc')}
              />
            </div>
          ) : (
            <div className="divide-y divide-surface-border max-h-[560px] overflow-y-auto">
              {resources.map((resource) => (
                <ResourceRow
                  key={resource.id}
                  resource={resource}
                  isSelected={selectedResource?.id === resource.id}
                  onClick={() => handleSelectResource(resource)}
                />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard className="overflow-hidden">
          <div className="border-b border-surface-border px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-lg text-text-primary">
                  {selectedResource ? selectedResource.title : t('admin.metrics.detailTitle')}
                </h2>
                {selectedResource ? (
                  <p className="text-sm text-text-secondary">
                    @{selectedResource.slug} · {selectedResource.total_views} {t('admin.metrics.views')} · {selectedResource.total_downloads} {t('admin.metrics.downloads')}
                  </p>
                ) : (
                  <p className="text-sm text-text-secondary">{t('admin.metrics.timelineSubtitle')}</p>
                )}
              </div>
              {selectedResource && (
                <AppButton variant="ghost" onClick={handleCloseDetail}>
                  {t('admin.metrics.closeDetail')}
                </AppButton>
              )}
            </div>
          </div>

          {!selectedResource ? (
            <div className="flex items-center justify-center p-10">
              <EmptyState
                icon={<TrendingUp className="h-5 w-5" />}
                title={t('admin.metrics.selectResource')}
                description={t('admin.metrics.selectResourceDesc')}
              />
            </div>
          ) : loadingEvents ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton width={32} height={32} variant="circular" />
                  <div className="flex-1 space-y-2">
                    <Skeleton width="40%" height={14} />
                    <Skeleton width="60%" height={12} />
                  </div>
                  <Skeleton width={80} height={12} />
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<TrendingUp className="h-5 w-5" />}
                title={t('admin.metrics.noEvents')}
                description={t('admin.metrics.noEventsDesc')}
              />
            </div>
          ) : (
            <div className="max-h-[560px] overflow-y-auto">
              <div className="p-2">
                <p className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-text-secondary">
                  {t('admin.metrics.timelineTitle')} ({events.length})
                </p>
              </div>
              <div className="divide-y divide-surface-border">
                {events.map((event) => (
                  <EventTimelineItem key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
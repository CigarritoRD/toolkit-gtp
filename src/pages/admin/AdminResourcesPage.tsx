import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FolderKanban, Plus, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import EmptyState from '@/components/ui/EmptyState'
import AppButton from '@/components/ui/AppButton'
import SectionCard from '@/components/ui/SectionCard'
import SearchInput from '@/components/ui/SearchInput'
import StatusBadge from '@/components/ui/StatusBadge'
import { AdminTableSkeleton } from '@/components/ui/Skeleton'
import {
  activateResource,
  deactivateResource,
  getAdminResources,
  getPendingReviewResources,
  approveResource,
  rejectResource,
} from '@/lib/api/resources'
import { confirmAction } from '@/lib/api/confirm'
import {
  getCachedAdminData,
  setCachedAdminData,
  invalidateAdminCache,
} from '@/lib/adminCache'
import { toast } from 'sonner'

const CACHE_KEY = 'admin:resources'
const CACHE_TTL = 60_000

type ResourceListItem = {
  id: string
  title: string
  slug: string
  short_description?: string | null
  thumbnail_url?: string | null
  resource_type?: string | null
  contributor_id: string
  category_id: string
  is_featured: boolean
  is_public: boolean
  is_published: boolean
  approval_status?: string | null
  rejection_reason?: string | null
  created_at: string
  contributor?: {
    id: string
    name: string
    slug: string
  } | null
  category?: {
    id: string
    name: string
    slug: string
  } | null
}

type ApprovalFilter = 'all' | 'pending_review' | 'approved' | 'rejected' | 'draft'

const APPROVAL_TABS: { value: ApprovalFilter; labelKey: string }[] = [
  { value: 'all', labelKey: 'admin.resources.filterAll' },
  { value: 'pending_review', labelKey: 'admin.resources.filterPending' },
  { value: 'approved', labelKey: 'admin.resources.filterApproved' },
  { value: 'rejected', labelKey: 'admin.resources.filterRejected' },
  { value: 'draft', labelKey: 'admin.resources.filterDraft' },
]

function formatTypeLabel(type: string | null | undefined, t: (key: string) => string) {
  const normalized = (type || '').toLowerCase()

  switch (normalized) {
    case 'pdf':
      return t('resources.typePdf')
    case 'video':
      return t('resources.typeVideo')
    case 'audio':
      return t('resources.typeAudio')
    case 'image':
      return t('resources.typeImage')
    case 'document':
      return t('resources.typeDocument')
    case 'link':
      return t('resources.typeLink')
    case 'download':
      return t('resources.typeDownload')
    default:
      return type || t('admin.resources.noType')
  }
}

export default function AdminResourcesPage() {
  const { t } = useTranslation()

  const [items, setItems] = useState<ResourceListItem[]>(() =>
    getCachedAdminData<ResourceListItem[]>(CACHE_KEY) ?? [],
  )
  const [loading, setLoading] = useState(() => !getCachedAdminData(CACHE_KEY))
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [approvalFilter, setApprovalFilter] = useState<ApprovalFilter>('all')
  const hasInitialData = getCachedAdminData<ResourceListItem[]>(CACHE_KEY) !== null

  const loadResources = useCallback(
    async (silent = false) => {
      try {
        if (!silent) {
          setError(null)
        }
        const [data, pendingData] = await Promise.all([
          getAdminResources(),
          getPendingReviewResources(),
        ])

        const approvedResources = (data ?? []) as unknown as ResourceListItem[]
        const pendingResources = (pendingData ?? []) as unknown as ResourceListItem[]

        const allResources = [...approvedResources, ...pendingResources]

        const seen = new Set<string>()
        const unique = allResources.filter((r) => {
          if (seen.has(r.id)) return false
          seen.add(r.id)
          return true
        })

        setItems(unique as ResourceListItem[])
        setCachedAdminData(CACHE_KEY, unique, CACHE_TTL)
      } catch (err) {
        if (!silent) {
          setError(
            err instanceof Error
              ? err.message
              : t('admin.resources.errorDescription'),
          )
        }
      } finally {
        if (!silent) {
          setLoading(false)
        }
      }
    },
    [t],
  )

  useEffect(() => {
    if (!hasInitialData) {
      void loadResources(false)
    }
  }, [hasInitialData, loadResources])

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase()
    let result = items

    if (approvalFilter !== 'all') {
      result = result.filter((item) => item.approval_status === approvalFilter)
    }

    if (!term) return result

    return result.filter((item) => {
      return (
        item.title.toLowerCase().includes(term) ||
        item.slug.toLowerCase().includes(term) ||
        (item.resource_type ?? '').toLowerCase().includes(term) ||
        (item.contributor?.name ?? '').toLowerCase().includes(term) ||
        (item.category?.name ?? '').toLowerCase().includes(term)
      )
    })
  }, [items, search, approvalFilter])

  async function handleTogglePublished(item: ResourceListItem) {
    const action = item.is_published ? 'unpublish' : 'publish'

    const confirmed = await confirmAction({
      title: item.is_published
        ? t('admin.resources.confirmUnpublishTitle')
        : t('admin.resources.confirmPublishTitle'),
      text: item.title,
      confirmText: item.is_published
        ? t('admin.resources.unpublish')
        : t('admin.resources.publish'),
    })

    if (!confirmed) return

    try {
      setProcessingId(item.id)

      if (action === 'unpublish') {
        await deactivateResource(item.id)
      } else {
        await activateResource(item.id)
      }

      invalidateAdminCache(CACHE_KEY)
      await loadResources(false)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('admin.resources.updateError'),
      )
    } finally {
      setProcessingId(null)
    }
  }

  async function handleApproveResource(item: ResourceListItem) {
    const confirmed = await confirmAction({
      title: t('admin.resources.confirmApproveTitle'),
      text: item.title,
      confirmText: t('admin.resources.approve'),
    })
    if (!confirmed) return

    try {
      setProcessingId(item.id)
      await approveResource(item.id, 'admin')
      invalidateAdminCache(CACHE_KEY)
      await loadResources(false)
      toast.success(t('admin.resources.approveSuccess'))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('admin.resources.updateError'))
    } finally {
      setProcessingId(null)
    }
  }

  async function handleRejectResource(item: ResourceListItem) {
    const reason = window.prompt(t('admin.resources.rejectReasonPrompt'))
    if (reason === null) return

    try {
      setProcessingId(item.id)
      await rejectResource(item.id, 'admin', reason || undefined)
      invalidateAdminCache(CACHE_KEY)
      await loadResources(false)
      toast.success(t('admin.resources.rejectSuccess'))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('admin.resources.updateError'))
    } finally {
      setProcessingId(null)
    }
  }

  const total = items.length
  const published = items.filter((item) => item.is_published).length
  const featured = items.filter((item) => item.is_featured).length
  const publicCount = items.filter((item) => item.is_public).length

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-brand-primary">
            {t('admin.resources.badge')}
          </p>
          <h1 className="mt-2 font-heading text-3xl md:text-4xl">
            {t('admin.resources.title')}
          </h1>
          <p className="mt-3 text-sm text-text-secondary">
            {t('admin.resources.subtitle')}
          </p>
        </div>

        <Link to="/admin/resources/new">
          <AppButton>
            <Plus className="h-4 w-4" />
            {t('admin.resources.newResource')}
          </AppButton>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard
          label={t('admin.resources.total')}
          value={total}
          icon={<FolderKanban className="h-4 w-4" />}
        />
        <MetricCard
          label={t('admin.resources.published')}
          value={published}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          label={t('admin.resources.featured')}
          value={featured}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          label={t('admin.resources.public')}
          value={publicCount}
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      <SectionCard className="p-4">
        <div className="max-w-md">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t('admin.resources.searchPlaceholder')}
          />
        </div>
      </SectionCard>

      <div className="flex flex-wrap gap-2">
        {APPROVAL_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setApprovalFilter(tab.value)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              approvalFilter === tab.value
                ? 'border-brand-primary bg-brand-primary text-white'
                : 'border-surface-border bg-surface text-brand-primary hover:border-brand-primary'
            }`}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      <SectionCard className="overflow-hidden">
        <div className="border-b border-surface-border px-4 py-3">
          <h2 className="text-sm font-medium text-text-primary">
            {t('admin.resources.listTitle')}
          </h2>
        </div>

        {loading ? (
          <AdminTableSkeleton rows={6} />
        ) : error ? (
          <div className="px-4 py-6 text-sm text-red-600">{error}</div>
        ) : filteredItems.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<FolderKanban className="h-5 w-5" />}
              title={t('admin.resources.emptyTitle')}
              description={t('admin.resources.emptyDescription')}
            />
          </div>
        ) : (
          <div className="divide-y divide-surface-border">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {item.thumbnail_url ? (
                    <img
                      src={item.thumbnail_url}
                      alt={item.title}
                      className="h-11 w-11 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-surface-border bg-bg-soft text-sm font-medium text-brand-primary">
                      {item.title.slice(0, 1).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-text-primary">
                        {item.title}
                      </p>

                      {item.is_featured ? (
                        <StatusBadge
                          label={t('admin.resources.featuredStatus')}
                          tone="warning"
                        />
                      ) : null}

                      <StatusBadge
                        label={
                          item.is_published
                            ? t('admin.resources.publishedStatus')
                            : t('admin.resources.draft')
                        }
                        tone={item.is_published ? 'success' : 'muted'}
                      />

                      {item.is_public ? (
                        <StatusBadge
                          label={t('admin.resources.publicStatus')}
                          tone="info"
                        />
                      ) : null}

                      {item.approval_status === 'pending_review' && (
                        <StatusBadge
                          label={t('admin.resources.statusPending')}
                          tone="warning"
                        />
                      )}
                      {item.approval_status === 'rejected' && (
                        <StatusBadge
                          label={t('admin.resources.statusRejected')}
                          tone="danger"
                        />
                      )}
                      {item.approval_status === 'approved' && (
                        <StatusBadge
                          label={t('admin.resources.statusApproved')}
                          tone="success"
                        />
                      )}
                      {item.approval_status === 'draft' && (
                        <StatusBadge
                          label={t('admin.resources.statusDraft')}
                          tone="muted"
                        />
                      )}
                    </div>

                    <p className="mt-0.5 text-sm text-text-secondary">@{item.slug}</p>

                    <p className="mt-0.5 text-sm text-text-secondary">
                      {item.contributor?.name ?? t('admin.resources.noContributor')} ·{' '}
                      {item.category?.name ?? t('admin.resources.noCategory')} ·{' '}
                      {formatTypeLabel(item.resource_type, t)}
                    </p>

                    {item.short_description ? (
                      <p className="mt-1 line-clamp-1 max-w-2xl text-sm text-text-secondary">
                        {item.short_description}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <Link to={`/resources/${item.slug}`}>
                    <AppButton variant="ghost">
                      {t('admin.resources.view')}
                    </AppButton>
                  </Link>

                  <Link to={`/admin/resources/${item.id}/edit`}>
                    <AppButton variant="secondary">
                      {t('admin.dashboard.edit')}
                    </AppButton>
                  </Link>

                  {item.approval_status === 'pending_review' && (
                    <>
                      <AppButton
                        variant="success"
                        disabled={processingId === item.id}
                        onClick={() => void handleApproveResource(item)}
                      >
                        {t('admin.resources.approve')}
                      </AppButton>
                      <AppButton
                        variant="danger"
                        disabled={processingId === item.id}
                        onClick={() => void handleRejectResource(item)}
                      >
                        {t('admin.resources.reject')}
                      </AppButton>
                    </>
                  )}

                  {item.approval_status !== 'pending_review' && (
                    <AppButton
                      variant={item.is_published ? 'danger' : 'success'}
                      disabled={processingId === item.id}
                      onClick={() => void handleTogglePublished(item)}
                    >
                      {processingId === item.id
                        ? item.is_published
                          ? t('admin.resources.unpublishing')
                          : t('admin.resources.publishing')
                        : item.is_published
                          ? t('admin.resources.unpublish')
                          : t('admin.resources.publish')}
                    </AppButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  )
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
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
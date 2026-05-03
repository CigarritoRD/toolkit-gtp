import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FolderKanban, Plus, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import EmptyState from '@/components/ui/EmptyState'
import AppButton from '@/components/ui/AppButton'
import SectionCard from '@/components/ui/SectionCard'
import SearchInput from '@/components/ui/SearchInput'
import StatusBadge from '@/components/ui/StatusBadge'
import {
  activateResource,
  deactivateResource,
  getAdminResources,
} from '@/lib/api/resources'
import { confirmAction } from '@/lib/api/confirm'

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

  const [items, setItems] = useState<ResourceListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)

  const loadResources = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAdminResources()
      setItems((data ?? []) as unknown as ResourceListItem[])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('admin.resources.errorDescription'),
      )
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void loadResources()
  }, [loadResources])

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return items

    return items.filter((item) => {
      return (
        item.title.toLowerCase().includes(term) ||
        item.slug.toLowerCase().includes(term) ||
        (item.resource_type ?? '').toLowerCase().includes(term) ||
        (item.contributor?.name ?? '').toLowerCase().includes(term) ||
        (item.category?.name ?? '').toLowerCase().includes(term)
      )
    })
  }, [items, search])

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

      await loadResources()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('admin.resources.updateError'),
      )
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

      <SectionCard className="overflow-hidden">
        <div className="border-b border-surface-border px-4 py-3">
          <h2 className="text-sm font-medium text-text-primary">
            {t('admin.resources.listTitle')}
          </h2>
        </div>

        {loading ? (
          <div className="px-4 py-6 text-sm text-text-secondary">
            {t('common.loading')}
          </div>
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
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Users, Globe, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import EmptyState from '@/components/ui/EmptyState'
import AppButton from '@/components/ui/AppButton'
import SectionCard from '@/components/ui/SectionCard'
import SearchInput from '@/components/ui/SearchInput'
import StatusBadge from '@/components/ui/StatusBadge'
import { AdminTableSkeleton } from '@/components/ui/Skeleton'
import { getAdminContributors } from '@/lib/api/contributors'

type AdminContributorItem = {
  id: string
  name: string
  slug: string
  short_bio?: string | null
  specialty?: string | null
  avatar_url?: string | null
  website_url?: string | null
  is_featured: boolean
  is_active: boolean
  created_at?: string
}

export default function AdminContributorsPage() {
  const { t } = useTranslation()

  const [items, setItems] = useState<AdminContributorItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const loadContributors = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAdminContributors()
      setItems((data ?? []) as unknown as AdminContributorItem[])
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('admin.contributors.errorDescription'),
      )
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void loadContributors()
  }, [loadContributors])

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return items

    return items.filter((item) => {
      return (
        item.name.toLowerCase().includes(term) ||
        item.slug.toLowerCase().includes(term) ||
        (item.specialty ?? '').toLowerCase().includes(term) ||
        (item.short_bio ?? '').toLowerCase().includes(term)
      )
    })
  }, [items, search])

  const total = items.length
  const active = items.filter((item) => item.is_active).length
  const featured = items.filter((item) => item.is_featured).length
  const withWebsite = items.filter((item) => !!item.website_url).length

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-brand-primary">
            {t('admin.contributors.badge')}
          </p>
          <h1 className="mt-2 font-heading text-3xl md:text-4xl">
            {t('admin.contributors.title')}
          </h1>
          <p className="mt-3 text-sm text-text-secondary">
            {t('admin.contributors.subtitle')}
          </p>
        </div>

        <Link to="/admin/contributors/new">
          <AppButton>
            <Plus className="h-4 w-4" />
            {t('admin.contributors.newContributor')}
          </AppButton>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard
          label={t('admin.contributors.total')}
          value={total}
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          label={t('admin.contributors.active')}
          value={active}
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          label={t('admin.contributors.featured')}
          value={featured}
          icon={<Star className="h-4 w-4" />}
        />
        <MetricCard
          label={t('admin.contributors.websites')}
          value={withWebsite}
          icon={<Globe className="h-4 w-4" />}
        />
      </div>

      <SectionCard className="p-4">
        <div className="max-w-md">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t('admin.contributors.searchPlaceholder')}
          />
        </div>
      </SectionCard>

      <SectionCard className="overflow-hidden">
        <div className="border-b border-surface-border px-4 py-3">
          <h2 className="text-sm font-medium text-text-primary">
            {t('admin.contributors.listTitle')}
          </h2>
        </div>

        {loading ? (
          <AdminTableSkeleton rows={6} />
        ) : error ? (
          <div className="px-4 py-6 text-sm text-red-600">{error}</div>
        ) : filteredItems.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<Users className="h-5 w-5" />}
              title={t('admin.contributors.emptyTitle')}
              description={t('admin.contributors.emptyDescription')}
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
                  {item.avatar_url ? (
                    <img
                      src={item.avatar_url}
                      alt={item.name}
                      className="h-11 w-11 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-surface-border bg-bg-soft text-sm font-medium text-brand-primary">
                      {item.name.slice(0, 1).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-text-primary">
                        {item.name}
                      </p>

                      {item.is_featured ? (
                        <StatusBadge
                          label={t('admin.contributors.featuredStatus')}
                          tone="warning"
                        />
                      ) : null}

                      <StatusBadge
                        label={
                          item.is_active
                            ? t('admin.contributors.activeStatus')
                            : t('admin.contributors.inactiveStatus')
                        }
                        tone={item.is_active ? 'success' : 'muted'}
                      />
                    </div>

                    <p className="mt-0.5 text-sm text-text-secondary">@{item.slug}</p>

                    <p className="mt-0.5 text-sm text-text-secondary">
                      {item.specialty || t('admin.contributors.noSpecialty')}
                    </p>

                    {item.short_bio ? (
                      <p className="mt-1 line-clamp-1 max-w-2xl text-sm text-text-secondary">
                        {item.short_bio}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <Link to={`/contributors/${item.slug}`}>
                    <AppButton variant="ghost">
                      {t('admin.contributors.view')}
                    </AppButton>
                  </Link>

                  <Link to={`/admin/contributors/${item.id}/edit`}>
                    <AppButton variant="secondary">
                      {t('admin.dashboard.edit')}
                    </AppButton>
                  </Link>
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
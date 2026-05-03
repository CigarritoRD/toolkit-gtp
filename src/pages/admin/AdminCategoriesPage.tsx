import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Grid2x2, Plus, FolderKanban } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import EmptyState from '@/components/ui/EmptyState'
import AppButton from '@/components/ui/AppButton'
import SectionCard from '@/components/ui/SectionCard'
import SearchInput from '@/components/ui/SearchInput'
import { AdminTableSkeleton } from '@/components/ui/Skeleton'
import {getAllCategories} from '@/lib/api/categories'

type AdminCategoryItem = {
  id: string
  name: string
  slug: string
  description?: string | null
  created_at?: string
}

export default function AdminCategoriesPage() {
  const { t } = useTranslation()

  const [items, setItems] = useState<AdminCategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllCategories()
      setItems((data ?? []) as unknown as AdminCategoryItem[])
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('admin.categories.errorDescription'),
      )
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void loadCategories()
  }, [loadCategories])

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return items

    return items.filter((item) => {
      return (
        item.name.toLowerCase().includes(term) ||
        item.slug.toLowerCase().includes(term) ||
        (item.description ?? '').toLowerCase().includes(term)
      )
    })
  }, [items, search])

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-brand-primary">
            {t('admin.categories.badge')}
          </p>
          <h1 className="mt-2 font-heading text-3xl md:text-4xl">
            {t('admin.categories.title')}
          </h1>
          <p className="mt-3 text-sm text-text-secondary">
            {t('admin.categories.subtitle')}
          </p>
        </div>

        <Link to="/admin/categories/new">
          <AppButton>
            <Plus className="h-4 w-4" />
            {t('admin.categories.newCategory')}
          </AppButton>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          label={t('admin.categories.total')}
          value={items.length}
          icon={<Grid2x2 className="h-4 w-4" />}
        />
        <MetricCard
          label={t('admin.categories.withDescription')}
          value={items.filter((item) => !!item.description).length}
          icon={<FolderKanban className="h-4 w-4" />}
        />
        <MetricCard
          label={t('admin.categories.visible')}
          value={items.length}
          icon={<Grid2x2 className="h-4 w-4" />}
        />
      </div>

      <SectionCard className="p-4">
        <div className="max-w-md">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t('admin.categories.searchPlaceholder')}
          />
        </div>
      </SectionCard>

      <SectionCard className="overflow-hidden">
        <div className="border-b border-surface-border px-4 py-3">
          <h2 className="text-sm font-medium text-text-primary">
            {t('admin.categories.listTitle')}
          </h2>
        </div>

        {loading ? (
          <AdminTableSkeleton rows={6} />
        ) : error ? (
          <div className="px-4 py-6 text-sm text-red-600">{error}</div>
        ) : filteredItems.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<Grid2x2 className="h-5 w-5" />}
              title={t('admin.categories.emptyTitle')}
              description={t('admin.categories.emptyDescription')}
            />
          </div>
        ) : (
          <div className="divide-y divide-surface-border">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium text-text-primary">{item.name}</p>
                  <p className="mt-0.5 text-sm text-text-secondary">@{item.slug}</p>
                  {item.description ? (
                    <p className="mt-1 line-clamp-2 max-w-2xl text-sm text-text-secondary">
                      {item.description}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-text-secondary">
                      {t('admin.categories.noDescription')}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <Link to={`/resources?category=${encodeURIComponent(item.slug)}`}>
                    <AppButton variant="ghost">
                      {t('admin.categories.view')}
                    </AppButton>
                  </Link>

                  <Link to={`/admin/categories/${item.id}/edit`}>
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
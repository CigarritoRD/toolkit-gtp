import { useEffect, useMemo, useState } from 'react'
import { Bookmark, Heart, Library, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/auth/useAuth'
import EmptyState from '@/components/ui/EmptyState'
import SectionCard from '@/components/ui/SectionCard'
import AppButton from '@/components/ui/AppButton'
import ResourceCard from '@/components/resources/ResourceCard'
import { getMyLibrary, type DashboardLibraryItem } from '@/lib/api/dashboard'
import { removeLibraryEntry } from '@/lib/api/library'

type FilterKind = 'all' | 'saved' | 'favorite'

export default function DashboardLibraryPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [items, setItems] = useState<DashboardLibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterKind>('all')
  const [updatingKey, setUpdatingKey] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const loadLibrary = async () => {
      if (!user?.id) {
        if (active) {
          setItems([])
          setLoading(false)
        }
        return
      }

      try {
        setLoading(true)
        const data = await getMyLibrary(user.id)

        if (!active) return
        setItems(data)
      } catch (error) {
        console.error(error)
        if (active) {
          toast.error(t('dashboardLibrary.errorLoad'))
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadLibrary()

    return () => {
      active = false
    }
  }, [user?.id, t])

  const filteredItems = useMemo(() => {
    if (filter === 'all') return items
    return items.filter((item) => item.kind === filter)
  }, [items, filter])

  const handleRemove = async (
    resourceId: string,
    kind: 'saved' | 'favorite',
  ) => {
    if (!user?.id) return

    const actionKey = `${resourceId}-${kind}`

    try {
      setUpdatingKey(actionKey)
      await removeLibraryEntry(user.id, resourceId, kind)

      setItems((current) =>
        current.filter(
          (item) => !(item.resource?.id === resourceId && item.kind === kind),
        ),
      )

      toast.success(
        kind === 'saved'
          ? t('dashboardLibrary.removedSaved')
          : t('dashboardLibrary.removedFavorite'),
      )
    } catch (error) {
      console.error(error)
      toast.error(t('dashboardLibrary.errorUpdate'))
    } finally {
      setUpdatingKey(null)
    }
  }

  return (
    <div className="bg-bg text-text-primary">
      <section className="py-2">
        <SectionCard className="p-8">
          <p className="text-sm uppercase tracking-[0.2em] text-brand-primary">
            {t('dashboardLibrary.badge')}
          </p>
          <h1 className="mt-3 font-heading text-4xl md:text-5xl">
            {t('dashboardLibrary.title')}
          </h1>
          <p className="mt-4 max-w-2xl font-body text-lg text-brand-primary">
            {t('dashboardLibrary.subtitle')}
          </p>
        </SectionCard>
      </section>

      <section className="py-8">
        <div className="mb-6 flex flex-wrap gap-3">
          <AppButton
            type="button"
            variant={filter === 'all' ? 'primary' : 'secondary'}
            onClick={() => setFilter('all')}
          >
            <Library className="h-4 w-4" />
            {t('dashboardLibrary.all')}
          </AppButton>

          <AppButton
            type="button"
            variant={filter === 'saved' ? 'primary' : 'secondary'}
            onClick={() => setFilter('saved')}
          >
            <Bookmark className="h-4 w-4" />
            {t('dashboardLibrary.saved')}
          </AppButton>

          <AppButton
            type="button"
            variant={filter === 'favorite' ? 'primary' : 'secondary'}
            onClick={() => setFilter('favorite')}
          >
            <Heart className="h-4 w-4" />
            {t('dashboardLibrary.favorites')}
          </AppButton>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-3xl border border-surface-border bg-surface p-5 shadow-[var(--shadow-soft)]"
              >
                <div className="mb-4 aspect-[4/3] rounded-2xl bg-bg-soft" />
                <div className="h-5 w-24 rounded bg-bg-soft" />
                <div className="mt-3 h-6 w-3/4 rounded bg-bg-soft" />
                <div className="mt-2 h-4 w-full rounded bg-bg-soft" />
                <div className="mt-2 h-4 w-2/3 rounded bg-bg-soft" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={<Library className="h-5 w-5" />}
            title={t('dashboardLibrary.emptyTitle')}
            description={t('dashboardLibrary.emptyBody')}
            actionLabel={t('dashboardLibrary.emptyAction')}
            onAction={() => {
              window.location.href = '/resources'
            }}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => {
              const resource = item.resource
              if (!resource) return null

              const actionKey = `${resource.id}-${item.kind}`

              return (
                <div key={item.library_id} className="space-y-3">
                  <div className="overflow-hidden rounded-3xl border border-surface-border bg-surface shadow-[var(--shadow-soft)]">
                    <div className="relative">
                      <div className="absolute left-3 top-3 z-10 rounded-full border border-surface-border bg-bg/90 px-3 py-1 text-xs font-medium text-text-primary backdrop-blur">
                        {item.kind === 'saved' ? t('dashboardLibrary.badgeSaved') : t('dashboardLibrary.badgeFavorite')}
                      </div>

                      <ResourceCard
                        id={resource.id}
                        title={resource.title}
                        description={resource.short_description || resource.description}
                        thumbnailUrl={resource.thumbnail_url}
                        type={resource.resource_type}
                        contributorName={resource.contributor?.name ?? null}
                        slug={resource.slug}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <AppButton
                      type="button"
                      variant="secondary"
                      disabled={updatingKey === actionKey}
                      onClick={() =>
                        handleRemove(
                          resource.id,
                          item.kind as 'saved' | 'favorite',
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                      {updatingKey === actionKey ? t('common.removing') : t('common.remove')}
                    </AppButton>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
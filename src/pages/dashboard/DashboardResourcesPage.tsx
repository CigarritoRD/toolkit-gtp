import { useEffect, useMemo, useState } from 'react'
import { Filter, FolderKanban, Tag } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import ResourceCard from '@/components/resources/ResourceCard'
import EmptyState from '@/components/ui/EmptyState'
import SearchInput from '@/components/ui/SearchInput'
import AppSelect from '@/components/ui/AppSelect'
import SectionCard from '@/components/ui/SectionCard'
import {
  getActiveResourceCategories,
  getPublishedResources,
  type ResourceCategory,
} from '@/lib/api/resources'
import { getActiveTags, type TagRecord } from '@/lib/api/tags'
import type { ResourceListItem } from '@/types/resources'

const typeOptionKeys = [
  { labelKey: 'dashboardResources.typeAll', value: 'all' },
  { labelKey: 'dashboardResources.typePdf', value: 'pdf' },
  { labelKey: 'dashboardResources.typeVideo', value: 'video' },
  { labelKey: 'dashboardResources.typeAudio', value: 'audio' },
  { labelKey: 'dashboardResources.typeImage', value: 'image' },
  { labelKey: 'dashboardResources.typeDocument', value: 'document' },
  { labelKey: 'dashboardResources.typeLink', value: 'link' },
  { labelKey: 'dashboardResources.typeDownload', value: 'download' },
]

type ResourceWithTags = ResourceListItem & {
  resource_tags?: Array<{
    tag?: {
      id: string
      name: string
      slug: string
    } | null
  }>
}

export default function DashboardResourcesPage() {
  const { t } = useTranslation()
  const [resources, setResources] = useState<ResourceWithTags[]>([])
  const [categories, setCategories] = useState<ResourceCategory[]>([])
  const [tags, setTags] = useState<TagRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  useEffect(() => {
    let active = true

    const loadData = async () => {
      try {
        setLoading(true)
        const [resourcesData, categoriesData, tagsData] = await Promise.all([
          getPublishedResources(),
          getActiveResourceCategories(),
          getActiveTags(),
        ])

        if (!active) return

        setResources(resourcesData as unknown as ResourceWithTags[])
        setCategories(categoriesData)
        setTags(tagsData)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : t('dashboardResources.errorFallback'))
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadData()

    return () => {
      active = false
    }
  }, [t])

  const filteredResources = useMemo(() => {
    const normalized = query.toLowerCase().trim()

    return resources.filter((resource) => {
      const tagsForResource = resource.resource_tags ?? []

      const matchesQuery =
        !normalized ||
        resource.title.toLowerCase().includes(normalized) ||
        (resource.short_description || resource.description || '')
          .toLowerCase()
          .includes(normalized) ||
        (resource.contributor?.name || '').toLowerCase().includes(normalized) ||
        (resource.category?.name || '').toLowerCase().includes(normalized) ||
        tagsForResource.some((entry) =>
          (entry.tag?.name || '').toLowerCase().includes(normalized),
        )

      const matchesCategory =
        selectedCategory === 'all' || resource.category?.slug === selectedCategory

      const matchesType =
        selectedType === 'all' || resource.resource_type === selectedType

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tagId) =>
          tagsForResource.some((entry) => entry.tag?.id === tagId),
        )

      return matchesQuery && matchesCategory && matchesType && matchesTags
    })
  }, [query, resources, selectedCategory, selectedType, selectedTags])

  const hasActiveFilters =
    query.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedType !== 'all' ||
    selectedTags.length > 0

  const clearFilters = () => {
    setQuery('')
    setSelectedCategory('all')
    setSelectedType('all')
    setSelectedTags([])
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags((current) =>
      current.includes(tagId)
        ? current.filter((id) => id !== tagId)
        : [...current, tagId],
    )
  }

  return (
    <div className="bg-bg text-text-primary">
      <section className="py-2">
        <SectionCard className="p-8">
          <p className="text-sm uppercase tracking-[0.2em] text-brand-primary">
            {t('dashboardResources.badge')}
          </p>
          <h1 className="mt-3 font-heading text-4xl md:text-5xl">
            {t('dashboardResources.title')}
          </h1>
          <p className="mt-4 max-w-2xl font-body text-lg text-brand-primary">
            {t('dashboardResources.subtitle')}
          </p>
        </SectionCard>
      </section>

      <section className="py-8">
        <SectionCard className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
              <Filter className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-lg text-text-primary">{t('dashboardResources.filters')}</h2>
              <p className="text-sm text-brand-primary">
                {t('dashboardResources.filterHelp')}
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder={t('dashboardResources.searchPlaceholder')}
            />

            <AppSelect
              value={selectedCategory}
              onChange={setSelectedCategory}
            >
              <option value="all">{t('dashboardResources.allCategories')}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </AppSelect>

            <AppSelect
              value={selectedType}
              onChange={setSelectedType}
            >
              {typeOptionKeys.map((type) => (
                <option key={type.value} value={type.value}>
                  {t(type.labelKey)}
                </option>
              ))}
            </AppSelect>
          </div>

          {tags.length > 0 ? (
            <div className="mt-4">
              <div className="mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4 text-brand-primary" />
                <p className="text-sm font-medium text-text-primary">{t('dashboardResources.tags')}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                {tags.map((tag) => {
                  const active = selectedTags.includes(tag.id)

                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={[
                        'rounded-full border px-4 py-2 text-sm font-medium transition',
                        active
                          ? 'border-brand-primary bg-brand-primary text-white'
                          : 'border-surface-border bg-bg-soft text-text-primary hover:bg-surface-hover',
                      ].join(' ')}
                    >
                      {tag.name}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}

          {hasActiveFilters ? (
            <div className="mt-4">
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-2xl border border-surface-border bg-bg-soft px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-hover"
              >
                {t('dashboardResources.clear')}
              </button>
            </div>
          ) : null}
        </SectionCard>
      </section>

      <section className="py-2">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-3xl border border-surface-border bg-surface p-5 shadow-[var(--shadow-soft)]"
              >
                <div className="mb-4 aspect-[4/3] rounded-2xl bg-bg-soft" />
                <div className="h-5 w-20 rounded bg-bg-soft" />
                <div className="mt-4 h-6 w-3/4 rounded bg-bg-soft" />
                <div className="mt-2 h-4 w-full rounded bg-bg-soft" />
                <div className="mt-2 h-4 w-2/3 rounded bg-bg-soft" />
              </div>
            ))}
          </div>
        ) : error ? (
          <SectionCard className="border-red-500/20 bg-red-500/10 p-6">
            <h2 className="font-heading text-xl">{t('dashboardResources.errorTitle')}</h2>
            <p className="mt-2 text-sm text-brand-primary">{error}</p>
          </SectionCard>
        ) : filteredResources.length === 0 ? (
          <EmptyState
            icon={<FolderKanban className="h-5 w-5" />}
            title={t('dashboardResources.emptyTitle')}
            description={t('dashboardResources.emptyBody')}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredResources.map((resource) => (
              <div key={resource.id} className="transition-transform duration-200 hover:-translate-y-1">
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
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
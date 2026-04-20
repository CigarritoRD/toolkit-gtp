import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Filter,
  FolderKanban,
  Search,
  SlidersHorizontal,
  Tag,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import ResourceCard from '@/components/resources/ResourceCard'
import FadeIn from '@/components/ui/FadeIn'
import EmptyState from '@/components/ui/EmptyState'
import SearchInput from '@/components/ui/SearchInput'
import AppButton from '@/components/ui/AppButton'
import AppSelect from '@/components/ui/AppSelect'
import SectionCard from '@/components/ui/SectionCard'
import {
  getActiveResourceCategories,
  getPublishedResources,
  type ResourceCategory,
} from '@/lib/api/resources'
import { getActiveTags, type TagRecord } from '@/lib/api/tags'
import { getResourceRatingSummaries } from '@/lib/api/ratings'
import type { ResourceListItem } from '@/types/resources'

type ResourceWithTags = ResourceListItem & {
  resource_tags?: Array<{
    tag?: {
      id: string
      name: string
      slug: string
    } | null
  }>
}

export default function ResourcesPage() {
  const { t } = useTranslation()

  const typeOptions = [
    { label: t('resources.typeAll'), value: 'all' },
    { label: t('resources.typePdf'), value: 'pdf' },
    { label: t('resources.typeVideo'), value: 'video' },
    { label: t('resources.typeAudio'), value: 'audio' },
    { label: t('resources.typeImage'), value: 'image' },
    { label: t('resources.typeDocument'), value: 'document' },
    { label: t('resources.typeLink'), value: 'link' },
    { label: t('resources.typeDownload'), value: 'download' },
  ]

  const [resources, setResources] = useState<ResourceWithTags[]>([])
  const [categories, setCategories] = useState<ResourceCategory[]>([])
  const [tags, setTags] = useState<TagRecord[]>([])
  const [resourceRatings, setResourceRatings] = useState<
    Map<string, { average_rating: number; total_ratings: number }>
  >(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') ?? 'all',
  )
  const [selectedType, setSelectedType] = useState(
    searchParams.get('type') ?? 'all',
  )
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  useEffect(() => {
    let active = true

    const loadPageData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [resourceData, categoryData, tagsData] = await Promise.all([
          getPublishedResources(),
          getActiveResourceCategories(),
          getActiveTags(),
        ])

        if (!active) return
        setResources(resourceData as unknown as ResourceWithTags[])
        setCategories(categoryData)
        setTags(tagsData)
      } catch (err) {
        if (!active) return

        const message =
          err instanceof Error ? err.message : t('resources.errorTitle')

        setError(message)
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadPageData()

    return () => {
      active = false
    }
  }, [t])

  useEffect(() => {
    const nextParams = new URLSearchParams()
    const normalizedQuery = query.trim()

    if (normalizedQuery) {
      nextParams.set('q', normalizedQuery)
    }

    if (selectedCategory !== 'all') {
      nextParams.set('category', selectedCategory)
    }

    if (selectedType !== 'all') {
      nextParams.set('type', selectedType)
    }

    setSearchParams(nextParams, { replace: true })
  }, [query, selectedCategory, selectedType, setSearchParams])

  const filteredResources = useMemo(() => {
    const normalized = query.trim().toLowerCase()

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
      <FadeIn>
        <section className="relative px-6 py-14 md:px-10 lg:px-16 lg:py-16">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-accent/5" />
          <div className="relative mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.22em] text-brand-primary">
                {t('resources.badge')}
              </p>
              <h1 className="mt-3 font-heading text-4xl md:text-5xl">
                {t('resources.title')}
              </h1>
              <p className="mt-4 font-body text-lg leading-8 text-text-secondary">
                {t('resources.subtitle')}
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <SectionCard className="p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                  <FolderKanban className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-heading text-lg">
                  {t('resources.feature1Title')}
                </h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {t('resources.feature1Body')}
                </p>
              </SectionCard>

              <SectionCard className="p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-accent/10 text-brand-accent">
                  <Search className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-heading text-lg">
                  {t('resources.feature2Title')}
                </h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {t('resources.feature2Body')}
                </p>
              </SectionCard>

              <SectionCard className="p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                  <Filter className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-heading text-lg">
                  {t('resources.feature3Title')}
                </h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {t('resources.feature3Body')}
                </p>
              </SectionCard>
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.08}>
        <section className="px-6 pb-10 md:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <SectionCard className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-bg-soft text-brand-primary">
                  <SlidersHorizontal className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-heading text-lg text-text-primary">
                    {t('resources.filters')}
                  </h2>
                  <p className="text-sm text-text-secondary">
                    {t('resources.filterSubtitle')}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
                <SearchInput
                  value={query}
                  onChange={setQuery}
                  placeholder={t('resources.searchPlaceholder')}
                />

                <AppSelect
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">{t('resources.allCategories')}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </AppSelect>

                <AppSelect
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  {typeOptions.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </AppSelect>

                <AppButton
                  variant="secondary"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                >
                  {t('resources.clear')}
                </AppButton>
              </div>

              {tags.length > 0 ? (
                <div className="mt-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-brand-primary" />
                    <p className="text-sm font-medium text-text-primary">
                      {t('resources.tags')}
                    </p>
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
            </SectionCard>
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.12}>
        <section className="px-6 pb-16 md:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse rounded-xl border border-surface-border bg-surface p-5"
                  >
                    <div className="mb-4 h-44 rounded-xl bg-bg-soft" />
                    <div className="mb-3 h-6 w-20 rounded-full bg-bg-soft" />
                    <div className="h-6 w-3/4 rounded bg-bg-soft" />
                    <div className="mt-3 h-4 w-full rounded bg-bg-soft" />
                    <div className="mt-2 h-4 w-2/3 rounded bg-bg-soft" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <SectionCard className="border-red-500/20 bg-red-500/10 p-6">
                <h2 className="font-heading text-xl">
                  {t('resources.errorTitle')}
                </h2>
                <p className="mt-2 text-sm text-text-secondary">{error}</p>
              </SectionCard>
            ) : filteredResources.length === 0 ? (
              <EmptyState
                icon={<FolderKanban className="h-5 w-5" />}
                title={t('resources.noResultsTitle')}
                description={t('resources.noResultsDescription')}
                actionLabel={hasActiveFilters ? t('resources.clear') : undefined}
                onAction={hasActiveFilters ? clearFilters : undefined}
              />
            ) : (
              <>
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-text-secondary">
                      {t('resources.resultsFound', { count: filteredResources.length })}
                    </p>

                    {hasActiveFilters ? (
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-brand-primary">
                        {t('resources.activeFilters')}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredResources.map((resource, index) => (
                    <FadeIn key={resource.id} delay={0.02 * (index % 6)}>
                      <div className="transition-transform duration-200 hover:-translate-y-1">
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
                    </FadeIn>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </FadeIn>
    </div>
  )
}
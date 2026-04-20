import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Search, Sparkles, } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import ResourceCard from '@/components/resources/ResourceCard'
import ContributorCard from '@/components/contributors/ContributorCard'
import FadeIn from '@/components/ui/FadeIn'
import SectionCard from '@/components/ui/SectionCard'
import {
  getActiveResourceCategories,
  getFeaturedResources,
  type ResourceCategory,
} from '@/lib/api/resources'
import { getFeaturedContributors } from '@/lib/api/contributors'
import type { ResourceListItem } from '@/types/resources'
import type { ContributorListItem } from '@/types/contributors'

export default function Home() {
  const { t } = useTranslation()

  const [categories, setCategories] = useState<ResourceCategory[]>([])
  const [resources, setResources] = useState<ResourceListItem[]>([])
  const [contributors, setContributors] = useState<ContributorListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const normalized = searchQuery.trim()

    if (!normalized) {
      navigate('/resources')
      return
    }

    navigate(`/resources?q=${encodeURIComponent(normalized)}`)
  }

  useEffect(() => {
    let active = true

    const loadHomeData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [categoriesData, resourcesData, contributorsData] = await Promise.all([
          getActiveResourceCategories(),
          getFeaturedResources(),
          getFeaturedContributors(),
        ])

        if (!active) return

        setCategories(categoriesData.slice(0, 4))
        setResources(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          resourcesData.map((resource: any) => ({
            ...resource,
            external_url: resource.external_url ?? '',
            file_url: resource.file_url ?? '',
          })),
        )
        setContributors(contributorsData)
      } catch (err) {
        if (!active) return
        const message =
          err instanceof Error ? err.message : t('home.errorTitle')
        setError(message)
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadHomeData()

    return () => {
      active = false
    }
  }, [t])

  return (
    <div className="bg-bg text-text-primary">
      <FadeIn>
        <section className="relative px-6 py-16 md:px-10 lg:px-16 lg:py-20">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-accent/5" />

          <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-brand-primary">
                {t('home.badge')}
              </p>

              <h1 className="mt-5 max-w-4xl font-heading text-4xl leading-tight md:text-5xl lg:text-6xl">
                {t('home.title')}{' '}
                
              </h1>

              <p className="mt-6 max-w-2xl font-body text-lg leading-8 text-brand-primary">
                {t('home.subtitle')}
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/resources"
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  {t('home.exploreResources')}
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/contributors"
                  className="rounded-xl border border-surface-border bg-surface px-5 py-3 text-sm font-semibold text-text-primary transition hover:bg-surface-hover"
                >
                  {t('home.viewContributors')}
                </Link>
              </div>

              <form
                onSubmit={handleSearch}
                className="mt-10 max-w-2xl rounded-xl border border-surface-border bg-surface p-4 shadow-[var(--shadow-soft)]"
              >
                <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-primary" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('home.searchPlaceholder')}
                      className="w-full rounded-xl border border-surface-border bg-bg-soft px-11 py-3 text-sm text-text-primary outline-none placeholder:text-brand-primary focus:border-brand-accent"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    {t('common.search')}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>

            <div className="grid gap-4">
              <SectionCard className="p-6">
                <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-1">
                  <div>
                    <p className="text-sm uppercase tracking-[0.18em] text-brand-primary">
                      {t('home.resourcesCount')}
                    </p>
                    <p className="mt-2 font-heading text-4xl text-text-primary">
                      {resources.length}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm uppercase tracking-[0.18em] text-brand-primary">
                      {t('home.authorsCount')}
                    </p>
                    <p className="mt-2 font-heading text-4xl text-text-primary">
                      {contributors.length}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm uppercase tracking-[0.18em] text-brand-primary">
                      {t('home.topicsCount')}
                    </p>
                    <p className="mt-2 font-heading text-4xl text-text-primary">
                      {categories.length}
                    </p>
                  </div>
                </div>
              </SectionCard>

              <SectionCard className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-heading text-2xl text-text-primary">
                      {t('home.communityTitle')}
                    </h3>
                    <p className="mt-3 text-base leading-7 text-brand-primary">
                      {t('home.communityBody')}
                    </p>
                  </div>
                </div>
              </SectionCard>
            </div>
          </div>
        </section>
      </FadeIn>

      {error ? (
        <section className="px-6 pb-10 md:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl rounded-xl border border-red-500/20 bg-red-500/10 p-6">
            <h2 className="font-heading text-2xl">{t('home.errorTitle')}</h2>
            <p className="mt-2 text-sm text-brand-primary">{error}</p>
          </div>
        </section>
      ) : null}

      <FadeIn delay={0.08}>
        <section className="px-6 py-10 md:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-brand-primary">
                  {t('home.exploreByTopic')}
                </p>
                <h2 className="mt-3 font-heading text-3xl md:text-4xl">
                  {t('home.featuredCategories')}
                </h2>
              </div>

              <Link to="/resources" className="text-sm font-semibold text-brand-primary hover:underline">
                {t('common.viewAll')}
              </Link>
            </div>

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse rounded-xl border border-surface-border bg-surface p-6"
                  >
                    <div className="h-6 w-28 rounded bg-bg-soft" />
                    <div className="mt-4 h-4 w-36 rounded bg-bg-soft" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/resources?category=${encodeURIComponent(category.slug)}`}
                    className="group rounded-xl border border-surface-border bg-surface p-6 shadow-[var(--shadow-soft)] transition hover:bg-surface-hover hover:border-brand-primary"
                  >
                    <p className="text-sm uppercase tracking-[0.18em] text-brand-primary">
                      {t('home.explore')}
                    </p>

                    <h3 className="mt-4 font-heading text-2xl text-text-primary">
                      {category.name}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-brand-primary">
                      {t('home.exploreCategory', {
                        category: category.name.toLowerCase(),
                      })}
                    </p>

                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-accent">
                      {t('home.explore')}
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.12}>
        <section className="px-6 py-10 md:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-brand-primary">
                  {t('home.featuredSelection')}
                </p>
                <h2 className="mt-3 font-heading text-3xl md:text-4xl">
                  {t('home.recommendedResources')}
                </h2>
              </div>

              <Link to="/resources" className="text-sm font-semibold text-brand-primary hover:underline">
                {t('common.viewAll')}
              </Link>
            </div>

            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse rounded-xl border border-surface-border bg-surface p-5"
                  >
                    <div className="mb-4 h-44 rounded-xl bg-bg-soft" />
                    <div className="h-6 w-3/4 rounded bg-bg-soft" />
                    <div className="mt-3 h-4 w-full rounded bg-bg-soft" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {resources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    id={resource.id}
                    title={resource.title}
                    description={resource.short_description || resource.description}
                    thumbnailUrl={resource.thumbnail_url}
                    type={resource.resource_type}
                    contributorName={resource.contributor?.name ?? null}
                    slug={resource.slug}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.16}>
        <section className="px-6 py-10 md:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-brand-primary">
                  {t('home.communityLabel')}
                </p>
                <h2 className="mt-3 font-heading text-3xl md:text-4xl">
                  {t('home.featuredContributors')}
                </h2>
              </div>

              <Link
                to="/contributors"
                className="text-sm font-semibold text-brand-primary hover:underline"
              >
                {t('common.viewAll')}
              </Link>
            </div>

            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse rounded-xl border border-surface-border bg-surface p-6"
                  >
                    <div className="h-16 w-16 rounded-xl bg-bg-soft" />
                    <div className="mt-4 h-5 w-2/3 rounded bg-bg-soft" />
                    <div className="mt-3 h-4 w-full rounded bg-bg-soft" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {contributors.map((contributor) => (
                  <ContributorCard
                    key={contributor.id}
                    name={contributor.name}
                    slug={contributor.slug}
                    shortBio={contributor.short_bio}
                    specialty={contributor.specialty}
                    avatarUrl={contributor.avatar_url}
                    websiteUrl={contributor.website_url}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.2}>
        <section className="px-6 py-14 md:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <SectionCard className="p-8 md:p-10 border-t-2 border-brand-primary">
              <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-brand-primary">
                    {t('home.contributorCtaBadge')}
                  </p>

                  <h2 className="mt-4 max-w-3xl font-heading text-3xl md:text-4xl">
                    {t('home.contributorCtaTitle')}
                  </h2>

                  <p className="mt-4 max-w-2xl text-base leading-7 text-brand-primary">
                    {t('home.contributorCtaSubtitle')}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-4">
                    <Link
                      to="/become-a-contributor"
                      className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                      {t('home.becomeContributor')}
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                    <Link
                      to="/contributors"
                      className="rounded-xl border border-surface-border bg-surface px-5 py-3 text-sm font-semibold text-text-primary transition hover:bg-surface-hover"
                    >
                      {t('home.viewContributors')}
                    </Link>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-xl border border-surface-border bg-bg-soft p-5 hover:border-brand-primary transition">
                    <h3 className="font-heading text-2xl text-text-primary">
                      {t('home.contributorCtaPoint1Title')}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-brand-primary">
                      {t('home.contributorCtaPoint1Body')}
                    </p>
                  </div>

                  <div className="rounded-xl border border-surface-border bg-bg-soft p-5 hover:border-brand-primary transition">
                    <h3 className="font-heading text-2xl text-text-primary">
                      {t('home.contributorCtaPoint2Title')}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-brand-primary">
                      {t('home.contributorCtaPoint2Body')}
                    </p>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        </section>
      </FadeIn>
    </div>
  )
}
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Search, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import ResourceCard from '@/components/resources/ResourceCard'
import ContributorCard from '@/components/contributors/ContributorCard'
import SectionCard from '@/components/ui/SectionCard'

import {
  getActiveResourceCategories,
  getFeaturedResources,
  type ResourceCategory,
} from '@/lib/api/resources'
import { getFeaturedContributors } from '@/lib/api/contributors'
import {
  getContributorRatingSummaries,
  getResourceRatingSummaries,
} from '@/lib/api/ratings'
import {
  getPublicPlatformStats,
  type PublicPlatformStats,
} from '@/lib/api/analytics'

import type { ResourceListItem } from '@/types/resources'
import type { ContributorListItem } from '@/types/contributors'

type RatingMap = Map<
  string,
  {
    average_rating: number
    total_ratings: number
  }
>

export default function Home() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const categoriesCarouselRef = useRef<HTMLDivElement | null>(null)

  const scrollCategories = (direction: 'left' | 'right') => {
    const carousel = categoriesCarouselRef.current

    if (!carousel) return

    carousel.scrollBy({
      left: direction === 'left' ? -320 : 320,
      behavior: 'smooth',
    })
  }
  const [categories, setCategories] = useState<ResourceCategory[]>([])
  const [resources, setResources] = useState<ResourceListItem[]>([])
  const [contributors, setContributors] = useState<ContributorListItem[]>([])
  const [resourceRatings, setResourceRatings] = useState<RatingMap>(new Map())
  const [contributorRatings, setContributorRatings] = useState<RatingMap>(
    new Map(),
  )

  const [stats, setStats] = useState<PublicPlatformStats>({
    resourcesCount: 0,
    contributorsCount: 0,
    categoriesCount: 0,
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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

        const [categoriesData, resourcesData, contributorsData, statsData] =
          await Promise.all([
            getActiveResourceCategories(),
            getFeaturedResources(),
            getFeaturedContributors(),
            getPublicPlatformStats(),
          ])

        if (!active) return

        const normalizedResources = resourcesData.map((resource: any) => ({
          ...resource,
          external_url: resource.external_url ?? '',
          file_url: resource.file_url ?? '',
        }))

        setCategories(categoriesData)
        setResources(normalizedResources)
        setContributors(contributorsData)

        setStats({
          ...statsData,
          categoriesCount: categoriesData.length,
        })
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

  useEffect(() => {
    if (resources.length === 0 || contributors.length === 0) return

    let active = true

    const loadRatings = async () => {
      try {
        const [resourceRatingsMap, contributorRatingsMap] = await Promise.all([
          getResourceRatingSummaries(
             
            resources.map((resource: any) => resource.id),
          ),
          getContributorRatingSummaries(
             
            contributors.map((contributor: any) => contributor.id),
          ),
        ])

        if (active) {
          setResourceRatings(resourceRatingsMap)
          setContributorRatings(contributorRatingsMap)
        }
      } catch {
        // non-blocking: ratings fail silently
      }
    }

    void loadRatings()

    return () => {
      active = false
    }
  }, [resources, contributors])

  return (
    <div className="bg-bg text-text-primary">
      <section className="relative overflow-hidden px-6 py-16 md:px-10 lg:px-16 lg:py-20">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-accent/5" />
          <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-brand-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-brand-accent/10 blur-3xl" />

          <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-brand-primary">
                {t('home.badge')}
              </p>

              <h1 className="mt-5 max-w-4xl font-heading text-4xl leading-tight md:text-5xl lg:text-6xl">
                {t('home.title')}
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
                className="mt-10 max-w-2xl rounded-2xl border border-surface-border bg-surface/90 p-4 shadow-[var(--shadow-soft)] backdrop-blur"
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
                  <StatNumber
                    label={t('home.resourcesCount')}
                    value={stats.resourcesCount}
                  />

                  <StatNumber
                    label={t('home.authorsCount')}
                    value={stats.contributorsCount}
                  />

                  <StatNumber
                    label={t('home.topicsCount')}
                    value={stats.categoriesCount}
                  />
                </div>
              </SectionCard>

              <SectionCard className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
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

      {error ? (
        <section className="px-6 pb-10 md:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl rounded-xl border border-red-500/20 bg-red-500/10 p-6">
            <h2 className="font-heading text-2xl">{t('home.errorTitle')}</h2>
            <p className="mt-2 text-sm text-brand-primary">{error}</p>
          </div>
        </section>
      ) : null}

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

              <Link
                to="/resources"
                className="text-sm font-semibold text-brand-primary hover:underline"
              >
                {t('common.viewAll')}
              </Link>
            </div>

            {loading ? (
              <div className="flex gap-4 overflow-hidden">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="min-w-[250px] animate-pulse rounded-xl border border-surface-border bg-surface p-6 sm:min-w-[280px]"
                  >
                    <div className="h-6 w-28 rounded bg-bg-soft" />
                    <div className="mt-4 h-4 w-36 rounded bg-bg-soft" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative">
                <div className="mb-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => scrollCategories('left')}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-surface-border bg-surface text-brand-primary shadow-[var(--shadow-soft)] transition hover:border-brand-primary hover:bg-surface-hover"
                    aria-label="Scroll categories left"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollCategories('right')}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-surface-border bg-surface text-brand-primary shadow-[var(--shadow-soft)] transition hover:border-brand-primary hover:bg-surface-hover"
                    aria-label="Scroll categories right"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <div
                  ref={categoriesCarouselRef}
                  className="-mx-6 flex snap-x gap-4 overflow-x-auto px-6 pb-4 md:-mx-10 md:px-10 lg:-mx-16 lg:px-16 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/resources?category=${encodeURIComponent(
                        category.slug,
                      )}`}
                      className="group min-w-[250px] max-w-[250px] snap-start rounded-2xl border border-surface-border bg-surface p-6 shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:border-brand-primary hover:bg-surface-hover sm:min-w-[280px] sm:max-w-[280px]"
                    >
                      <p className="text-sm uppercase tracking-[0.18em] text-brand-primary">
                        {t('home.explore')}
                      </p>

                      <h3 className="mt-4 line-clamp-2 font-heading text-2xl text-text-primary">
                        {category.name}
                      </h3>

                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-brand-primary">
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
              </div>
            )}
          </div>
        </section>

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

              <Link
                to="/resources"
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
                    averageRating={
                      resourceRatings.get(resource.id)?.average_rating ?? 0
                    }
                    totalRatings={
                      resourceRatings.get(resource.id)?.total_ratings ?? 0
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </section>

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
                    className="animate-pulse rounded-xl border border-surface-border bg-surface p-5"
                  >
                    <div className="mb-4 h-16 w-16 rounded-full bg-bg-soft" />
                    <div className="h-6 w-2/3 rounded bg-bg-soft" />
                    <div className="mt-3 h-4 w-full rounded bg-bg-soft" />
                    <div className="mt-2 h-4 w-2/3 rounded bg-bg-soft" />
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
                    averageRating={
                      contributorRatings.get(contributor.id)?.average_rating ?? 0
                    }
                    totalRatings={
                      contributorRatings.get(contributor.id)?.total_ratings ?? 0
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </section>

      <section className="px-6 py-14 md:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <SectionCard className="border-t-2 border-brand-primary p-8 md:p-10">
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
                  <div className="rounded-xl border border-surface-border bg-bg-soft p-5 transition hover:border-brand-primary">
                    <h3 className="font-heading text-2xl text-text-primary">
                      {t('home.contributorCtaPoint1Title')}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-brand-primary">
                      {t('home.contributorCtaPoint1Body')}
                    </p>
                  </div>

                  <div className="rounded-xl border border-surface-border bg-bg-soft p-5 transition hover:border-brand-primary">
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
    </div>
  )
}

function StatNumber({ label, value }: { label: string; value: number }) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted) {
          setHasStarted(true)
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [hasStarted])

  useEffect(() => {
    if (!hasStarted || prefersReducedMotion) return

    const duration = 1400
    const startTime = performance.now()
    const startValue = 0

    let rafId: number

    function easeOutQuart(t: number) {
      return 1 - Math.pow(1 - t, 4)
    }

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutQuart(progress)
      const current = Math.floor(startValue + (value - startValue) * eased)

      setCount(current)

      if (progress < 1) {
        rafId = requestAnimationFrame(animate)
      }
    }

    rafId = requestAnimationFrame(animate)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [hasStarted, value, prefersReducedMotion])

  if (prefersReducedMotion) {
    return (
      <div ref={ref}>
        <p className="text-sm uppercase tracking-[0.18em] text-brand-primary">
          {label}
        </p>
        <p className="mt-2 font-heading text-4xl text-text-primary">
          {value.toLocaleString()}
        </p>
      </div>
    )
  }

  return (
    <div ref={ref}>
      <p className="text-sm uppercase tracking-[0.18em] text-brand-primary">
        {label}
      </p>
      <p className="mt-2 font-heading text-4xl text-text-primary">
        {count.toLocaleString()}
      </p>
    </div>
  )
}
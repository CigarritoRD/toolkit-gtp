import { useEffect, useMemo, useState } from 'react'
import { Search, Sparkles, Users, Globe2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import ContributorCard from '@/components/contributors/ContributorCard'
import EmptyState from '@/components/ui/EmptyState'
import SearchInput from '@/components/ui/SearchInput'
import SectionCard from '@/components/ui/SectionCard'
import { getActiveContributors } from '@/lib/api/contributors'
import { getContributorRatingSummaries } from '@/lib/api/ratings'
import type { ContributorListItem } from '@/types/contributors'

type RatingMap = Map<
  string,
  {
    average_rating: number
    total_ratings: number
  }
>

export default function ContributorsPage() {
  const { t } = useTranslation()

  const [contributors, setContributors] = useState<ContributorListItem[]>([])
  const [contributorRatings, setContributorRatings] = useState<RatingMap>(
    new Map(),
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let active = true

const loadContributors = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await getActiveContributors()
        if (!active) return

        setContributors(data)
      } catch (err) {
        if (!active) return

        const message =
          err instanceof Error ? err.message : t('contributors.errorTitle')

        setError(message)
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadContributors()

    return () => {
      active = false
    }
  }, [t])

  useEffect(() => {
    if (contributors.length === 0) return

    let active = true

    const loadRatings = async () => {
      try {
        const ratingsMap = await getContributorRatingSummaries(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          contributors.map((contributor: any) => contributor.id),
        )
        if (active) setContributorRatings(ratingsMap)
      } catch {
        // non-blocking: ratings fail silently
      }
    }

    void loadRatings()

    return () => {
      active = false
    }
  }, [contributors])

  const filteredContributors = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    if (!normalized) return contributors

    return contributors.filter((contributor) => {
      const name = contributor.name.toLowerCase()
      const bio = (contributor.short_bio || '').toLowerCase()
      const specialty = (contributor.specialty || '').toLowerCase()

      return (
        name.includes(normalized) ||
        bio.includes(normalized) ||
        specialty.includes(normalized)
      )
    })
  }, [contributors, query])

  return (
    <div className="bg-bg text-text-primary">
      <section className="relative px-6 py-14 md:px-10 lg:px-16 lg:py-16">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-accent/5" />
          <div className="relative mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.22em] text-brand-primary">
                {t('contributors.badge')}
              </p>
              <h1 className="mt-3 font-heading text-4xl md:text-5xl">
                {t('contributors.title')}
              </h1>
              <p className="mt-4 font-body text-lg leading-8 text-text-secondary">
                {t('contributors.subtitle')}
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <SectionCard className="p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-heading text-lg">
                  {t('contributors.feature1Title')}
                </h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {t('contributors.feature1Body')}
                </p>
              </SectionCard>

              <SectionCard className="p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-accent/10 text-brand-accent">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-heading text-lg">
                  {t('contributors.feature2Title')}
                </h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {t('contributors.feature2Body')}
                </p>
              </SectionCard>

              <SectionCard className="p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                  <Globe2 className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-heading text-lg">
                  {t('contributors.feature3Title')}
                </h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {t('contributors.feature3Body')}
                </p>
              </SectionCard>
            </div>
          </div>
        </section>

      <section className="px-6 pb-8 md:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <SectionCard className="p-5">
              <div className="mb-4">
                <h2 className="font-heading text-lg text-text-primary">
                  {t('contributors.searchTitle')}
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  {t('contributors.searchHelp')}
                </p>
              </div>

              <div className="max-w-xl">
                <SearchInput
                  value={query}
                  onChange={setQuery}
                  placeholder={t('contributors.searchPlaceholder')}
                />
              </div>
            </SectionCard>
          </div>
        </section>

        <section className="px-6 pb-16 md:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse rounded-xl border border-surface-border bg-surface p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 rounded-xl bg-bg-soft" />
                      <div className="flex-1">
                        <div className="h-5 w-2/3 rounded bg-bg-soft" />
                        <div className="mt-3 h-4 w-1/2 rounded bg-bg-soft" />
                      </div>
                    </div>
                    <div className="mt-5 h-4 w-full rounded bg-bg-soft" />
                    <div className="mt-2 h-4 w-5/6 rounded bg-bg-soft" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <SectionCard className="border-red-500/20 bg-red-500/10 p-6">
                <h2 className="font-heading text-xl">
                  {t('contributors.errorTitle')}
                </h2>
                <p className="mt-2 text-sm text-text-secondary">{error}</p>
              </SectionCard>
            ) : filteredContributors.length === 0 ? (
              <EmptyState
                icon={<Search className="h-5 w-5" />}
                title={t('contributors.emptyTitle')}
                description={t('contributors.emptyBody')}
              />
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between gap-4">
                  <p className="text-sm text-text-secondary">
                    {t('contributors.resultsFound', {
                      count: filteredContributors.length,
                    })}
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredContributors.map((contributor) => (
                    <ContributorCard
                      key={contributor.id}
                      name={contributor.name}
                      slug={contributor.slug}
                      shortBio={contributor.short_bio}
                      specialty={contributor.specialty}
                      avatarUrl={contributor.avatar_url}
                      websiteUrl={contributor.website_url}
                      averageRating={
                        contributorRatings.get(contributor.id)?.average_rating ??
                        0
                      }
                      totalRatings={
                        contributorRatings.get(contributor.id)?.total_ratings ??
                        0
                      }
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
    </div>
  )
}
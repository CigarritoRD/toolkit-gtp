import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  Camera,
  MessagesSquare,
  BriefcaseBusiness,
  PlaySquare,
  UserRound,
  BookOpen,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import EmptyState from '@/components/ui/EmptyState'
import SectionCard from '@/components/ui/SectionCard'
import ResourceCard from '@/components/resources/ResourceCard'
import RatingPanel from '@/components/ratings/RatingPanel'
import {
  getContributorBySlug,
  getContributorResources,
  type ContributorDetail,
} from '@/lib/api/contributors'
import { getResourceRatingSummaries } from '@/lib/api/ratings'
import type { ResourceListItem } from '@/types/resources'
import {
  trackContributorEvent,
  type ContributorEventType,
} from '@/lib/api/analytics'

type RatingMap = Map<
  string,
  {
    average_rating: number
    total_ratings: number
  }
>

export default function ContributorDetailPage() {
  const { t } = useTranslation()
  const { slug } = useParams<{ slug: string }>()

  const [contributor, setContributor] = useState<ContributorDetail | null>(null)
  const [resources, setResources] = useState<ResourceListItem[]>([])
  const [resourceRatings, setResourceRatings] = useState<RatingMap>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const loadContributor = async () => {
      if (!slug) {
        setError(t('contributors.notFound'))
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const contributorData = await getContributorBySlug(slug)

        if (!active) return

        if (!contributorData) {
          setContributor(null)
          setResources([])
          setError(t('contributors.notFound'))
          return
        }

        setContributor(contributorData)
        void trackContributorEvent(contributorData.id, 'profile_view')

        const resourceData = await getContributorResources(contributorData.id)

        if (!active) return
        setResources(resourceData)

        const ratingsMap = await getResourceRatingSummaries(
          resourceData.map((item) => item.id),
        )

        if (!active) return
        setResourceRatings(ratingsMap)
      } catch (err) {
        if (!active) return
        setError(
          err instanceof Error ? err.message : t('contributors.detailError'),
        )
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadContributor()

    return () => {
      active = false
    }
  }, [slug, t])

  if (loading) {
    return (
      <div className="bg-bg px-6 py-12 text-text-primary md:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <SectionCard className="animate-pulse p-6">
            <div className="h-6 w-48 rounded bg-bg-soft" />
            <div className="mt-4 h-4 w-80 rounded bg-bg-soft" />
          </SectionCard>
        </div>
      </div>
    )
  }

  if (error || !contributor) {
    return (
      <div className="bg-bg px-6 py-12 text-text-primary md:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <EmptyState
            icon={<UserRound className="h-5 w-5" />}
            title={t('contributors.notFound')}
            description={error || t('contributors.detailError')}
          />
        </div>
      </div>
    )
  }

  const socialLinks: Array<{
    href: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    event: ContributorEventType
  }> = [
    contributor.website_url
      ? {
          href: contributor.website_url,
          label: t('contributors.website'),
          icon: Globe,
          event: 'website_click',
        }
      : null,
    contributor.instagram_url
      ? {
          href: contributor.instagram_url,
          label: 'Instagram',
          icon: Camera,
          event: 'instagram_click',
        }
      : null,
    contributor.facebook_url
      ? {
          href: contributor.facebook_url,
          label: 'Facebook',
          icon: MessagesSquare,
          event: 'facebook_click',
        }
      : null,
    contributor.linkedin_url
      ? {
          href: contributor.linkedin_url,
          label: 'LinkedIn',
          icon: BriefcaseBusiness,
          event: 'linkedin_click',
        }
      : null,
    contributor.youtube_url
      ? {
          href: contributor.youtube_url,
          label: 'YouTube',
          icon: PlaySquare,
          event: 'youtube_click',
        }
      : null,
  ].filter(Boolean) as Array<{
    href: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    event: ContributorEventType
  }>

  return (
    <div className="bg-bg text-text-primary">
      <section className="px-6 py-8 md:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <Link
              to="/contributors"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary transition hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('contributors.back')}
            </Link>
          </div>
        </section>

      <section className="px-6 pb-8 md:px-10 lg:px-16">
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <SectionCard className="p-6 md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start">
                <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-surface-border bg-bg-soft shadow-[var(--shadow-soft)]">
                  {contributor.avatar_url ? (
                    <img
                      src={contributor.avatar_url}
                      alt={contributor.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="font-heading text-3xl text-text-primary">
                      {contributor.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-sm uppercase tracking-[0.22em] text-brand-primary">
                    {t('contributors.badge')}
                  </p>

                  <h1 className="mt-2 font-heading text-3xl md:text-5xl">
                    {contributor.name}
                  </h1>

                  {contributor.specialty ? (
                    <p className="mt-4 text-lg text-text-secondary">
                      {contributor.specialty}
                    </p>
                  ) : null}

                  {contributor.short_bio ? (
                    <p className="mt-4 max-w-3xl text-base leading-7 text-text-secondary">
                      {contributor.short_bio}
                    </p>
                  ) : null}
                </div>
              </div>
            </SectionCard>

            <SectionCard className="p-6">
              <h2 className="font-heading text-2xl text-text-primary">
                {t('contributors.linksTitle')}
              </h2>

              {socialLinks.length === 0 ? (
                <p className="mt-4 text-sm text-text-secondary">
                  {t('contributors.noLinks')}
                </p>
              ) : (
                <div className="mt-4 flex flex-wrap gap-3">
                  {socialLinks.map((item) => {
                    const Icon = item.icon
                    return (
                      <a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => {
                          void trackContributorEvent(contributor.id, item.event)
                        }}
                        className="inline-flex items-center gap-2 rounded-xl border border-surface-border bg-bg-soft px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-hover"
                      >
                        <Icon className="h-4 w-4 text-brand-primary" />
                        {item.label}
                        <ExternalLink className="h-4 w-4 text-text-secondary" />
                      </a>
                    )
                  })}
                </div>
              )}

              <div className="mt-8 rounded-xl border border-surface-border bg-bg-soft p-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-brand-primary" />
                  <p className="text-sm font-medium text-text-primary">
                    {t('contributors.resourcesFrom', { name: contributor.name })}
                  </p>
                </div>
                <p className="mt-2 text-sm text-text-secondary">
                  {resources.length === 1
                    ? t('contributors.resourceCount_one', { count: resources.length })
                    : t('contributors.resourceCount_other', { count: resources.length })}
                </p>
              </div>
            </SectionCard>
          </div>
        </section>

      {contributor.full_bio ? (
        <section className="px-6 pb-8 md:px-10 lg:px-16">
            <div className="mx-auto max-w-6xl">
              <SectionCard className="p-6 md:p-8">
                <h2 className="font-heading text-2xl text-text-primary">
                  {t('contributors.aboutTitle')}
                </h2>
                <p className="mt-4 whitespace-pre-line text-base leading-8 text-text-secondary">
                  {contributor.full_bio}
                </p>
              </SectionCard>
            </div>
          </section>
        ) : null}

        <section className="px-6 pb-8 md:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <RatingPanel mode="contributor" targetId={contributor.id} />
          </div>
        </section>

        <section className="px-6 pb-16 md:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-brand-primary">
                  {t('contributors.resourcesLabel')}
                </p>
                <h2 className="mt-2 font-heading text-2xl md:text-3xl">
                  {t('contributors.resourcesFrom', { name: contributor.name })}
                </h2>
              </div>
            </div>

            {resources.length === 0 ? (
              <EmptyState
                icon={<BookOpen className="h-5 w-5" />}
                title={t('contributors.noResourcesTitle')}
                description={t('contributors.noResources')}
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {resources.map((resource) => (
                  <div key={resource.id} className="transition-transform duration-200 hover:-translate-y-1">
                    <ResourceCard
                      id={resource.id}
                      title={resource.title}
                      description={resource.short_description || resource.description}
                      thumbnailUrl={resource.thumbnail_url}
                      type={resource.resource_type}
                      contributorName={contributor.name}
                      slug={resource.slug}
                      averageRating={
                        resourceRatings.get(resource.id)?.average_rating ?? 0
                      }
                      totalRatings={
                        resourceRatings.get(resource.id)?.total_ratings ?? 0
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
    </div>
  )
}
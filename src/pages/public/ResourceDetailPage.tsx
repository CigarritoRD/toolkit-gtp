import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Bookmark,
  ExternalLink,
  Heart,
  Layers3,
  UserRound,
} from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/auth/useAuth'
import { useResourceActions } from '@/hooks/useResourceActions'
import FadeIn from '@/components/ui/FadeIn'
import EmptyState from '@/components/ui/EmptyState'
import SectionCard from '@/components/ui/SectionCard'
import StatusBadge from '@/components/ui/StatusBadge'
import AppButton from '@/components/ui/AppButton'
import RatingPanel from '@/components/ratings/RatingPanel'
import { getPublishedResourceBySlug } from '@/lib/api/resources'
import { openTrackedResource } from '@/lib/resourceAccess'
import { trackResourceEvent } from '@/lib/api/analytics'

type ResourceDetail = {
  id: string
  title: string
  slug: string
  description: string | null
  short_description: string | null
  full_description?: string | null
  thumbnail_url: string | null
  resource_type: string
  file_url: string | null
  external_url: string | null
  is_downloadable?: boolean | null
  contributor: {
    id: string
    name: string
    slug: string
    short_bio?: string | null
    website_url?: string | null
  } | null
  category?: {
    id: string
    name: string
    slug: string
  } | null
}

function formatTypeLabel(type: string, t: (key: string) => string) {
  const normalized = type.toLowerCase()

  switch (normalized) {
    case 'pdf':
      return t('resources.typePdf')
    case 'video':
      return t('resources.typeVideo')
    case 'audio':
      return t('resources.typeAudio')
    case 'image':
      return t('resources.typeImage')
    case 'link':
      return t('resources.typeLink')
    case 'document':
      return t('resources.typeDocument')
    case 'download':
      return t('resources.typeDownload')
    default:
      return type
  }
}

export default function ResourceDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useTranslation()

  const [resource, setResource] = useState<ResourceDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpening, setIsOpening] = useState(false)

  const {
    saved,
    favorite,
    loadingState,
    toggleSaved,
    toggleFavorite,
  } = useResourceActions({
    userId: user?.id ?? null,
    resourceId: resource?.id ?? null,
  })

  useEffect(() => {
    let active = true

    const loadResource = async () => {
      if (!slug) {
        if (active) {
          setError(t('resourceDetail.errorDescription'))
          setLoading(false)
        }
        return
      }

      try {
        setLoading(true)
        setError(null)

        const data = await getPublishedResourceBySlug(slug)

        if (!active) return

        if (!data) {
          setError(t('resourceDetail.errorDescription'))
          setResource(null)
          return
        }

        setResource(data as unknown as ResourceDetail)
      } catch (err) {
        console.error(err)
        if (active) {
          setError(t('resourceDetail.errorDescription'))
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadResource()

    return () => {
      active = false
    }
  }, [slug, t])

  const description = useMemo(() => {
    return (
      resource?.full_description ||
      resource?.description ||
      resource?.short_description ||
      t('resourceDetail.noDescription')
    )
  }, [resource, t])

  const requireAuth = () => {
    toast.info(t('resourceDetail.loginRequired'))
    navigate('/login')
  }

  const handleToggleSaved = async () => {
    try {
      if (!user) {
        requireAuth()
        return
      }

      const next = await toggleSaved()

      toast.success(
        next
          ? t('resourceDetail.savedAdded')
          : t('resourceDetail.savedRemoved'),
      )
    } catch (err) {
      console.error(err)
      toast.error(t('resourceDetail.savedError'))
    }
  }

  const handleToggleFavorite = async () => {
    try {
      if (!user) {
        requireAuth()
        return
      }

      const next = await toggleFavorite()

      toast.success(
        next
          ? t('resourceDetail.favoriteAdded')
          : t('resourceDetail.favoriteRemoved'),
      )
    } catch (err) {
      console.error(err)
      toast.error(t('resourceDetail.favoriteError'))
    }
  }

  const handleOpenResource = async () => {
    if (!resource) return

    const targetUrl = resource.file_url || resource.external_url

    if (!targetUrl) {
      toast.error(t('resourceDetail.noFile'))
      return
    }

    try {
      if (!user) {
        requireAuth()
        return
      }

      setIsOpening(true)

      await trackResourceEvent(resource.id, 'open')

      await openTrackedResource({
        id: resource.id,
        file_url: resource.file_url,
        external_url: resource.external_url,
      })
    } catch (err) {
      console.error(err)
      toast.error(t('resourceDetail.openError'))
    } finally {
      setIsOpening(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-bg text-text-primary">
        <section className="px-6 py-12 md:px-10 lg:px-16">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="animate-pulse rounded-xl border border-surface-border bg-surface p-6 shadow-[var(--shadow-soft)]">
              <div className="h-80 rounded-xl bg-bg-soft" />
            </div>

            <div className="animate-pulse space-y-4 rounded-xl border border-surface-border bg-surface p-6 shadow-[var(--shadow-soft)]">
              <div className="h-5 w-24 rounded bg-bg-soft" />
              <div className="h-10 w-3/4 rounded bg-bg-soft" />
              <div className="h-4 w-full rounded bg-bg-soft" />
              <div className="h-4 w-5/6 rounded bg-bg-soft" />
              <div className="h-12 w-full rounded-xl bg-bg-soft" />
              <div className="h-12 w-full rounded-xl bg-bg-soft" />
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (error || !resource) {
    return (
      <div className="bg-bg text-text-primary">
        <section className="px-6 py-16 md:px-10 lg:px-16">
          <div className="mx-auto max-w-4xl">
            <EmptyState
              icon={<Layers3 className="h-5 w-5" />}
              title={t('resourceDetail.errorTitle')}
              description={error || t('resourceDetail.errorDescription')}
              actionLabel={t('resourceDetail.back')}
              onAction={() => navigate('/resources')}
            />
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="bg-bg text-text-primary">
      <FadeIn>
        <section className="px-6 py-8 md:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <Link
              to="/resources"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary transition hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('resourceDetail.back')}
            </Link>
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.04}>
        <section className="px-6 pb-8 md:px-10 lg:px-16">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <SectionCard className="overflow-hidden p-0">
              <div className="aspect-[4/3] bg-bg-soft">
                {resource.thumbnail_url ? (
                  <img
                    src={resource.thumbnail_url}
                    alt={resource.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-primary/6 via-transparent to-brand-accent/6">
                    <Layers3 className="h-14 w-14 text-brand-primary/60" />
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard className="p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge
                  label={formatTypeLabel(resource.resource_type, t)}
                  tone="muted"
                />
                <StatusBadge
                  label={
                    resource.file_url || resource.external_url
                      ? t('resourceDetail.available')
                      : t('resourceDetail.pending')
                  }
                  tone={resource.file_url || resource.external_url ? 'success' : 'warning'}
                />
              </div>

              <h1 className="mt-5 font-heading text-3xl md:text-4xl">
                {resource.title}
              </h1>

              <p className="mt-4 text-base leading-8 text-text-secondary">
                {description}
              </p>

              <div className="mt-6 space-y-3 rounded-xl border border-surface-border bg-bg-soft p-4">
                <div className="flex items-start gap-3">
                  <UserRound className="mt-0.5 h-4 w-4 text-brand-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">
                      {t('resourceDetail.contributor')}
                    </p>
                    {resource.contributor ? (
                      <Link
                        to={`/contributors/${resource.contributor.slug}`}
                        className="mt-1 inline-flex text-sm font-semibold text-text-primary transition hover:text-brand-primary"
                      >
                        {resource.contributor.name}
                      </Link>
                    ) : (
                      <p className="mt-1 text-sm text-text-secondary">
                        {t('resourceDetail.notSpecified')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Layers3 className="mt-0.5 h-4 w-4 text-brand-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">
                      {t('resourceDetail.category')}
                    </p>
                    <p className="mt-1 text-sm text-text-primary">
                      {resource.category?.name || t('resourceDetail.notSpecified')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <AppButton
                  onClick={handleOpenResource}
                  disabled={isOpening}
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4" />
                  {isOpening ? t('common.opening') : t('common.open')}
                </AppButton>

                <div className="grid grid-cols-2 gap-3">
                  <AppButton
                    variant="secondary"
                    onClick={handleToggleSaved}
                    disabled={loadingState === 'saved'}
                    className="w-full"
                  >
                    <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
                    {saved ? t('resourceDetail.saved') : t('resourceDetail.save')}
                  </AppButton>

                  <AppButton
                    variant="secondary"
                    onClick={handleToggleFavorite}
                    disabled={loadingState === 'favorite'}
                    className="w-full"
                  >
                    <Heart className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} />
                    {favorite
                      ? t('resourceDetail.favorited')
                      : t('resourceDetail.favorite')}
                  </AppButton>
                </div>
              </div>
            </SectionCard>
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.08}>
        <section className="px-6 pb-16 md:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <RatingPanel mode="resource" targetId={resource.id} />
          </div>
        </section>
      </FadeIn>
    </div>
  )
}
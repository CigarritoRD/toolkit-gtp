import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Bookmark, Download, Heart, Sparkles } from 'lucide-react'
import ResourceCard from '@/components/resources/ResourceCard'
import FadeIn from '@/components/ui/FadeIn'
import EmptyState from '@/components/ui/EmptyState'
import SectionCard from '@/components/ui/SectionCard'
import StatCard from '@/components/ui/StatCard'
import {
  getDashboardStats,
  getRecentDownloads,
  getRecentLibraryResources,
  type DashboardStats,
} from '@/lib/api/dashboard'
import { getResourceRatingSummaries } from '@/lib/api/ratings'
import { useAuth } from '@/auth/useAuth'
import type { ResourceListItem } from '@/types/resources'

type RatingMap = Map<
  string,
  {
    average_rating: number
    total_ratings: number
  }
>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeResource(resource: any): ResourceListItem {
  return {
    ...resource,
    title: resource?.title ?? resource?.resource?.title ?? '',
    slug: resource?.slug ?? resource?.resource?.slug ?? '',
    description:
      resource?.description ??
      resource?.resource?.description ??
      null,
    short_description:
      resource?.short_description ??
      resource?.resource?.short_description ??
      null,
    thumbnail_url:
      resource?.thumbnail_url ??
      resource?.resource?.thumbnail_url ??
      null,
    resource_type:
      resource?.resource_type ??
      resource?.resource?.resource_type ??
      'resource',
    contributor:
      resource?.contributor ??
      resource?.resource?.contributor ??
      null,
  } as ResourceListItem
}

export default function DashboardHomePage() {
  const { user, profile } = useAuth()

  const [stats, setStats] = useState<DashboardStats>({
    savedCount: 0,
    favoriteCount: 0,
    downloadCount: 0,
  })
  const [recentLibrary, setRecentLibrary] = useState<ResourceListItem[]>([])
  const [recentDownloads, setRecentDownloads] = useState<ResourceListItem[]>([])
  const [resourceRatings, setResourceRatings] = useState<RatingMap>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const loadDashboard = async () => {
      if (!user) return

      try {
        setLoading(true)
        setError(null)

        const [statsData, libraryData, downloadData] = await Promise.all([
          getDashboardStats(user.id),
          getRecentLibraryResources(user.id),
          getRecentDownloads(user.id),
        ])

        if (!active) return

        const normalizedLibrary = (libraryData ?? []).map(normalizeResource)
        const normalizedDownloads = (downloadData ?? []).map(normalizeResource)

        setStats(statsData)
        setRecentLibrary(normalizedLibrary)
        setRecentDownloads(normalizedDownloads)

        const allResourceIds = Array.from(
          new Set(
            [...normalizedLibrary, ...normalizedDownloads]
              .map((resource) => resource.id)
              .filter(Boolean),
          ),
        )

        const ratingsMap = await getResourceRatingSummaries(allResourceIds)

        if (!active) return
        setResourceRatings(ratingsMap)
      } catch (err) {
        if (!active) return
        const message =
          err instanceof Error ? err.message : 'No se pudo cargar el dashboard.'
        setError(message)
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadDashboard()

    return () => {
      active = false
    }
  }, [user])

  return (
    <div className="bg-bg text-text-primary">
      <FadeIn>
        <section className="px-0 py-2">
          <div className="mx-auto max-w-7xl">
            <SectionCard className="p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-brand-primary">
                    Dashboard
                  </p>
                  <h1 className="mt-3 font-heading text-4xl md:text-5xl">
                    Bienvenida{profile?.full_name ? `, ${profile.full_name}` : ''}
                  </h1>
                  <p className="mt-4 max-w-2xl font-body text-lg text-brand-primary">
                    Revisa tu actividad, vuelve a tus recursos guardados y continúa
                    explorando desde tu espacio personal.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/resources"
                    className="inline-flex items-center gap-2 rounded-2xl bg-brand-primary px-5 py-3 font-medium text-white transition hover:opacity-90"
                  >
                    Explorar recursos
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    to="/dashboard/library"
                    className="rounded-2xl border border-surface-border bg-bg-soft px-5 py-3 font-medium text-text-primary transition hover:bg-surface-hover"
                  >
                    Ver mi librería
                  </Link>
                </div>
              </div>
            </SectionCard>
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.06}>
        <section className="px-0 py-8">
          <div className="mx-auto max-w-7xl">
            {loading ? (
              <div className="grid gap-6 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse rounded-3xl border border-surface-border bg-surface p-6"
                  >
                    <div className="h-4 w-24 rounded bg-bg-soft" />
                    <div className="mt-4 h-10 w-16 rounded bg-bg-soft" />
                    <div className="mt-4 h-4 w-32 rounded bg-bg-soft" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <SectionCard className="border-red-500/20 bg-red-500/10 p-6">
                <h2 className="font-heading text-xl">No pudimos cargar tu panel</h2>
                <p className="mt-2 text-sm text-brand-primary">{error}</p>
              </SectionCard>
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                <StatCard
                  label="Guardados"
                  value={stats.savedCount}
                  icon={<Bookmark className="h-4 w-4" />}
                />
                <StatCard
                  label="Favoritos"
                  value={stats.favoriteCount}
                  icon={<Heart className="h-4 w-4" />}
                />
                <StatCard
                  label="Descargas"
                  value={stats.downloadCount}
                  icon={<Download className="h-4 w-4" />}
                />
              </div>
            )}
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.1}>
        <section className="px-0 py-4">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-brand-primary">
                  Tu actividad
                </p>
                <h2 className="mt-2 font-heading text-3xl">Recursos recientes</h2>
              </div>
              <Link to="/dashboard/library" className="text-sm text-brand-accent">
                Ver librería
              </Link>
            </div>

            {recentLibrary.length === 0 ? (
              <EmptyState
                icon={<Sparkles className="h-5 w-5" />}
                title="Tu librería está vacía"
                description="Guarda o desbloquea recursos para verlos aquí."
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {recentLibrary.map((resource, index) => (
                  <FadeIn key={resource.id} delay={0.02 * (index % 8)}>
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
            )}
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.14}>
        <section className="px-0 py-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-brand-primary">
                  Historial
                </p>
                <h2 className="mt-2 font-heading text-3xl">Últimas descargas</h2>
              </div>
              <Link to="/dashboard/downloads" className="text-sm text-brand-accent">
                Ver descargas
              </Link>
            </div>

            {recentDownloads.length === 0 ? (
              <EmptyState
                icon={<Download className="h-5 w-5" />}
                title="Aún no tienes descargas"
                description="Cuando descargues recursos, aparecerán aquí."
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {recentDownloads.map((resource, index) => (
                  <FadeIn key={resource.id} delay={0.02 * (index % 8)}>
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
            )}
          </div>
        </section>
      </FadeIn>
    </div>
  )
}
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/auth/useAuth'
import { getUserDownloads, type DashboardResourceItem } from '@/lib/api/dashboard'

export default function DashboardDownloadsPage() {
  const { user } = useAuth()
  const [downloads, setDownloads] = useState<DashboardResourceItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadDownloads = async () => {
      if (!user?.id) {
        if (active) {
          setDownloads([])
          setLoading(false)
        }
        return
      }

      try {
        setLoading(true)
        const data = await getUserDownloads(user.id)

        if (!active) return
        setDownloads(data)
      } catch (error) {
        console.error(error)
        if (active) {
          toast.error('No se pudieron cargar tus descargas.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadDownloads()

    return () => {
      active = false
    }
  }, [user?.id])

  return (
    <div className="bg-bg text-text-primary">
      <section className="py-2">
        <div className="rounded-3xl border border-surface-border bg-surface p-8 shadow-[var(--shadow-soft)]">
          <p className="text-sm uppercase tracking-[0.2em] text-brand-primary">
            Descargas
          </p>
          <h1 className="mt-3 font-heading text-4xl md:text-5xl">
            Mis descargas
          </h1>
          <p className="mt-4 max-w-2xl font-body text-lg text-brand-primary">
            Aquí puedes encontrar los recursos que has descargado recientemente.
          </p>
        </div>
      </section>

      <section className="py-8">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-3xl border border-surface-border bg-surface shadow-[var(--shadow-soft)]"
              >
                <div className="h-44 bg-bg-soft" />
                <div className="p-5">
                  <div className="h-5 w-20 rounded bg-bg-soft" />
                  <div className="mt-4 h-6 w-3/4 rounded bg-bg-soft" />
                  <div className="mt-2 h-4 w-full rounded bg-bg-soft" />
                  <div className="mt-2 h-4 w-2/3 rounded bg-bg-soft" />
                  <div className="mt-5 h-10 w-32 rounded-2xl bg-bg-soft" />
                </div>
              </div>
            ))}
          </div>
        ) : downloads.length === 0 ? (
          <div className="rounded-3xl border border-surface-border bg-surface p-10 text-center shadow-[var(--shadow-soft)]">
            <h2 className="font-heading text-2xl text-text-primary">
              Aún no tienes descargas
            </h2>
            <p className="mt-3 text-brand-primary">
              Cuando descargues recursos, aparecerán aquí para que puedas
              volver a encontrarlos fácilmente.
            </p>

            <Link
              to="/resources"
              className="mt-6 inline-flex rounded-2xl bg-brand-primary px-5 py-3 font-medium text-white shadow-[var(--shadow-soft)] transition hover:opacity-90"
            >
              Explorar recursos
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {downloads.map((resource) => (
              <article
                key={resource.id}
                className="overflow-hidden rounded-3xl border border-surface-border bg-surface shadow-[var(--shadow-soft)] transition hover:shadow-[var(--shadow-card)]"
              >
                <div className="relative h-44 w-full overflow-hidden bg-bg-soft">
                  {resource.thumbnail_url ? (
                    <img
                      src={resource.thumbnail_url}
                      alt={resource.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-brand-primary">
                      Sin miniatura
                    </div>
                  )}

                  <div className="absolute left-3 top-3 rounded-full border border-surface-border bg-surface px-3 py-1 text-xs uppercase tracking-wide text-brand-primary">
                    {resource.resource_type}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-heading text-xl text-text-primary">
                    {resource.title}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm text-brand-primary">
                    {resource.short_description ||
                      resource.description ||
                      'Sin descripción.'}
                  </p>

                  {resource.contributor ? (
                    <p className="mt-4 text-xs text-neutral-muted">
                      Por{' '}
                      <span className="text-text-primary">
                        {resource.contributor.name}
                      </span>
                    </p>
                  ) : null}

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      to={`/resources/${resource.slug}`}
                      className="inline-flex rounded-2xl bg-brand-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                    >
                      Ver recurso
                    </Link>

                    {resource.file_url || resource.external_url ? (
                      <a
                        href={String(resource.file_url || resource.external_url || '#')}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-2xl border border-surface-border bg-bg-soft px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-hover"
                      >
                        Abrir archivo
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
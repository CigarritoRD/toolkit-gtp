import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileSearch, ShieldCheck, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import EmptyState from '@/components/ui/EmptyState'
import SectionCard from '@/components/ui/SectionCard'
import AppButton from '@/components/ui/AppButton'
import SearchInput from '@/components/ui/SearchInput'
import {
  getContributorApplications,
  type ContributorApplicationRecord,
} from '@/lib/api/contributor-applications-admin'

type FilterStatus = 'all' | 'pending_review' | 'approved' | 'rejected'

export default function AdminContributorApplicationsPage() {
  const { t } = useTranslation()

  const [items, setItems] = useState<ContributorApplicationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<FilterStatus>('pending_review')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getContributorApplications(status)
        if (!active) return
        setItems(data)
      } catch (err) {
        if (!active) return
        setError(
          err instanceof Error
            ? err.message
            : t('admin.applications.errorDescription'),
        )
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [status, t])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return items

    return items.filter((item) => {
      return (
        (item.organization_name || '').toLowerCase().includes(normalized) ||
        (item.contact_name || '').toLowerCase().includes(normalized) ||
        (item.contact_email || '').toLowerCase().includes(normalized) ||
        (item.specialty || '').toLowerCase().includes(normalized) ||
        (item.country || '').toLowerCase().includes(normalized) ||
        (item.organization || '').toLowerCase().includes(normalized)
      )
    })
  }, [items, query])

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-brand-primary">
            {t('admin.applications.badge')}
          </p>
          <h1 className="mt-2 font-heading text-3xl md:text-4xl">
            {t('admin.applications.title')}
          </h1>
          <p className="mt-3 text-sm text-text-secondary">
            {t('admin.applications.subtitle')}
          </p>
        </div>
      </div>

      <SectionCard className="p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder={t('admin.applications.searchPlaceholder')}
          />

          <div className="flex flex-wrap gap-2">
            <AppButton
              type="button"
              variant={status === 'pending_review' ? 'primary' : 'secondary'}
              onClick={() => setStatus('pending_review')}
            >
              {t('admin.applications.pending')}
            </AppButton>

            <AppButton
              type="button"
              variant={status === 'approved' ? 'primary' : 'secondary'}
              onClick={() => setStatus('approved')}
            >
              {t('admin.applications.approved')}
            </AppButton>

            <AppButton
              type="button"
              variant={status === 'rejected' ? 'primary' : 'secondary'}
              onClick={() => setStatus('rejected')}
            >
              {t('admin.applications.rejected')}
            </AppButton>

            <AppButton
              type="button"
              variant={status === 'all' ? 'primary' : 'secondary'}
              onClick={() => setStatus('all')}
            >
              {t('admin.applications.all')}
            </AppButton>
          </div>
        </div>
      </SectionCard>

      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SectionCard key={index} className="animate-pulse p-5">
              <div className="h-5 w-48 rounded bg-bg-soft" />
              <div className="mt-3 h-4 w-72 rounded bg-bg-soft" />
            </SectionCard>
          ))}
        </div>
      ) : error ? (
        <SectionCard className="border-red-500/20 bg-red-500/10 p-6">
          <h2 className="font-heading text-xl">
            {t('admin.applications.errorTitle')}
          </h2>
          <p className="mt-2 text-sm text-text-secondary">{error}</p>
        </SectionCard>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FileSearch className="h-5 w-5" />}
          title={t('admin.applications.emptyTitle')}
          description={t('admin.applications.emptyDescription')}
        />
      ) : (
<div className="grid gap-4">
          {filtered.map((item) => (
            <SectionCard key={item.id} className="p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-heading text-xl text-text-primary">
                      {item.organization_name ||
                        item.full_name ||
                        t('admin.applications.unnamed')}
                    </h2>

                    {item.status === 'pending_review' ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                        <FileSearch className="h-3.5 w-3.5" />
                        {t('admin.applications.pending')}
                      </span>
                    ) : null}

                    {item.status === 'approved' ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        {t('admin.applications.approved')}
                      </span>
                    ) : null}

                    {item.status === 'rejected' ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                        <XCircle className="h-3.5 w-3.5" />
                        {t('admin.applications.rejected')}
                      </span>
                    ) : null}
                  </div>

                  {item.full_name ? (
                    <p className="mt-1 text-sm text-text-secondary">
                      {item.full_name}
                    </p>
                  ) : null}

                  {item.specialty ? (
                    <p className="mt-2 text-sm text-text-secondary">
                      {item.specialty}
                    </p>
                  ) : null}
                </div>

                <div>
                  <Link to={`/admin/contributor-applications/${item.id}`}>
                    <AppButton type="button">
                      {t('common.review')}
                    </AppButton>
                  </Link>
                </div>
              </div>
            </SectionCard>
          ))}
</div>
      )}
    </div>
  )
}
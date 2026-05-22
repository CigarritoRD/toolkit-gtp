import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuth } from '@/auth/useAuth'
import {
  getMyContributorResources,
  submitContributorResourceForReview,
  type ContributorResourceListItem,
} from '@/lib/api/contributor-dashboard'
import SectionCard from '@/components/ui/SectionCard'
import AppButton from '@/components/ui/AppButton'
import StatusBadge from '@/components/ui/StatusBadge'
import EmptyState from '@/components/ui/EmptyState'
import { confirmAction } from '@/lib/api/confirm'
import { Inbox, Plus, Send, FileEdit } from 'lucide-react'

export default function ContributorResourcesPage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  const [items, setItems] = useState<ContributorResourceListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!user?.id) return
      try {
        const data = await getMyContributorResources(user.id)
        setItems(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : t('common.error'))
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [user?.id, t])

  async function handleSubmitForReview(item: ContributorResourceListItem) {
    const confirmed = await confirmAction({
      title: t('contributorDashboard.confirmSubmitTitle'),
      text: item.title,
      confirmText: t('contributorDashboard.confirmSubmit'),
    })
    if (!confirmed) return

    try {
      setProcessingId(item.id)
      await submitContributorResourceForReview(item.id)
      const updated = await getMyContributorResources(user!.id)
      setItems(updated)
      toast.success(t('contributorDashboard.submitSuccess'))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setProcessingId(null)
    }
  }

  function formatStatus(item: ContributorResourceListItem) {
    const { approval_status, is_published } = item
    if (approval_status === 'draft') return { label: t('admin.resources.draft'), tone: 'muted' as const }
    if (approval_status === 'pending_review') return { label: t('admin.resources.statusPending'), tone: 'warning' as const }
    if (approval_status === 'rejected') return { label: t('admin.resources.statusRejected'), tone: 'danger' as const }
    if (approval_status === 'approved' && is_published) return { label: t('admin.resources.publishedStatus'), tone: 'success' as const }
    if (approval_status === 'approved' && !is_published) return { label: t('admin.resources.statusApproved'), tone: 'info' as const }
    return { label: approval_status, tone: 'muted' as const }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionCard className="p-6">
          <p className="text-sm text-brand-primary">{t('common.loading')}</p>
        </SectionCard>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-brand-primary">
            {t('contributorDashboard.badge')}
          </p>
          <h1 className="mt-2 font-heading text-3xl md:text-4xl">
            {t('contributorDashboard.myResources')}
          </h1>
          <p className="mt-3 text-sm text-text-secondary">
            {t('contributorDashboard.myResourcesSubtitle')}
          </p>
        </div>

        <Link to="/dashboard/contributor/resources/new">
          <AppButton>
            <Plus className="h-4 w-4" />
            {t('contributorDashboard.newResource')}
          </AppButton>
        </Link>
      </div>

      {error ? (
        <SectionCard className="border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-600">{error}</p>
        </SectionCard>
      ) : items.length === 0 ? (
        <SectionCard className="p-8">
          <EmptyState
            icon={<Inbox className="h-5 w-5" />}
            title={t('contributorDashboard.emptyTitle')}
            description={t('contributorDashboard.emptyDescription')}
            action={
              <Link to="/dashboard/contributor/resources/new">
                <AppButton>
                  <Plus className="h-4 w-4" />
                  {t('contributorDashboard.newResource')}
                </AppButton>
              </Link>
            }
          />
        </SectionCard>
      ) : (
        <SectionCard className="overflow-hidden">
          <div className="divide-y divide-surface-border">
            {items.map((item) => {
              const status = formatStatus(item)
              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {item.thumbnail_url ? (
                      <img
                        src={item.thumbnail_url}
                        alt={item.title}
                        className="h-11 w-11 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-surface-border bg-bg-soft text-sm font-medium text-brand-primary">
                        {item.title.slice(0, 1).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium text-text-primary">
                          {item.title}
                        </p>
                        <StatusBadge label={status.label} tone={status.tone} />
                      </div>
                      <p className="mt-0.5 text-sm text-text-secondary">
                        {item.category?.name ?? t('admin.resources.noCategory')} ·{' '}
                        {item.resource_type ?? t('admin.resources.noType')}
                      </p>
                      {item.rejection_reason && (
                        <p className="mt-1 max-w-xl line-clamp-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-600">
                          {t('contributorDashboard.rejectionReason')}: {item.rejection_reason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    {item.approval_status === 'draft' && (
                      <>
                        <Link to={`/dashboard/contributor/resources/${item.id}/edit`}>
                          <AppButton variant="secondary">
                            <FileEdit className="h-4 w-4" />
                            {t('common.edit')}
                          </AppButton>
                        </Link>
                        <AppButton
                          variant="success"
                          disabled={processingId === item.id}
                          onClick={() => void handleSubmitForReview(item)}
                        >
                          <Send className="h-4 w-4" />
                          {t('contributorDashboard.submit')}
                        </AppButton>
                      </>
                    )}
                    {item.approval_status === 'pending_review' && (
                      <span className="px-3 py-2 text-sm text-brand-primary">
                        {t('contributorDashboard.pendingReview')}
                      </span>
                    )}
                    {item.approval_status === 'rejected' && (
                      <>
                        <Link to={`/dashboard/contributor/resources/${item.id}/edit`}>
                          <AppButton variant="secondary">
                            <FileEdit className="h-4 w-4" />
                            {t('common.edit')}
                          </AppButton>
                        </Link>
                        <AppButton
                          variant="success"
                          disabled={processingId === item.id}
                          onClick={() => void handleSubmitForReview(item)}
                        >
                          <Send className="h-4 w-4" />
                          {t('contributorDashboard.resubmit')}
                        </AppButton>
                      </>
                    )}
                    {item.approval_status === 'approved' && (
                      <Link to={`/resources/${item.slug}`}>
                        <AppButton variant="ghost">
                          {t('admin.resources.view')}
                        </AppButton>
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </SectionCard>
      )}
    </div>
  )
}
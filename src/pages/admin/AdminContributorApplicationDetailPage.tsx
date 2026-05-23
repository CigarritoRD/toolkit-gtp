import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, Mail, Phone, UserSquare2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/auth/useAuth'
import SectionCard from '@/components/ui/SectionCard'
import AppButton from '@/components/ui/AppButton'
import AppTextarea from '@/components/ui/AppTextarea'
import {
  approveContributorApplication,
  getContributorApplicationById,
  rejectContributorApplication,
  type ContributorApplicationRecord,
} from '@/lib/api/contributor-applications-admin'

export default function AdminContributorApplicationDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [item, setItem] = useState<ContributorApplicationRecord | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<'approve' | 'reject' | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      if (!id) {
        setError(t('admin.applicationDetail.missingId'))
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const data = await getContributorApplicationById(id)
        if (!active) return
        setItem(data)
        setAdminNotes(data.admin_notes ?? '')
      } catch (err) {
        if (!active) return
        setError(
          err instanceof Error
            ? err.message
            : t('admin.applicationDetail.errorDescription'),
        )
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [id, t])

  const handleApprove = async () => {
    if (!id || !user?.id) return

    try {
      setProcessing('approve')
      await approveContributorApplication(id, user.id, adminNotes.trim() || undefined)
      toast.success(t('admin.applicationDetail.approveSuccess'))
      navigate('/admin/contributor-applications')
    } catch (err) {
      console.error(err)
      toast.error(t('admin.applicationDetail.approveError'))
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async () => {
    if (!id || !user?.id) return

    try {
      setProcessing('reject')
      await rejectContributorApplication(id, user.id, adminNotes.trim() || undefined)
      toast.success(t('admin.applicationDetail.rejectSuccess'))
      navigate('/admin/contributor-applications')
    } catch (err) {
      console.error(err)
      toast.error(t('admin.applicationDetail.rejectError'))
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return (
      <SectionCard className="animate-pulse p-6">
        <div className="h-6 w-56 rounded bg-bg-soft" />
        <div className="mt-4 h-4 w-80 rounded bg-bg-soft" />
      </SectionCard>
    )
  }

  if (error || !item) {
    return (
      <SectionCard className="border-red-500/20 bg-red-500/10 p-6">
        <h2 className="font-heading text-xl">
          {t('admin.applicationDetail.errorTitle')}
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          {error ?? t('admin.applicationDetail.errorDescription')}
        </p>
      </SectionCard>
    )
  }

  const displayName =
    item.organization_name || item.full_name || t('admin.applicationDetail.unnamed')

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.22em] text-brand-primary">
          {t('admin.applicationDetail.badge')}
        </p>
        <h1 className="mt-2 font-heading text-3xl md:text-4xl">
          {t('admin.applicationDetail.title')}
        </h1>
        <p className="mt-3 text-sm text-text-secondary">
          {t('admin.applicationDetail.subtitle')}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <SectionCard className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-xl border border-surface-border bg-bg-soft shadow-[var(--shadow-soft)]">
                {item.avatar_url ? (
                  <img
                    src={item.avatar_url}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="font-heading text-3xl text-text-primary">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <h2 className="mt-4 font-heading text-2xl">{displayName}</h2>

              {item.country ? (
                <p className="mt-2 text-sm text-text-secondary">{item.country}</p>
              ) : null}

              {item.organization ? (
                <p className="mt-1 text-sm text-text-secondary">
                  {item.organization}
                </p>
              ) : null}
            </div>

            <div className="mt-6 space-y-4 rounded-xl border border-surface-border bg-bg-soft p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-brand-primary">
                  {t('admin.applicationDetail.contactSection')}
                </p>
                <p className="mt-2 font-medium text-text-primary">
                  {item.contact_name || t('admin.applicationDetail.notAvailable')}
                </p>
                {item.contact_role ? (
                  <p className="mt-1 text-sm text-text-secondary">
                    {item.contact_role}
                  </p>
                ) : null}
              </div>

              {item.contact_email ? (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Mail className="h-4 w-4 text-brand-primary" />
                  {item.contact_email}
                </div>
              ) : null}

              {item.contact_phone ? (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Phone className="h-4 w-4 text-brand-primary" />
                  {item.contact_phone}
                </div>
              ) : null}
            </div>
          </SectionCard>

          <SectionCard className="p-6">
            <div className="space-y-6">
              {item.specialty ? (
                <div>
                  <h3 className="font-heading text-lg">
                    {t('admin.applicationDetail.specialty')}
                  </h3>
                  <p className="mt-2 text-sm text-text-secondary">
                    {item.specialty}
                  </p>
                </div>
              ) : null}

              {item.short_bio ? (
                <div>
                  <h3 className="font-heading text-lg">
                    {t('admin.applicationDetail.shortBio')}
                  </h3>
                  <p className="mt-2 text-sm text-text-secondary">
                    {item.short_bio}
                  </p>
                </div>
              ) : null}

              {item.full_bio ? (
                <div>
                  <h3 className="font-heading text-lg">
                    {t('admin.applicationDetail.fullBio')}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-text-secondary">
                    {item.full_bio}
                  </p>
                </div>
              ) : null}

              <div>
                <h3 className="font-heading text-lg">
                  {t('admin.applicationDetail.links')}
                </h3>
                <div className="mt-3 flex flex-wrap gap-3">
                  {item.website_url ? (
                    <a
                      href={item.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-surface-border bg-bg-soft px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-hover"
                    >
                      {t('admin.applicationDetail.website')}
                    </a>
                  ) : null}

                  {item.instagram_url ? (
                    <a
                      href={item.instagram_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-surface-border bg-bg-soft px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-hover"
                    >
                      Instagram
                    </a>
                  ) : null}

                  {item.facebook_url ? (
                    <a
                      href={item.facebook_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-surface-border bg-bg-soft px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-hover"
                    >
                      Facebook
                    </a>
                  ) : null}

                  {item.linkedin_url ? (
                    <a
                      href={item.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-surface-border bg-bg-soft px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-hover"
                    >
                      LinkedIn
                    </a>
                  ) : null}

                  {item.youtube_url ? (
                    <a
                      href={item.youtube_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-surface-border bg-bg-soft px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-hover"
                    >
                      YouTube
                    </a>
                  ) : null}
                </div>
              </div>

              <div className="rounded-xl border border-surface-border bg-bg-soft p-4">
                <div className="flex items-center gap-2">
                  <UserSquare2 className="h-4 w-4 text-brand-primary" />
                  <p className="text-sm font-medium text-text-primary">
                    {t('admin.applicationDetail.approvalBehaviorTitle')}
                  </p>
                </div>
                <p className="mt-2 text-sm text-text-secondary">
                  {t('admin.applicationDetail.approvalBehaviorBody', {
                    name: displayName,
                  })}
                </p>
              </div>

              <AppTextarea
                label={t('admin.applicationDetail.adminNotes')}
                rows={5}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={t('admin.applicationDetail.adminNotesPlaceholder')}
              />

              {item.status === 'pending_review' ? (
                <div className="flex flex-wrap gap-3">
                  <AppButton
                    type="button"
                    onClick={handleApprove}
                    disabled={processing !== null}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {processing === 'approve'
                      ? t('admin.applicationDetail.approving')
                      : t('common.approve')}
                  </AppButton>

                  <AppButton
                    type="button"
                    variant="secondary"
                    onClick={handleReject}
                    disabled={processing !== null}
                  >
                    <XCircle className="h-4 w-4" />
                    {processing === 'reject'
                      ? t('admin.applicationDetail.rejecting')
                      : t('common.reject')}
                  </AppButton>
                </div>
              ) : (
                <div className="rounded-xl border border-surface-border bg-bg-soft px-4 py-3 text-sm text-text-secondary">
                  {t('admin.applicationDetail.alreadyReviewed')}
                </div>
              )}
            </div>
          </SectionCard>
        </div>
    </div>
  )
}
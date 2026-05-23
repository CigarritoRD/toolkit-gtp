import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Link2, UserCheck, AlertCircle } from 'lucide-react'
import ContributorForm from '@/components/admin/ContributorForm'
import type { ContributorFormValues } from '@/schemas/contributor'
import SectionCard from '@/components/ui/SectionCard'
import AppButton from '@/components/ui/AppButton'
import StatusBadge from '@/components/ui/StatusBadge'
import {
  getContributorById,
  updateContributor,
  uploadContributorAvatar,
  linkContributorToUser,
  getUserByEmail,
} from '@/lib/api/contributors'
import { useAuth } from '@/auth/useAuth'
import { parseSubmitError, getSubmitErrorMessage } from '@/lib/formErrors'

type ContributorRecord = {
  id: string
  name: string
  slug: string
  specialty?: string | null
  short_bio?: string | null
  full_bio?: string | null
  avatar_url?: string | null
  website_url?: string | null
  instagram_url?: string | null
  facebook_url?: string | null
  linkedin_url?: string | null
  youtube_url?: string | null
  contact_name?: string | null
  contact_role?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  is_active: boolean
  is_featured: boolean
  user_id: string | null
  access_type: 'account' | 'external'
}

export default function AdminContributorEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user: adminUser } = useAuth()

  const [contributor, setContributor] = useState<ContributorRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [linkEmail, setLinkEmail] = useState('')
  const [linkLoading, setLinkLoading] = useState(false)
  const [linkError, setLinkError] = useState<string | null>(null)

  useEffect(() => {
    async function loadContributor() {
      if (!id) {
        setError(t('admin.contributorForm.missingId'))
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const data = await getContributorById(id)
        setContributor(data as unknown as ContributorRecord)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : t('admin.contributorForm.loadError'),
        )
      } finally {
        setLoading(false)
      }
    }

    void loadContributor()
  }, [id, t])

  async function handleSubmit(
    values: ContributorFormValues,
    files: { thumbnailFile: File | null },
  ) {
    if (!id) {
      setSubmitError(t('admin.contributorForm.missingId'))
      return
    }

    try {
      setSubmitError(null)
      let avatarUrl = values.avatar_url || null

      if (files.thumbnailFile) {
        avatarUrl = await uploadContributorAvatar(files.thumbnailFile, values.slug)
      }

      await updateContributor(id, {
        ...values,
        avatar_url: avatarUrl,
      })

      toast.success(t('admin.contributorForm.updateSuccess'))
      navigate('/admin/contributors')
    } catch (error) {
      console.error(error)
      const errorType = parseSubmitError(error)
      const message = getSubmitErrorMessage(
        errorType,
        t('admin.contributorForm.errors.saveFailed'),
      )
      setSubmitError(message)
    }
  }

  async function handleLinkUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!id || !adminUser?.id || !linkEmail.trim()) return

    setLinkError(null)
    setLinkLoading(true)

    try {
      const user = await getUserByEmail(linkEmail.trim())
      if (!user) {
        setLinkError('No se encontró ningún usuario con ese email.')
        return
      }

      await linkContributorToUser(id, user.id)
      toast.success('Usuario vinculado correctamente.')

      const data = await getContributorById(id)
      setContributor(data as unknown as ContributorRecord)
      setLinkEmail('')
    } catch (err) {
      setLinkError(err instanceof Error ? err.message : 'Error al vincular.')
    } finally {
      setLinkLoading(false)
    }
  }

  if (loading) {
    return (
      <SectionCard className="p-6">
        <p className="text-sm text-text-secondary">{t('common.loading')}</p>
      </SectionCard>
    )
  }

  if (error || !contributor) {
    return (
      <SectionCard className="border-red-200 bg-red-50 p-6">
        <h1 className="text-lg font-semibold text-red-700">
          {t('admin.contributorForm.loadErrorTitle')}
        </h1>
        <p className="mt-2 text-sm text-red-600">
          {error ?? t('admin.contributorForm.notFound')}
        </p>
      </SectionCard>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.22em] text-brand-primary">
          {t('admin.contributorForm.badge')}
        </p>
        <h1 className="mt-2 font-heading text-3xl md:text-4xl">
          {t('admin.contributorForm.editTitle')}
        </h1>
        <p className="mt-3 text-sm text-text-secondary">
          {t('admin.contributorForm.editSubtitle')}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <div className="space-y-6">
          <SectionCard className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-lg">{t('admin.contributorForm.accessTitle')}</h2>
              {contributor.access_type === 'account' ? (
                <StatusBadge
                  label={t('admin.contributorForm.withAccountBadge')}
                  tone="success"
                />
              ) : (
                <StatusBadge
                  label={t('admin.contributorForm.externalBadge')}
                  tone="muted"
                />
              )}
            </div>

            {contributor.access_type === 'account' ? (
              <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                <div className="flex items-center gap-2 font-medium">
                  <UserCheck className="h-4 w-4" />
                  {t('admin.contributorForm.linkedTitle')}
                </div>
                <p>{t('admin.contributorForm.linkedDescription')}</p>
                <p className="text-xs text-emerald-600">
                  ID de usuario: {contributor.user_id}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <div className="flex items-center gap-2 font-medium">
                    <AlertCircle className="h-4 w-4" />
                    {t('admin.contributorForm.externalTitle')}
                  </div>
                  <p>{t('admin.contributorForm.externalDescription')}</p>
                </div>

                <form onSubmit={handleLinkUser} className="space-y-3">
                  <label className="block">
                    <span className="text-sm font-medium text-text-primary">
                      {t('admin.contributorForm.linkUserLabel')}
                    </span>
                    <input
                      type="email"
                      value={linkEmail}
                      onChange={(e) => setLinkEmail(e.target.value)}
                      placeholder="email@ejemplo.com"
                      className="mt-1 w-full rounded-xl border border-surface-border bg-bg px-4 py-2 text-sm"
                    />
                  </label>

                  {linkError && (
                    <p className="text-xs text-red-600">{linkError}</p>
                  )}

                  <AppButton type="submit" disabled={linkLoading || !linkEmail.trim()}>
                    <Link2 className="h-4 w-4" />
                    {linkLoading
                      ? t('admin.contributorForm.linking')
                      : t('admin.contributorForm.linkButton')}
                  </AppButton>
                </form>
              </div>
            )}
          </SectionCard>
        </div>

        <SectionCard className="p-6">
          <ContributorForm
            initialValues={{
              name: contributor.name,
              slug: contributor.slug,
              specialty: contributor.specialty ?? '',
              short_bio: contributor.short_bio ?? '',
              full_bio: contributor.full_bio ?? '',
              avatar_url: contributor.avatar_url ?? '',
              website_url: contributor.website_url ?? '',
              instagram_url: contributor.instagram_url ?? '',
              facebook_url: contributor.facebook_url ?? '',
              linkedin_url: contributor.linkedin_url ?? '',
              youtube_url: contributor.youtube_url ?? '',
              contact_name: contributor.contact_name ?? '',
              contact_role: contributor.contact_role ?? '',
              contact_email: contributor.contact_email ?? '',
              contact_phone: contributor.contact_phone ?? '',
              is_active: contributor.is_active,
              is_featured: contributor.is_featured,
            }}
            onSubmit={handleSubmit}
            submitLabel={t('admin.contributorForm.editAction')}
            submitError={submitError}
            onClearSubmitError={() => setSubmitError(null)}
          />
        </SectionCard>
      </div>
    </div>
  )
}
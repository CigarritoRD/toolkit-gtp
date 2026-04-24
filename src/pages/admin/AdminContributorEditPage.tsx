import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import ContributorForm, {
  type ContributorFormValues,
} from '@/components/admin/ContributorForm'
import SectionCard from '@/components/ui/SectionCard'
import {
  getContributorById,
  updateContributor,
  uploadContributorAvatar,
} from '@/lib/api/contributors'

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
}

export default function AdminContributorEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [contributor, setContributor] = useState<ContributorRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      toast.error(t('admin.contributorForm.missingId'))
      return
    }

    try {
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
      toast.error(t('admin.contributorForm.updateError'))
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
        />
      </SectionCard>
    </div>
  )
}
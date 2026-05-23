import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { toast } from 'sonner'
import ContributorForm from '@/components/admin/ContributorForm'
import type { ContributorFormValues } from '@/schemas/contributor'
import SectionCard from '@/components/ui/SectionCard'
import {
  createContributor,
  uploadContributorAvatar,
} from '@/lib/api/contributors'
import { parseSubmitError, getSubmitErrorMessage } from '@/lib/formErrors'

export default function AdminContributorCreatePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [submitError, setSubmitError] = useState<string | null>(null)

  async function handleSubmit(
    values: ContributorFormValues,
    files: { thumbnailFile: File | null },
  ) {
    try {
      setSubmitError(null)
      let avatarUrl = values.avatar_url || null

      if (files.thumbnailFile) {
        avatarUrl = await uploadContributorAvatar(files.thumbnailFile, values.slug)
      }

      await createContributor({
        ...values,
        avatar_url: avatarUrl,
      })

      toast.success(t('admin.contributorForm.createSuccess'))
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

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.22em] text-brand-primary">
          {t('admin.contributorForm.badge')}
        </p>
        <h1 className="mt-2 font-heading text-3xl md:text-4xl">
          {t('admin.contributorForm.createTitle')}
        </h1>
        <p className="mt-3 text-sm text-text-secondary">
          {t('admin.contributorForm.createSubtitle')}
        </p>
      </div>

      <SectionCard className="p-6">
        <ContributorForm
          onSubmit={handleSubmit}
          submitLabel={t('admin.contributorForm.createAction')}
          submitError={submitError}
          onClearSubmitError={() => setSubmitError(null)}
        />
      </SectionCard>
    </div>
  )
}
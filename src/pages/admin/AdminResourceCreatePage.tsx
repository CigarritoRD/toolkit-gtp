import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { toast } from 'sonner'
import ResourceForm from '@/components/admin/ResourceForm'
import type { ResourceFormData } from '@/schemas/resource'
import {
  createResource,
  uploadResourceFile,
  uploadResourceThumbnail,
} from '@/lib/api/resources'
import { setResourceTags } from '@/lib/api/tags'
import { parseSubmitError, getSubmitErrorMessage } from '@/lib/formErrors'

export default function AdminResourceCreatePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loadOptionsError, setLoadOptionsError] = useState<string | null>(null)

  async function handleSubmit(
    values: ResourceFormData,
    files: {
      thumbnailFile: File | null
      resourceFile: File | null
    },
  ) {
    try {
      setSubmitError(null)
      let thumbnailUrl = values.thumbnail_url ?? null
      let fileUrl = values.file_url ?? null

      if (files.thumbnailFile) {
        thumbnailUrl = await uploadResourceThumbnail(
          files.thumbnailFile,
          values.slug,
          values.contributor_id,
        )
      }

      if (files.resourceFile) {
        fileUrl = await uploadResourceFile(
          files.resourceFile,
          values.slug,
        )
      }

      const created = await createResource({
        ...values,
        thumbnail_url: thumbnailUrl,
        file_url: fileUrl,
      })

      await setResourceTags(created.id, values.tagIds)

      toast.success(t('admin.resourceForm.createSuccess'))
      navigate('/admin/resources')
    } catch (error) {
      console.error(error)
      const errorType = parseSubmitError(error)
      const message = getSubmitErrorMessage(
        errorType,
        t('admin.resourceForm.errors.saveFailed'),
      )
      setSubmitError(message)
      if (errorType === 'loadOptionsFailed') {
        setLoadOptionsError(message)
      }
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.22em] text-brand-primary">
          {t('admin.resourceForm.badge')}
        </p>
        <h1 className="mt-2 font-heading text-3xl md:text-4xl">
          {t('admin.resourceForm.createTitle')}
        </h1>
        <p className="mt-3 text-sm text-text-secondary">
          {t('admin.resourceForm.createSubtitle')}
        </p>
      </div>

      <ResourceForm
        onSubmit={handleSubmit}
        submitLabel={t('admin.resourceForm.createAction')}
        submitError={submitError}
        onClearSubmitError={() => setSubmitError(null)}
        loadOptionsError={loadOptionsError}
      />
    </div>
  )
}
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import ResourceForm from '@/components/admin/ResourceForm'
import type { ResourceFormData } from '@/schemas/resource'
import {
  getResourceById,
  updateResource,
  uploadResourceFile,
  uploadResourceThumbnail,
  type AdminResourceInput,
} from '@/lib/api/resources'
import SectionCard from '@/components/ui/SectionCard'
import { getResourceTagIds, setResourceTags } from '@/lib/api/tags'

type ResourceRecord = AdminResourceInput & {
  id: string
  file_url?: string | null
  external_url?: string | null
}

export default function AdminResourceEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [resource, setResource] = useState<ResourceRecord | null>(null)
  const [tagIds, setTagIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadResource() {
      if (!id) {
        setError(t('admin.resourceForm.missingId'))
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const [data, resourceTagIds] = await Promise.all([
          getResourceById(id),
          getResourceTagIds(id),
        ])

        setResource(data as ResourceRecord)
        setTagIds(resourceTagIds)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t('admin.resourceForm.loadError'),
        )
      } finally {
        setLoading(false)
      }
    }

    void loadResource()
  }, [id, t])

  async function handleSubmit(
    values: ResourceFormData,
    files: {
      thumbnailFile: File | null
      resourceFile: File | null
    },
  ) {
    if (!id) {
      throw new Error(t('admin.resourceForm.missingId'))
    }

    let thumbnailUrl = values.thumbnail_url ?? resource?.thumbnail_url ?? null
    let fileUrl = values.file_url ?? resource?.file_url ?? null

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
    await updateResource(id, {
      ...values,
      thumbnail_url: thumbnailUrl,
      file_url: fileUrl,
    })

    await setResourceTags(id, values.tagIds)

    toast.success(t('admin.resourceForm.updateSuccess'))
    navigate('/admin/resources')
  }

  if (loading) {
    return (
      <SectionCard className="p-6">
        <p className="text-sm text-brand-primary">{t('common.loading')}</p>
      </SectionCard>
    )
  }

  if (error || !resource) {
    return (
      <SectionCard className="border-red-200 bg-red-50 p-6">
        <h1 className="text-lg font-semibold text-red-700">
          {t('admin.resourceForm.loadErrorTitle')}
        </h1>
        <p className="mt-2 text-sm text-red-600">
          {error ?? t('admin.resourceForm.loadError')}
        </p>
      </SectionCard>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.22em] text-brand-primary">
          {t('admin.resourceForm.badge')}
        </p>
        <h1 className="mt-2 font-heading text-3xl md:text-4xl">
          {t('admin.resourceForm.editTitle')}
        </h1>
        <p className="mt-3 text-sm text-text-secondary">
          {t('admin.resourceForm.editSubtitle')}
        </p>
      </div>

      <ResourceForm
        initialValues={{
          title: resource.title,
          slug: resource.slug,
          full_description: resource.full_description ?? '',
          short_description: resource.short_description ?? '',
          thumbnail_url: resource.thumbnail_url ?? '',
          resource_type: resource.resource_type ?? '',
          contributor_id: resource.contributor_id,
          category_id: resource.category_id,
          file_url: resource.file_url ?? '',
          external_url: resource.external_url ?? '',
          is_featured: resource.is_featured,
          is_public: resource.is_public,
          is_published: resource.is_published,
          tagIds,
        }}
        onSubmit={handleSubmit}
        submitLabel={t('admin.resourceForm.editAction')}
      />
    </div>
  )
}
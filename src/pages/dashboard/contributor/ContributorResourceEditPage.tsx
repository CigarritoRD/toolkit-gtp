import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuth } from '@/auth/useAuth'
import {
  getMyContributorResourceById,
  createContributorResource,
  updateContributorResource,
  getCategories,
  submitContributorResourceForReview,
} from '@/lib/api/contributor-dashboard'
import { uploadResourceFile, uploadResourceThumbnail } from '@/lib/api/resources'
import SectionCard from '@/components/ui/SectionCard'
import AppInput from '@/components/ui/AppInput'
import AppTextarea from '@/components/ui/AppTextarea'
import AppSelect from '@/components/ui/AppSelect'
import AppButton from '@/components/ui/AppButton'
import FileInput from '@/components/ui/FileInput'

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

const RESOURCE_TYPES = [
  { value: 'pdf', label: 'PDF' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'image', label: 'Imagen' },
  { value: 'document', label: 'Documento' },
  { value: 'link', label: 'Enlace' },
  { value: 'download', label: 'Descarga' },
]

export default function ContributorResourceEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuth()
  const userId = user?.id

  const [loading, setLoading] = useState(!!id)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [fullDescription, setFullDescription] = useState('')
  const [resourceType, setResourceType] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [externalUrl, setExternalUrl] = useState('')
  const [isPublic, setIsPublic] = useState(true)

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [resourceFile, setResourceFile] = useState<File | null>(null)

  const isEditing = !!id

  useEffect(() => {
    async function load() {
      try {
        const cats = await getCategories()
        setCategories(cats)
      } catch (err) {
        console.error(err)
      }
    }
    void load()
  }, [])

  useEffect(() => {
    if (!id || !userId) return

    const resourceId = id
    const ownerId = userId

    async function loadResource() {
      try {
        setLoading(true)
        const data = await getMyContributorResourceById(ownerId, resourceId)
        if (!data) {
          setError(t('admin.resourceForm.loadError'))
          return
        }
        setTitle(data.title ?? '')
        setSlug(data.slug ?? '')
        setShortDescription(data.short_description ?? '')
        setFullDescription(data.full_description ?? '')
        setResourceType(data.resource_type ?? '')
        setCategoryId(data.category_id ?? '')
        setThumbnailUrl(data.thumbnail_url ?? '')
        setFileUrl(data.file_url ?? '')
        setExternalUrl(data.external_url ?? '')
        setIsPublic(data.is_public ?? true)
      } catch (err) {
        setError(err instanceof Error ? err.message : t('admin.resourceForm.loadError'))
      } finally {
        setLoading(false)
      }
    }

    void loadResource()
  }, [id, userId, t])

  function updateSlugFromTitle() {
    if (!isEditing && !slug) {
      setSlug(slugify(title))
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!userId) return

    if (!title.trim()) {
      setError(t('admin.resourceForm.validation.title'))
      return
    }
    if (!slug.trim()) {
      setError(t('admin.resourceForm.validation.slug'))
      return
    }
    if (!categoryId) {
      setError(t('admin.resourceForm.validation.category'))
      return
    }

    try {
      setSaving(true)
      setError(null)

      let finalSlug = slug
      if (!isEditing) {
        finalSlug = slugify(slug || title)
      }

      let finalThumbnailUrl = thumbnailUrl
      let finalFileUrl = fileUrl

      if (thumbnailFile) {
        finalThumbnailUrl = await uploadResourceThumbnail(thumbnailFile, finalSlug, userId)
      }

      if (resourceFile) {
        finalFileUrl = await uploadResourceFile(resourceFile, finalSlug)
      }

      if (isEditing && id) {
        await updateContributorResource(userId, id, {
          title: title.trim(),
          slug: finalSlug,
          short_description: shortDescription.trim() || null,
          full_description: fullDescription.trim() || null,
          resource_type: resourceType || null,
          category_id: categoryId,
          thumbnail_url: finalThumbnailUrl || null,
          file_url: finalFileUrl || null,
          external_url: externalUrl.trim() || null,
          is_public: isPublic,
        })
        toast.success(t('admin.resourceForm.updateSuccess'))
        navigate('/dashboard/contributor/resources')
      } else {
        const newResource = await createContributorResource(userId, {
          title: title.trim(),
          slug: finalSlug,
          short_description: shortDescription.trim() || null,
          full_description: fullDescription.trim() || null,
          resource_type: resourceType || null,
          category_id: categoryId,
          thumbnail_url: finalThumbnailUrl || null,
          file_url: finalFileUrl || null,
          external_url: externalUrl.trim() || null,
          is_public: isPublic,
        })

        toast.success(t('contributorDashboard.resourceCreated'))
        navigate(`/dashboard/contributor/resources/${newResource.id}/edit`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveAndSubmit() {
    if (!id) return

    await handleSubmit({ preventDefault: () => {} } as React.FormEvent<HTMLFormElement>)

    try {
      await submitContributorResourceForReview(id)
      toast.success(t('contributorDashboard.submitSuccess'))
      navigate('/dashboard/contributor/resources')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common.error'))
    }
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
      <div>
        <p className="text-sm uppercase tracking-[0.22em] text-brand-primary">
          {t('contributorDashboard.badge')}
        </p>
        <h1 className="mt-2 font-heading text-3xl md:text-4xl">
          {isEditing
            ? t('contributorDashboard.editResource')
            : t('contributorDashboard.newResource')}
        </h1>
        <p className="mt-3 text-sm text-text-secondary">
          {isEditing
            ? t('contributorDashboard.editResourceSubtitle')
            : t('contributorDashboard.newResourceSubtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <SectionCard className="p-6 md:p-8">
          <div className="space-y-4">
            <div>
              <h2 className="font-heading text-lg">{t('contributorDashboard.basicInfo')}</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <AppInput
                  label={t('contributorDashboard.resourceTitle')}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    updateSlugFromTitle()
                  }}
                />
              </div>
              <div>
                <AppInput
                  label={t('contributorDashboard.slug')}
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  hint={t('contributorDashboard.slugHint')}
                />
              </div>
            </div>
            <AppTextarea
              label={t('contributorDashboard.shortDescription')}
              rows={2}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
            />
            <AppTextarea
              label={t('contributorDashboard.fullDescription')}
              rows={6}
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <AppSelect
                label={t('contributorDashboard.category')}
                value={categoryId}
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
                onChange={setCategoryId}
                placeholder={t('contributorDashboard.selectCategory')}
              />
              <AppSelect
                label={t('contributorDashboard.resourceType')}
                value={resourceType}
                options={RESOURCE_TYPES}
                onChange={setResourceType}
                placeholder={t('contributorDashboard.selectType')}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard className="p-6 md:p-8">
          <div className="space-y-4">
            <div>
              <h2 className="font-heading text-lg">{t('contributorDashboard.media')}</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FileInput
                label={t('contributorDashboard.thumbnail')}
                accept="image/*"
                fileName={thumbnailFile?.name ?? null}
                hint="PNG, JPG o WEBP (máx. 2 MB)"
                maxSize={2 * 1024 * 1024}
                onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)}
                onClear={() => setThumbnailFile(null)}
              />
              <FileInput
                label={t('contributorDashboard.file')}
                accept="*"
                fileName={resourceFile?.name ?? null}
                hint="PDF u otro archivo (máx. 50 MB)"
                maxSize={50 * 1024 * 1024}
                onChange={(e) => setResourceFile(e.target.files?.[0] ?? null)}
                onClear={() => setResourceFile(null)}
              />
            </div>
            {thumbnailUrl && !thumbnailFile && (
              <img src={thumbnailUrl} alt="Thumbnail" className="h-20 w-20 rounded-xl object-cover" />
            )}
          </div>
        </SectionCard>

        <SectionCard className="p-6 md:p-8">
          <div className="space-y-4">
            <div>
              <h2 className="font-heading text-lg">{t('contributorDashboard.externalLink')}</h2>
            </div>
            <AppInput
              label={t('contributorDashboard.externalUrl')}
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://..."
            />
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-5 w-5 rounded border-surface-border"
              />
              <span className="text-sm text-text-primary">
                {t('contributorDashboard.isPublic')}
              </span>
            </label>
          </div>
        </SectionCard>

        {error && (
          <SectionCard className="border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </SectionCard>
        )}

        <div className="flex flex-wrap gap-3">
          <AppButton type="submit" disabled={saving}>
            {saving ? t('common.saving') : isEditing ? t('common.save') : t('contributorDashboard.createDraft')}
          </AppButton>
          {isEditing && (
            <AppButton variant="success" onClick={handleSaveAndSubmit} disabled={saving}>
              {t('contributorDashboard.saveAndSubmit')}
            </AppButton>
          )}
          <AppButton variant="secondary" onClick={() => navigate('/dashboard/contributor/resources')}>
            {t('common.cancel')}
          </AppButton>
        </div>
      </form>
    </div>
  )
}
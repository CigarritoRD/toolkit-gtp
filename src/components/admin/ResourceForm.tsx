import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { AdminResourceInput } from '@/lib/api/resources'
import { getActiveContributors } from '@/lib/api/contributors'
import { getActiveCategories } from '@/lib/api/categories'
import { getActiveTags, type TagRecord } from '@/lib/api/tags'
import AppButton from '@/components/ui/AppButton'
import AppInput from '@/components/ui/AppInput'
import AppSelect from '@/components/ui/AppSelect'
import AppTextarea from '@/components/ui/AppTextarea'
import SectionCard from '@/components/ui/SectionCard'
import TagSelector from '@/components/admin/TagSelector'

type ContributorOption = {
  id: string
  name: string
  slug: string
}

type CategoryOption = {
  id: string
  name: string
  slug: string
}

export type ResourceFormValues = AdminResourceInput & {
  file_url?: string | null
  external_url?: string | null
  tagIds: string[]
}

type ResourceFormProps = {
  initialValues?: Partial<ResourceFormValues>
  onSubmit: (
    values: ResourceFormValues,
    files: {
      thumbnailFile: File | null
      resourceFile: File | null
    },
  ) => Promise<void>
  submitLabel?: string
}

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
function UploadBox({
  label,
  helper,
  accept,
  file,
  currentUrl,
  onChange,
}: {
  label: string
  helper: string
  accept?: string
  file: File | null
  currentUrl?: string | null
  onChange: (file: File | null) => void
}) {
  const previewUrl = useMemo(() => {
    if (!file) return null
    return URL.createObjectURL(file)
  }, [file])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const isImage = accept?.includes('image')
  const displayName = file?.name || (currentUrl ? 'Current file uploaded' : '')

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-text-primary">
        {label}
      </label>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-surface-border bg-bg-soft px-6 py-8 text-center transition hover:border-brand-primary/60 hover:bg-brand-primary/5">
        <input
          type="file"
          accept={accept}
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          className="sr-only"
        />

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
          <span className="text-xl">{isImage ? '🖼️' : '📄'}</span>
        </div>

        <p className="mt-4 text-sm font-medium text-text-primary">
          Click to upload
        </p>

        <p className="mt-1 max-w-md text-xs text-text-secondary">
          {helper}
        </p>

        {displayName ? (
          <p className="mt-4 rounded-full bg-white px-4 py-2 text-xs text-text-secondary shadow-sm">
            {displayName}
          </p>
        ) : null}
      </label>

      {isImage && (previewUrl || currentUrl) ? (
        <div className="overflow-hidden rounded-2xl border border-surface-border bg-white p-3">
          <p className="mb-2 text-xs text-text-secondary">
            {previewUrl ? 'New preview' : 'Current thumbnail'}
          </p>
          <img
            src={previewUrl || currentUrl || ''}
            alt="Thumbnail preview"
            className="h-44 w-full rounded-xl object-cover"
          />
        </div>
      ) : null}

      {file ? (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-xs font-medium text-red-600 hover:underline"
        >
          Remove selected file
        </button>
      ) : null}
    </div>
  )
}
export default function ResourceForm({
  initialValues,
  onSubmit,
  submitLabel,
}: ResourceFormProps) {
  const { t } = useTranslation()

  const defaults = useMemo(
    () => ({
      title: initialValues?.title ?? '',
      slug: initialValues?.slug ?? '',
      full_description: initialValues?.full_description ?? '',
      short_description: initialValues?.short_description ?? '',
      thumbnail_url: initialValues?.thumbnail_url ?? '',
      resource_type: initialValues?.resource_type ?? '',
      contributor_id: initialValues?.contributor_id ?? '',
      category_id: initialValues?.category_id ?? '',
      is_featured: initialValues?.is_featured ?? false,
      is_public: initialValues?.is_public ?? true,
      is_published: initialValues?.is_published ?? true,
      file_url: initialValues?.file_url ?? '',
      external_url: initialValues?.external_url ?? '',
      tagIds: initialValues?.tagIds ?? [],
    }),
    [initialValues],
  )

  const [values, setValues] = useState(defaults)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [resourceFile, setResourceFile] = useState<File | null>(null)
  const [contributors, setContributors] = useState<ContributorOption[]>([])
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [tags, setTags] = useState<TagRecord[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadOptions() {
      try {
        setLoadingOptions(true)
        setError(null)

        const [contributorsData, categoriesData, tagsData] = await Promise.all([
          getActiveContributors(),
          getActiveCategories(),
          getActiveTags(),
        ])

        setContributors((contributorsData ?? []) as ContributorOption[])
        setCategories((categoriesData ?? []) as CategoryOption[])
        setTags(tagsData ?? [])
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : t('admin.resourceForm.loadOptionsError'),
        )
      } finally {
        setLoadingOptions(false)
      }
    }

    void loadOptions()
  }, [t])

  function updateField<K extends keyof typeof values>(
    key: K,
    value: (typeof values)[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!values.title.trim()) {
      setError(t('admin.resourceForm.validation.title'))
      return
    }

    if (!values.slug.trim()) {
      setError(t('admin.resourceForm.validation.slug'))
      return
    }

    if (!values.contributor_id) {
      setError(t('admin.resourceForm.validation.contributor'))
      return
    }

    if (!values.category_id) {
      setError(t('admin.resourceForm.validation.category'))
      return
    }

    try {
      setIsSubmitting(true)

      await onSubmit(
        {
          ...values,
          title: values.title.trim(),
          slug: values.slug.trim(),
          full_description: values.full_description?.trim() || null,
          short_description: values.short_description?.trim() || null,
          thumbnail_url: values.thumbnail_url?.trim() || null,
          resource_type: values.resource_type?.trim() || null,
          contributor_id: values.contributor_id,
          category_id: values.category_id,
          file_url: values.file_url?.trim() || null,
          external_url: values.external_url?.trim() || null,
          tagIds: values.tagIds,
        },
        {
          thumbnailFile,
          resourceFile,
        },
      )
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('admin.resourceForm.submitError'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? (
        <SectionCard className="border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </SectionCard>
      ) : null}

      <SectionCard className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className="font-heading text-lg text-text-primary">
              {t('admin.resourceForm.basicInfoTitle')}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              {t('admin.resourceForm.basicInfoBody')}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <AppInput
              label={t('admin.resourceForm.title')}
              value={values.title}
              onChange={(e) => {
                const nextTitle = e.target.value
                const currentSlugMatchesTitle =
                  !values.slug || values.slug === slugify(values.title)

                updateField('title', nextTitle)

                if (currentSlugMatchesTitle) {
                  updateField('slug', slugify(nextTitle))
                }
              }}
              placeholder={t('admin.resourceForm.titlePlaceholder')}
            />

            <AppInput
              label={t('admin.resourceForm.slug')}
              value={values.slug}
              onChange={(e) => updateField('slug', slugify(e.target.value))}
              placeholder={t('admin.resourceForm.slugPlaceholder')}
            />
          </div>

          <AppSelect
            label={t('admin.resourceForm.resourceType')}
            value={values.resource_type}
            onChange={(value) => updateField('resource_type', value)}
          >
            <option value="">{t('admin.resourceForm.selectResourceType')}</option>
            <option value="pdf">PDF</option>
            <option value="guide">{t('resources.typeGuide')}</option>
            <option value="video">{t('resources.typeVideo')}</option>
            <option value="audio">{t('resources.typeAudio')}</option>
            <option value="image">{t('resources.typeImage')}</option>
            <option value="document">{t('resources.typeDocument')}</option>
            <option value="template">{t('resources.typeTemplate')}</option>
            <option value="link">{t('resources.typeLink')}</option>
          </AppSelect>
        </div>
      </SectionCard>

      <SectionCard className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className="font-heading text-lg text-text-primary">
              {t('admin.resourceForm.descriptionsTitle')}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              {t('admin.resourceForm.descriptionsBody')}
            </p>
          </div>

          <AppTextarea
            label={t('admin.resourceForm.shortDescription')}
            rows={3}
            value={values.short_description}
            onChange={(e) => updateField('short_description', e.target.value)}
            placeholder={t('admin.resourceForm.shortDescriptionPlaceholder')}
          />

          <AppTextarea
            label={t('admin.resourceForm.description')}
            rows={6}
            value={values.full_description}
            onChange={(e) => updateField('full_description', e.target.value)}
            placeholder={t('admin.resourceForm.descriptionPlaceholder')}
          />
        </div>
      </SectionCard>

      <SectionCard className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className="font-heading text-lg text-text-primary">
              {t('admin.resourceForm.relationshipsTitle')}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              {t('admin.resourceForm.relationshipsBody')}
            </p>
          </div>

          {loadingOptions ? (
            <p className="text-sm text-text-secondary">{t('common.loading')}</p>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <AppSelect
                  label={t('admin.resourceForm.contributor')}
                  value={values.contributor_id}
                  onChange={(value) => updateField('contributor_id', value)}
                >
                  <option value="">{t('admin.resourceForm.selectContributor')}</option>
                  {contributors.map((contributor) => (
                    <option key={contributor.id} value={contributor.id}>
                      {contributor.name}
                    </option>
                  ))}
                </AppSelect>

                <AppSelect
                  label={t('admin.resourceForm.category')}
                  value={values.category_id}
                  onChange={(value) => updateField('category_id', value)}
                >
                  <option value="">{t('admin.resourceForm.selectCategory')}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </AppSelect>
              </div>

              <TagSelector
                tags={tags}
                value={values.tagIds}
                onChange={(next) => updateField('tagIds', next)}
                helpText={t('admin.resourceForm.tagsHelp')}
              />
            </>
          )}
        </div>
      </SectionCard>

      <SectionCard className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className="font-heading text-lg text-text-primary">
              {t('admin.resourceForm.thumbnailTitle')}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              {t('admin.resourceForm.thumbnailBody')}
            </p>
          </div>

          <div className="space-y-2">
            <UploadBox
              label={t('admin.resourceForm.thumbnail')}
              helper="Upload a clear image for resource cards and public previews. JPG, PNG or WebP recommended."
              accept="image/*"
              file={thumbnailFile}
              currentUrl={values.thumbnail_url}
              onChange={setThumbnailFile}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className="font-heading text-lg text-text-primary">
              {t('admin.resourceForm.accessTitle')}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              {t('admin.resourceForm.accessBody')}
            </p>
          </div>

          <AppInput
            label={t('admin.resourceForm.externalUrl')}
            value={values.external_url}
            onChange={(e) => updateField('external_url', e.target.value)}
            placeholder="https://..."
          />

          <div className="space-y-2">
            <UploadBox
              label={t('admin.resourceForm.resourceFile')}
              helper="Upload the downloadable resource file. PDF is recommended."
              file={resourceFile}
              currentUrl={values.file_url}
              onChange={setResourceFile}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className="font-heading text-lg text-text-primary">
              {t('admin.resourceForm.visibilityTitle')}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              {t('admin.resourceForm.visibilityBody')}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <label className="flex items-center gap-3 rounded-xl border border-surface-border bg-bg-soft px-4 py-3 text-sm text-text-primary">
              <input
                type="checkbox"
                checked={values.is_featured}
                onChange={(e) => updateField('is_featured', e.target.checked)}
              />
              {t('admin.resourceForm.featured')}
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-surface-border bg-bg-soft px-4 py-3 text-sm text-text-primary">
              <input
                type="checkbox"
                checked={values.is_public}
                onChange={(e) => updateField('is_public', e.target.checked)}
              />
              {t('admin.resourceForm.public')}
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-surface-border bg-bg-soft px-4 py-3 text-sm text-text-primary">
              <input
                type="checkbox"
                checked={values.is_published}
                onChange={(e) => updateField('is_published', e.target.checked)}
              />
              {t('admin.resourceForm.published')}
            </label>
          </div>
        </div>
      </SectionCard>

      <div className="flex flex-wrap gap-3">
        <AppButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('common.saving') : submitLabel || t('common.save')}
        </AppButton>
      </div>
    </form>
  )
}
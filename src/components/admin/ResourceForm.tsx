import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resourceFormSchema, type ResourceFormData, generateSlug } from '@/schemas/resource'
import { getActiveContributors } from '@/lib/api/contributors'
import { getActiveCategories } from '@/lib/api/categories'
import { getActiveTags, type TagRecord } from '@/lib/api/tags'
import AppButton from '@/components/ui/AppButton'
import AppInput from '@/components/ui/AppInput'
import AppSelect from '@/components/ui/AppSelect'
import AppTextarea from '@/components/ui/AppTextarea'
import SectionCard from '@/components/ui/SectionCard'
import TagSelector from '@/components/admin/TagSelector'
import UploadBox from '@/components/ui/UploadBox'

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

type ResourceFormProps = {
  initialValues?: Partial<ResourceFormData>
  onSubmit: (
    values: ResourceFormData,
    files: {
      thumbnailFile: File | null
      resourceFile: File | null
    },
  ) => Promise<void>
  submitLabel?: string
}

export default function ResourceForm({
  initialValues,
  onSubmit,
  submitLabel,
}: ResourceFormProps) {
  const { t } = useTranslation()

  const defaultValues = useMemo<ResourceFormData>(
    () => ({
      title: initialValues?.title ?? '',
      slug: initialValues?.slug ?? '',
      short_description: initialValues?.short_description ?? '',
      full_description: initialValues?.full_description ?? '',
      thumbnail_url: initialValues?.thumbnail_url ?? '',
      resource_type: initialValues?.resource_type ?? '',
      contributor_id: initialValues?.contributor_id ?? '',
      category_id: initialValues?.category_id ?? '',
      file_url: initialValues?.file_url ?? '',
      external_url: initialValues?.external_url ?? '',
      is_featured: initialValues?.is_featured ?? false,
      is_public: initialValues?.is_public ?? true,
      is_published: initialValues?.is_published ?? true,
      tagIds: initialValues?.tagIds ?? [],
    }),
    [initialValues],
  )

  const [contributors, setContributors] = useState<ContributorOption[]>([])
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [tags, setTags] = useState<TagRecord[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [resourceFile, setResourceFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ResourceFormData>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues,
    mode: 'onBlur',
  })

  const watchedTitle = watch('title')
  const watchedSlug = watch('slug')

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  useEffect(() => {
    async function loadOptions() {
      try {
        setLoadingOptions(true)
        const [contributorsData, categoriesData, tagsData] = await Promise.all([
          getActiveContributors(),
          getActiveCategories(),
          getActiveTags(),
        ])
        setContributors((contributorsData ?? []) as ContributorOption[])
        setCategories((categoriesData ?? []) as CategoryOption[])
        setTags(tagsData ?? [])
      } catch {
        toast.error(t('admin.resourceForm.loadOptionsError'))
      } finally {
        setLoadingOptions(false)
      }
    }
    void loadOptions()
  }, [t])

  useEffect(() => {
    const currentSlugMatchesTitle = !watchedSlug || watchedSlug === generateSlug(watchedTitle || '')
    if (currentSlugMatchesTitle && watchedTitle) {
      setValue('slug', generateSlug(watchedTitle), { shouldValidate: false })
    }
  }, [watchedTitle, watchedSlug, setValue])

  async function onFormSubmit(data: ResourceFormData) {
    const trimmedData: ResourceFormData = {
      ...data,
      title: data.title.trim(),
      slug: data.slug.trim(),
      short_description: data.short_description?.trim() || undefined,
      full_description: data.full_description?.trim() || undefined,
      thumbnail_url: data.thumbnail_url?.trim() || undefined,
      resource_type: data.resource_type?.trim() || undefined,
      file_url: data.file_url?.trim() || undefined,
      external_url: data.external_url?.trim() || undefined,
    }
    await onSubmit(trimmedData, { thumbnailFile, resourceFile })
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
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
              {...register('title')}
              error={errors.title?.message}
              placeholder={t('admin.resourceForm.titlePlaceholder')}
            />

            <AppInput
              label={t('admin.resourceForm.slug')}
              {...register('slug')}
              error={errors.slug?.message}
              placeholder={t('admin.resourceForm.slugPlaceholder')}
            />
          </div>

          <AppSelect
            label={t('admin.resourceForm.resourceType')}
            {...register('resource_type')}
            error={errors.resource_type?.message}
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
            {...register('short_description')}
            error={errors.short_description?.message}
            placeholder={t('admin.resourceForm.shortDescriptionPlaceholder')}
          />

          <AppTextarea
            label={t('admin.resourceForm.description')}
            rows={6}
            {...register('full_description')}
            error={errors.full_description?.message}
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
                  {...register('contributor_id')}
                  error={errors.contributor_id?.message}
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
                  {...register('category_id')}
                  error={errors.category_id?.message}
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
                value={watch('tagIds')}
                onChange={(next) => setValue('tagIds', next)}
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

          <UploadBox
            label={t('admin.resourceForm.thumbnail')}
            helper="Upload a clear image for resource cards and public previews. JPG, PNG or WebP recommended. Max 2 MB."
            accept="image/*"
            file={thumbnailFile}
            currentUrl={defaultValues.thumbnail_url}
            onChange={setThumbnailFile}
            maxSize={2 * 1024 * 1024}
          />
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
            {...register('external_url')}
            error={errors.external_url?.message}
            placeholder="https://..."
          />

          <UploadBox
            label={t('admin.resourceForm.resourceFile')}
            helper="Upload the downloadable resource file. PDF recommended. Max 25 MB."
            file={resourceFile}
            currentUrl={defaultValues.file_url}
            onChange={setResourceFile}
            maxSize={25 * 1024 * 1024}
          />
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
              <input type="checkbox" {...register('is_featured')} />
              {t('admin.resourceForm.featured')}
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-surface-border bg-bg-soft px-4 py-3 text-sm text-text-primary">
              <input type="checkbox" {...register('is_public')} />
              {t('admin.resourceForm.public')}
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-surface-border bg-bg-soft px-4 py-3 text-sm text-text-primary">
              <input type="checkbox" {...register('is_published')} />
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
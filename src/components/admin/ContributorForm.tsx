import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contributorFormSchema, type ContributorFormData, generateSlug } from '@/schemas/contributor'
import AppButton from '@/components/ui/AppButton'
import AppInput from '@/components/ui/AppInput'
import AppTextarea from '@/components/ui/AppTextarea'
import FileInput from '@/components/ui/FileInput'

type ContributorFormProps = {
  initialValues?: Partial<ContributorFormData>
  onSubmit: (
    values: ContributorFormData,
    files: {
      thumbnailFile: File | null
    },
  ) => Promise<void>
  submitLabel?: string
}

export default function ContributorForm({
  initialValues,
  onSubmit,
  submitLabel,
}: ContributorFormProps) {
  const { t } = useTranslation()
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)

  const defaultValues = useMemo<ContributorFormData>(
    () => ({
      name: initialValues?.name ?? '',
      slug: initialValues?.slug ?? '',
      specialty: initialValues?.specialty ?? '',
      contact_name: initialValues?.contact_name ?? '',
      contact_role: initialValues?.contact_role ?? '',
      contact_email: initialValues?.contact_email ?? '',
      contact_phone: initialValues?.contact_phone ?? '',
      short_bio: initialValues?.short_bio ?? '',
      full_bio: initialValues?.full_bio ?? '',
      website_url: initialValues?.website_url ?? '',
      instagram_url: initialValues?.instagram_url ?? '',
      facebook_url: initialValues?.facebook_url ?? '',
      linkedin_url: initialValues?.linkedin_url ?? '',
      youtube_url: initialValues?.youtube_url ?? '',
      is_active: initialValues?.is_active ?? true,
      is_featured: initialValues?.is_featured ?? false,
      avatar_url: initialValues?.avatar_url ?? '',
    }),
    [initialValues],
  )

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContributorFormData>({
    resolver: zodResolver(contributorFormSchema),
    defaultValues,
    mode: 'onBlur',
  })

  const watchedName = watch('name')
  const watchedSlug = watch('slug')

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  useEffect(() => {
    const currentSlugMatchesName = !watchedSlug || watchedSlug === generateSlug(watchedName)
    if (currentSlugMatchesName && watchedName) {
      setValue('slug', generateSlug(watchedName), { shouldValidate: false })
    }
  }, [watchedName, watchedSlug, setValue])

  async function onFormSubmit(data: ContributorFormData) {
    const trimmedData: ContributorFormData = {
      ...data,
      name: data.name.trim(),
      slug: data.slug.trim(),
      specialty: data.specialty?.trim() || '',
      contact_name: data.contact_name?.trim() || '',
      contact_role: data.contact_role?.trim() || '',
      contact_email: data.contact_email?.trim().toLowerCase() || '',
      contact_phone: data.contact_phone?.trim() || '',
      short_bio: data.short_bio?.trim() || '',
      full_bio: data.full_bio?.trim() || '',
      website_url: data.website_url?.trim() || '',
      instagram_url: data.instagram_url?.trim() || '',
      facebook_url: data.facebook_url?.trim() || '',
      linkedin_url: data.linkedin_url?.trim() || '',
      youtube_url: data.youtube_url?.trim() || '',
    }
    await onSubmit(trimmedData, { thumbnailFile })
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <h2 className="font-heading text-lg text-text-primary">
            {t('admin.contributorForm.basicInfoTitle')}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            {t('admin.contributorForm.basicInfoBody')}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <AppInput
            label={t('admin.contributorForm.name')}
            {...register('name')}
            error={errors.name?.message}
            placeholder={t('admin.contributorForm.namePlaceholder')}
          />

          <AppInput
            label={t('admin.contributorForm.slug')}
            {...register('slug')}
            error={errors.slug?.message}
            placeholder={t('admin.contributorForm.slugPlaceholder')}
          />

          <AppInput
            label={t('admin.contributorForm.specialty')}
            {...register('specialty')}
            error={errors.specialty?.message}
            placeholder={t('admin.contributorForm.specialtyPlaceholder')}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="font-heading text-lg text-text-primary">Thumbnail</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Image shown on contributor cards and public profile.
          </p>
        </div>

        {defaultValues.avatar_url ? (
          <div className="flex items-center gap-4 rounded-2xl border border-surface-border bg-bg-soft p-4">
            <img
              src={defaultValues.avatar_url}
              alt={defaultValues.name || 'Contributor thumbnail'}
              className="h-20 w-20 rounded-2xl object-cover"
            />
            <div>
              <p className="text-sm font-medium text-text-primary">Current thumbnail</p>
              <p className="text-xs text-text-secondary">Upload a new image to replace it.</p>
            </div>
          </div>
        ) : null}

        <FileInput
          label="Thumbnail"
          accept="image/*"
          fileName={thumbnailFile?.name ?? null}
          hint="PNG, JPG or WEBP (máx. 2 MB)"
          maxSize={2 * 1024 * 1024}
          onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)}
          onClear={() => setThumbnailFile(null)}
        />
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="font-heading text-lg text-text-primary">
            {t('admin.contributorForm.contentTitle')}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            {t('admin.contributorForm.contentBody')}
          </p>
        </div>

        <AppTextarea
          label={t('admin.contributorForm.shortBio')}
          {...register('short_bio')}
          error={errors.short_bio?.message}
          placeholder={t('admin.contributorForm.shortBioPlaceholder')}
          rows={3}
        />

        <AppTextarea
          label={t('admin.contributorForm.fullBio')}
          {...register('full_bio')}
          error={errors.full_bio?.message}
          placeholder={t('admin.contributorForm.fullBioPlaceholder')}
          rows={6}
        />
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="font-heading text-lg text-text-primary">Private contact</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Internal information only. This will not be shown publicly.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <AppInput
            label="Contact name"
            {...register('contact_name')}
            error={errors.contact_name?.message}
            placeholder="Main contact person"
          />

          <AppInput
            label="Contact role"
            {...register('contact_role')}
            error={errors.contact_role?.message}
            placeholder="Director, coordinator, representative..."
          />

          <AppInput
            label="Contact email"
            type="email"
            {...register('contact_email')}
            error={errors.contact_email?.message}
            placeholder="contact@email.com"
          />

          <AppInput
            label="Contact phone"
            {...register('contact_phone')}
            error={errors.contact_phone?.message}
            placeholder="+1..."
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="font-heading text-lg text-text-primary">
            {t('admin.contributorForm.linksTitle')}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            {t('admin.contributorForm.linksBody')}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <AppInput
            label={t('admin.contributorForm.website')}
            {...register('website_url')}
            error={errors.website_url?.message}
            placeholder="https://..."
          />

          <AppInput
            label={t('admin.contributorForm.instagram')}
            {...register('instagram_url')}
            error={errors.instagram_url?.message}
            placeholder="https://instagram.com/..."
          />

          <AppInput
            label={t('admin.contributorForm.facebook')}
            {...register('facebook_url')}
            error={errors.facebook_url?.message}
            placeholder="https://facebook.com/..."
          />

          <AppInput
            label={t('admin.contributorForm.linkedin')}
            {...register('linkedin_url')}
            error={errors.linkedin_url?.message}
            placeholder="https://linkedin.com/in/..."
          />

          <AppInput
            label={t('admin.contributorForm.youtube')}
            {...register('youtube_url')}
            error={errors.youtube_url?.message}
            placeholder="https://youtube.com/..."
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="font-heading text-lg text-text-primary">
            {t('admin.contributorForm.visibilityTitle')}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            {t('admin.contributorForm.visibilityBody')}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex items-center gap-3 rounded-xl border border-surface-border bg-bg-soft px-4 py-3 text-sm text-text-primary">
            <input type="checkbox" {...register('is_active')} />
            {t('admin.contributorForm.active')}
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-surface-border bg-bg-soft px-4 py-3 text-sm text-text-primary">
            <input type="checkbox" {...register('is_featured')} />
            {t('admin.contributorForm.featured')}
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <AppButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('common.saving') : submitLabel || t('common.save')}
        </AppButton>
      </div>
    </form>
  )
}
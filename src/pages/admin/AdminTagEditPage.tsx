import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import SectionCard from '@/components/ui/SectionCard'
import AppButton from '@/components/ui/AppButton'
import AppInput from '@/components/ui/AppInput'
import AppTextarea from '@/components/ui/AppTextarea'
import { LoadingState } from '@/components/ui/Skeleton'
import { getTags, updateTag, type TagRecord } from '@/lib/api/tags'

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

export default function AdminTagEditPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [tag, setTag] = useState<TagRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [groupKey, setGroupKey] = useState('')
  const [isActive, setIsActive] = useState(true)

  const generatedSlug = useMemo(() => slugify(name), [name])
  const finalSlug = slug.trim() || generatedSlug

  useEffect(() => {
    async function loadTag() {
      if (!id) {
        setError(t('admin.tagForm.missingId'))
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const allTags = await getTags()
        const found = allTags.find((item) => item.id === id)

        if (!found) {
          setError(t('admin.tagForm.notFound'))
          return
        }

        setTag(found)
        setName(found.name ?? '')
        setSlug(found.slug ?? '')
        setDescription(found.description ?? '')
        setGroupKey(found.group_key ?? '')
        setIsActive(found.is_active ?? true)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t('admin.tagForm.loadError'),
        )
      } finally {
        setLoading(false)
      }
    }

    void loadTag()
  }, [id, t])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!id) {
      toast.error(t('admin.tagForm.missingId'))
      return
    }

    if (!name.trim()) {
      toast.error(t('admin.tagForm.validation.name'))
      return
    }

    if (!finalSlug) {
      toast.error(t('admin.tagForm.validation.slug'))
      return
    }

    try {
      setIsSaving(true)

      await updateTag(id, {
        name: name.trim(),
        slug: finalSlug,
        description: description.trim() || null,
        group_key: groupKey.trim() || null,
        is_active: isActive,
      })

      toast.success(t('admin.tagForm.updateSuccess'))
      navigate('/admin/tags')
    } catch (error) {
      console.error(error)
      toast.error(t('admin.tagForm.updateError'))
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return <LoadingState variant="section" text="Cargando etiqueta..." />
  }

  if (error || !tag) {
    return (
      <SectionCard className="border-red-200 bg-red-50 p-6">
        <h1 className="text-lg font-semibold text-red-700">
          {t('admin.tagForm.loadErrorTitle')}
        </h1>
        <p className="mt-2 text-sm text-red-600">
          {error ?? t('admin.tagForm.loadError')}
        </p>
      </SectionCard>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.22em] text-brand-primary">
          {t('admin.tagForm.badge')}
        </p>
        <h1 className="mt-2 font-heading text-3xl md:text-4xl">
          {t('admin.tagForm.editTitle')}
        </h1>
        <p className="mt-3 text-sm text-text-secondary">
          {t('admin.tagForm.editSubtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <SectionCard className="p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <AppInput
              label={t('admin.tagForm.name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('admin.tagForm.namePlaceholder')}
            />

            <AppInput
              label={t('admin.tagForm.slug')}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder={generatedSlug || t('admin.tagForm.slugPlaceholder')}
            />

            <AppInput
              label={t('admin.tagForm.groupKey')}
              value={groupKey}
              onChange={(e) => setGroupKey(e.target.value)}
              placeholder={t('admin.tagForm.groupKeyPlaceholder')}
            />

            <div className="rounded-xl border border-surface-border bg-bg-soft px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-brand-primary">
                {t('admin.tagForm.previewSlug')}
              </p>
              <p className="mt-2 text-sm text-text-primary">
                {finalSlug || '—'}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <AppTextarea
              label={t('admin.tagForm.description')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('admin.tagForm.descriptionPlaceholder')}
              rows={5}
            />
          </div>

          <div className="mt-5">
            <label className="flex items-center gap-3 rounded-xl border border-surface-border bg-bg-soft px-4 py-3 text-sm text-text-primary">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              {t('admin.tagForm.active')}
            </label>
          </div>
        </SectionCard>

        <div className="flex flex-wrap gap-3">
          <AppButton type="submit" disabled={isSaving}>
            {isSaving ? t('common.saving') : t('admin.tagForm.editAction')}
          </AppButton>

          <AppButton
            type="button"
            variant="secondary"
            onClick={() => navigate('/admin/tags')}
          >
            {t('common.cancel')}
          </AppButton>
        </div>
      </form>
    </div>
  )
}
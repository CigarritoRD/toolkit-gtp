import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import CategoryForm from '@/components/admin/CategoryForm'
import SectionCard from '@/components/ui/SectionCard'
import { LoadingState } from '@/components/ui/Skeleton'
import { getCategoryById, updateCategory } from '@/lib/api/categories'

type CategoryRecord = {
  id: string
  name: string
  slug: string
  is_active: boolean
}

export default function AdminCategoryEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [category, setCategory] = useState<CategoryRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCategory() {
      if (!id) {
        setError(t('admin.categoryForm.missingId'))
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const data = await getCategoryById(id)
        setCategory(data as CategoryRecord)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : t('admin.categoryForm.loadError'),
        )
      } finally {
        setLoading(false)
      }
    }

    void loadCategory()
  }, [id, t])

  async function handleSubmit(values: {
    name: string
    slug: string
    is_active: boolean
  }) {
    if (!id) {
      toast.error(t('admin.categoryForm.missingId'))
      return
    }

    try {
      await updateCategory(id, values)
      toast.success(t('admin.categoryForm.updateSuccess'))
      navigate('/admin/categories')
    } catch (error) {
      console.error(error)
      toast.error(t('admin.categoryForm.updateError'))
    }
  }

  if (loading) {
    return <LoadingState variant="section" text={t('loading.category')} />
  }

  if (error || !category) {
    return (
      <SectionCard className="border-red-200 bg-red-50 p-6">
        <h1 className="text-lg font-semibold text-red-700">
          {t('admin.categoryForm.loadErrorTitle')}
        </h1>
        <p className="mt-2 text-sm text-red-600">
          {error ?? t('admin.categoryForm.notFound')}
        </p>
      </SectionCard>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.22em] text-brand-primary">
          {t('admin.categoryForm.badge')}
        </p>
        <h1 className="mt-2 font-heading text-3xl md:text-4xl">
          {t('admin.categoryForm.editTitle')}
        </h1>
        <p className="mt-3 text-sm text-text-secondary">
          {t('admin.categoryForm.editSubtitle')}
        </p>
      </div>

      <SectionCard className="p-6">
        <CategoryForm
          initialValues={{
            name: category.name,
            slug: category.slug,
            is_active: category.is_active,
          }}
          onSubmit={handleSubmit}
          submitLabel={t('admin.categoryForm.editAction')}
        />
      </SectionCard>
    </div>
  )
}
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/auth/useAuth'
import AppButton from '@/components/ui/AppButton'
import AppTextarea from '@/components/ui/AppTextarea'
import SectionCard from '@/components/ui/SectionCard'
import StarRating from '@/components/ui/StarRating'
import { LoadingState } from '@/components/ui/Skeleton'
import {
  getContributorRatingSummary,
  getContributorReviews,
  getMyContributorRating,
  getMyResourceRating,
  getResourceRatingSummary,
  getResourceReviews,
  upsertContributorRating,
  upsertResourceRating,
  type RatingReview,
  type RatingSummary,
} from '@/lib/api/ratings'

type RatingPanelProps =
  | {
      mode: 'resource'
      targetId: string
    }
  | {
      mode: 'contributor'
      targetId: string
    }

export default function RatingPanel({ mode, targetId }: RatingPanelProps) {
  const { t } = useTranslation()
  const { user } = useAuth()

  const [summary, setSummary] = useState<RatingSummary>({
    average_rating: 0,
    total_ratings: 0,
  })
  const [reviews, setReviews] = useState<RatingReview[]>([])
  const [myRating, setMyRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)

      const [summaryData, reviewsData, mine] =
        mode === 'resource'
          ? await Promise.all([
              getResourceRatingSummary(targetId),
              getResourceReviews(targetId, 10),
              getMyResourceRating(targetId),
            ])
          : await Promise.all([
              getContributorRatingSummary(targetId),
              getContributorReviews(targetId, 10),
              getMyContributorRating(targetId),
            ])

      setSummary(summaryData)
      setReviews(reviewsData)
      setMyRating(Number(mine?.rating ?? 0))
      setReviewText(mine?.review_text ?? '')
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [mode, targetId])

  useEffect(() => {
    void load()
  }, [load])

  async function handleSave() {
    if (!user) {
      toast.info(t('resourceDetail.loginRequired'))
      return
    }

    if (!myRating) {
      toast.error(t('ratings.validation.rating'))
      return
    }

    try {
      setSaving(true)

      if (mode === 'resource') {
        await upsertResourceRating(targetId, myRating, reviewText)
      } else {
        await upsertContributorRating(targetId, myRating, reviewText)
      }

      toast.success(t('ratings.saved'))
      await load()
    } catch (error) {
      console.error(error)
      toast.error(t('ratings.error'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <SectionCard className="p-6 md:p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-brand-primary">
            {t('ratings.badge')}
          </p>
          <h2 className="mt-2 font-heading text-2xl text-text-primary">
            {t('ratings.title')}
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            {loading
              ? <LoadingState variant="inline" />
              : t('ratings.summary', {
                  average: summary.average_rating.toFixed(1),
                  count: summary.total_ratings,
                })}
          </p>
        </div>

        <StarRating value={Math.round(summary.average_rating)} readOnly size="lg" />
      </div>

      {!user ? (
        <div className="mt-6 rounded-xl border border-surface-border bg-bg-soft p-4 text-center">
          <p className="text-sm text-text-secondary">
            {t('ratings.loginRequired')}
          </p>
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-surface-border bg-bg-soft p-4">
          <p className="text-sm font-medium text-text-primary">
            {t('ratings.yourRating')}
          </p>

          <div className="mt-3">
            <StarRating value={myRating} onChange={setMyRating} size="lg" />
          </div>

          <div className="mt-4">
            <AppTextarea
              label={t('ratings.review')}
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder={t('ratings.reviewPlaceholder')}
            />
          </div>

          <div className="mt-4">
            <AppButton onClick={handleSave} disabled={saving}>
              {saving ? t('common.saving') : t('ratings.submit')}
            </AppButton>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-4">
        <h3 className="font-heading text-lg text-text-primary">
          {t('ratings.recentReviews')}
        </h3>

        {reviews.length === 0 ? (
          <p className="text-sm text-text-secondary">{t('ratings.noReviews')}</p>
        ) : (
          reviews.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-surface-border bg-surface p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="font-medium text-text-primary">
                  {item.profile?.full_name || t('ratings.anonymous')}
                </p>
                <StarRating value={item.rating} readOnly size="sm" />
              </div>

              {item.review_text ? (
                <p className="mt-3 text-sm leading-6 text-text-secondary">
                  {item.review_text}
                </p>
              ) : null}
            </div>
          ))
        )}
      </div>
    </SectionCard>
  )
}
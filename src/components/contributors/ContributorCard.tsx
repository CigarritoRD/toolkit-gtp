import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import RatingSummaryBadge from '@/components/ratings/RatingSummaryBadge'

type ContributorCardProps = {
  id?: string
  name: string
  slug: string
  shortBio?: string | null
  avatarUrl?: string | null
  specialty?: string | null
  websiteUrl?: string | null
  averageRating?: number
  totalRatings?: number
}

export default function ContributorCard({
  name,
  slug,
  shortBio,
  avatarUrl,
  specialty,
  websiteUrl,
  averageRating = 0,
  totalRatings = 0,
}: ContributorCardProps) {
  const { t } = useTranslation()

  return (
    <Link to={`/contributors/${slug}`}>
      <motion.article
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="group flex h-full flex-col rounded-xl border border-surface-border bg-surface p-5 shadow-[var(--shadow-soft)] transition duration-300 hover:-translate-y-[3px] hover:bg-surface-hover hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-surface-border bg-bg-soft">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-heading text-xl text-text-primary">
                {name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate font-heading text-lg text-text-primary">
              {name}
            </h3>

            {specialty ? (
              <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
                {specialty}
              </p>
            ) : null}
          </div>
        </div>

        {shortBio ? (
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-text-secondary">
            {shortBio}
          </p>
        ) : null}

        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between gap-3">
            {websiteUrl ? (
              <div className="inline-flex items-center gap-1 text-xs text-text-secondary">
                <Globe className="h-3.5 w-3.5 text-brand-primary" />
                <span className="truncate">
                  {t('contributors.website')}
                </span>
              </div>
            ) : (
              <div />
            )}

            {totalRatings > 0 ? (
              <div className="shrink-0">
                <RatingSummaryBadge
                  average={averageRating}
                  count={totalRatings}
                />
              </div>
            ) : null}
          </div>

          <div className="mt-4 inline-flex text-sm font-medium text-brand-primary transition group-hover:underline">
            {t('contributors.viewProfile')} →
          </div>
        </div>
      </motion.article>
    </Link>
  )
}
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import {
  Bookmark,
  Star,
  FileText,
  Video,
  Music,
  Image as ImageIcon,
  File,
  Link as LinkIcon,
  Download,
} from 'lucide-react'

import { useAuth } from '@/auth/useAuth'
import { useResourceActions } from '@/hooks/useResourceActions'
import { trackResourceEvent } from '@/lib/api/analytics'
import RatingSummaryBadge from '@/components/ratings/RatingSummaryBadge'

type ResourceCardProps = {
  id: string
  title: string
  description?: string | null
  thumbnailUrl?: string | null
  type: string
  contributorName?: string | null
  slug?: string
  averageRating?: number
  totalRatings?: number
}

function getTypeLabel(type?: string | null, t?: (key: string) => string) {
  const normalized = (type ?? '').toLowerCase()

  switch (normalized) {
    case 'pdf':
      return t ? t('resources.typePdf') : 'PDF'
    case 'video':
      return t ? t('resources.typeVideo') : 'VIDEO'
    case 'audio':
      return t ? t('resources.typeAudio') : 'AUDIO'
    case 'image':
      return t ? t('resources.typeImage') : 'IMAGE'
    case 'document':
      return t ? t('resources.typeDocument') : 'DOCUMENT'
    case 'link':
      return t ? t('resources.typeLink') : 'LINK'
    case 'download':
      return t ? t('resources.typeDownload') : 'DOWNLOAD'
    default:
      return type?.toUpperCase?.() || 'RESOURCE'
  }
}

function getTypeIcon(type?: string | null) {
  const normalized = (type ?? '').toLowerCase()

  switch (normalized) {
    case 'pdf':
      return <FileText className="h-5 w-5" />
    case 'video':
      return <Video className="h-5 w-5" />
    case 'audio':
      return <Music className="h-5 w-5" />
    case 'image':
      return <ImageIcon className="h-5 w-5" />
    case 'document':
      return <File className="h-5 w-5" />
    case 'link':
      return <LinkIcon className="h-5 w-5" />
    case 'download':
      return <Download className="h-5 w-5" />
    default:
      return <FileText className="h-5 w-5" />
  }
}

function getTypeAccent(type?: string | null) {
  const normalized = (type ?? '').toLowerCase()

  switch (normalized) {
    case 'pdf':
      return 'from-red-500/15 to-rose-500/10'
    case 'video':
      return 'from-cyan-500/15 to-sky-500/10'
    case 'audio':
      return 'from-violet-500/15 to-fuchsia-500/10'
    case 'image':
      return 'from-emerald-500/15 to-teal-500/10'
    case 'document':
      return 'from-amber-500/15 to-orange-500/10'
    case 'link':
      return 'from-blue-500/15 to-indigo-500/10'
    case 'download':
      return 'from-brand-primary/20 to-brand-accent/10'
    default:
      return 'from-brand-primary/15 to-brand-accent/10'
  }
}

export default function ResourceCard({
  id,
  title,
  description,
  thumbnailUrl,
  type,
  contributorName,
  slug,
  averageRating = 0,
  totalRatings = 0,
}: ResourceCardProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useTranslation()
  const [imgLoaded, setImgLoaded] = useState(false)

  const { saved, favorite, loadingState, toggleSaved, toggleFavorite } =
    useResourceActions({
      userId: user?.id ?? null,
      resourceId: id,
    })

  const typeLabel = getTypeLabel(type, t)
  const typeIcon = getTypeIcon(type)
  const typeAccent = getTypeAccent(type)

  const requireAuth = () => {
    toast.info(t('resourceDetail.loginRequired'))
    navigate('/login')
  }

  const handleSaved = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      if (!user) {
        requireAuth()
        return
      }

      const next = await toggleSaved()

      toast.success(
        next
          ? t('resourceDetail.savedAdded')
          : t('resourceDetail.savedRemoved'),
      )
    } catch (error) {
      console.error(error)
      toast.error(t('resourceDetail.savedError'))
    }
  }

  const handleFavorite = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      if (!user) {
        requireAuth()
        return
      }

      const next = await toggleFavorite()

      toast.success(
        next
          ? t('resourceDetail.favoriteAdded')
          : t('resourceDetail.favoriteRemoved'),
      )
    } catch (error) {
      console.error(error)
      toast.error(t('resourceDetail.favoriteError'))
    }
  }

  const handleOpen = async () => {
    if (!slug) return
    await trackResourceEvent(id, 'open')
  }

  const cardContent = (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-surface-border bg-surface shadow-[var(--shadow-soft)] transition duration-300 hover:-translate-y-[3px] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-bg-soft">
        {thumbnailUrl ? (
          <>
            <div className="relative h-full w-full">
              {!imgLoaded ? (
                <div className="absolute inset-0 animate-pulse bg-bg-soft" />
              ) : null}

              <img
                src={thumbnailUrl}
                alt={title}
                onLoad={() => setImgLoaded(true)}
                className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
                  imgLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md'
                }`}
              />
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

            <div className="absolute left-3 top-3 z-10">
              <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs font-medium tracking-wide text-white backdrop-blur">
                {typeLabel}
              </span>
            </div>
          </>
        ) : (
          <div
            className={`flex h-full w-full flex-col justify-between bg-gradient-to-br ${typeAccent} p-4`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="inline-flex rounded-full border border-surface-border bg-surface px-3 py-1 text-xs font-medium tracking-wide text-text-secondary">
                {typeLabel}
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-surface-border bg-surface text-text-secondary shadow-[var(--shadow-soft)]">
                {typeIcon}
              </div>
            </div>

            <div>
              <p className="line-clamp-2 font-heading text-lg leading-snug text-text-primary">
                {title}
              </p>
            </div>
          </div>
        )}

        <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
          <motion.button
            type="button"
            onClick={handleSaved}
            disabled={loadingState === 'saved'}
            whileTap={{ scale: 0.92 }}
            animate={
              saved
                ? { scale: [1, 1.18, 1.08], rotate: [0, -6, 0] }
                : { scale: 1, rotate: 0 }
            }
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className={`flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur transition ${
              saved
                ? 'border-brand-primary bg-brand-primary text-white shadow-[var(--shadow-soft)]'
                : 'border-surface-border bg-surface/90 text-text-secondary hover:scale-105 hover:bg-surface-hover'
            }`}
            aria-label={saved ? t('resourceDetail.saved') : t('resourceDetail.save')}
            title={saved ? t('resourceDetail.saved') : t('resourceDetail.save')}
          >
            <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
          </motion.button>

          <motion.button
            type="button"
            onClick={handleFavorite}
            disabled={loadingState === 'favorite'}
            whileTap={{ scale: 0.92 }}
            animate={
              favorite
                ? { scale: [1, 1.2, 1.08], rotate: [0, 8, 0] }
                : { scale: 1, rotate: 0 }
            }
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur transition ${
              favorite
                ? 'border-brand-accent bg-brand-accent text-brand-ink shadow-[var(--shadow-soft)]'
                : 'border-surface-border bg-surface/90 text-text-secondary hover:scale-105 hover:bg-surface-hover'
            }`}
            aria-label={
              favorite ? t('resourceDetail.favorited') : t('resourceDetail.favorite')
            }
            title={
              favorite ? t('resourceDetail.favorited') : t('resourceDetail.favorite')
            }
          >
            <Star className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} />
          </motion.button>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 inline-flex w-fit rounded-full border border-surface-border bg-bg-soft px-3 py-1 text-xs uppercase tracking-wide text-text-secondary">
          {typeLabel}
        </div>

        <h3 className="font-heading text-lg leading-snug text-text-primary">
          {title}
        </h3>

        {description ? (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-text-secondary">
            {description}
          </p>
        ) : null}

        <div className="mt-auto pt-4">
          {(contributorName || totalRatings > 0) ? (
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="truncate text-sm text-text-secondary">
                {contributorName ? (
                  <>
                    {t('home.by')}{' '}
                    <span className="text-text-primary">{contributorName}</span>
                  </>
                ) : null}
              </p>

              {totalRatings > 0 ? (
                <div className="shrink-0">
                  <RatingSummaryBadge
                    average={averageRating}
                    count={totalRatings}
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {slug ? (
            <span className="mt-3 inline-flex text-sm font-medium text-brand-primary transition hover:underline">
              {t('common.open')} →
            </span>
          ) : null}
        </div>
      </div>
    </motion.article>
  )

  if (!slug) {
    return cardContent
  }

  return (
    <Link to={`/resources/${slug}`} onClick={() => void handleOpen()}>
      {cardContent}
    </Link>
  )
}
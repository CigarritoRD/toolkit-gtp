import { Star } from 'lucide-react'

type RatingSummaryBadgeProps = {
  average: number
  count: number
  size?: 'sm' | 'md'
}

export default function RatingSummaryBadge({
  average,
  count,
  size = 'sm',
}: RatingSummaryBadgeProps) {
  if (!count) return null

  const starSize = size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5'
  const textSize = size === 'md' ? 'text-sm' : 'text-xs'

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-surface-border bg-bg-soft px-2.5 py-1 text-text-secondary">
      <Star className={`${starSize} fill-brand-accent text-brand-accent`} />
      <span className={`${textSize} font-medium text-text-primary`}>
        {average.toFixed(1)}
      </span>
      <span className={`${textSize} opacity-70`}>{count}</span>
    </div>
  )
}
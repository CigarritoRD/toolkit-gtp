import { Star } from 'lucide-react'

type StarRatingProps = {
  value: number
  onChange?: (value: number) => void
  size?: 'sm' | 'md' | 'lg'
  readOnly?: boolean
}

export default function StarRating({
  value,
  onChange,
  size = 'md',
  readOnly = false,
}: StarRatingProps) {
  const iconSize =
    size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= value

        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(star)}
            className={readOnly ? 'cursor-default' : 'cursor-pointer'}
            aria-label={`Rate ${star} stars`}
          >
            <Star
              className={[
                iconSize,
                'transition',
                active
                  ? 'fill-brand-accent text-brand-accent'
                  : 'text-surface-border',
              ].join(' ')}
            />
          </button>
        )
      })}
    </div>
  )
}
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

  function handleKeyDown(e: React.KeyboardEvent, star: number) {
    if (readOnly || !onChange) return

    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      const next = star < 5 ? star + 1 : 5
      onChange(next)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      const prev = star > 1 ? star - 1 : 1
      onChange(prev)
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label="Rating"
      className="flex items-center gap-1"
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= value

        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === value}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
            tabIndex={star === value ? 0 : -1}
            disabled={readOnly}
            onClick={() => onChange?.(star)}
            onKeyDown={(e) => handleKeyDown(e, star)}
            className={[
              'rounded-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
              readOnly ? 'cursor-default' : 'cursor-pointer',
            ].join(' ')}
          >
            <Star
              className={[
                iconSize,
                'transition',
                active
                  ? 'fill-brand-accent text-brand-accent'
                  : 'text-surface-border',
              ].join(' ')}
              aria-hidden="true"
            />
          </button>
        )
      })}
    </div>
  )
}
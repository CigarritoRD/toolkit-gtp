import { useId } from 'react'
import type { TextareaHTMLAttributes } from 'react'

type AppTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string | null
}

export default function AppTextarea({
  label,
  error,
  className = '',
  id: providedId,
  ...props
}: AppTextareaProps) {
  const generatedId = useId()
  const inputId = providedId ?? generatedId
  const errorId = `${inputId}-error`

  return (
    <div className="block space-y-1.5">
      {label ? (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text-primary"
        >
          {label}
        </label>
      ) : null}

      <textarea
        id={inputId}
        className={[
          'w-full rounded-xl border border-surface-border bg-surface px-3 py-2 text-sm text-text-primary outline-none transition',
          'placeholder:text-brand-primary/70 focus:border-brand-primary',
          error ? 'border-red-300 focus:border-red-400' : '',
          className,
        ].join(' ')}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />

      {error ? (
        <span id={errorId} role="alert" className="text-sm text-red-600">
          {error}
        </span>
      ) : null}
    </div>
  )
}
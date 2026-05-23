import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'

type AppInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string | null
  hint?: string
}

export default function AppInput({
  label,
  error,
  hint,
  className = '',
  id: providedId,
  'aria-describedby': ariaDescribedBy,
  ...props
}: AppInputProps) {
  const generatedId = useId()
  const inputId = providedId ?? generatedId
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`

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

      <input
        id={inputId}
        className={[
          'w-full rounded-xl border border-surface-border bg-surface px-3 py-2 text-sm text-text-primary outline-none transition',
          'placeholder:text-brand-primary/70 focus:border-brand-primary',
          error ? 'border-red-300 focus:border-red-400' : '',
          className,
        ].join(' ')}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={[
          error ? errorId : null,
          hint && !error ? hintId : null,
          ariaDescribedBy,
        ]
          .filter(Boolean)
          .join(' ') || undefined}
        {...props}
      />

      {error ? (
        <span id={errorId} role="alert" className="text-sm text-red-600">
          {error}
        </span>
      ) : null}
      {hint && !error ? (
        <span id={hintId} className="text-sm text-brand-primary">
          {hint}
        </span>
      ) : null}
    </div>
  )
}

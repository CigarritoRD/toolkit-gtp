import { useState, useRef, useEffect, type ReactNode, type ReactElement } from 'react'
import { ChevronDown, Check } from 'lucide-react'

type OptionElement = ReactElement<{
  value?: string
  children?: ReactNode
}>

type AppSelectProps = {
  label?: string
  error?: string | null
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  children: ReactNode
  className?: string
  disabled?: boolean
}

export default function AppSelect({
  label,
  error,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  children,
  className = '',
  disabled = false,
}: AppSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const childArray = Array.isArray(children) ? children : [children]
  const options = childArray.filter(
    (child): child is OptionElement => 
      child !== null && typeof child === 'object' && 'props' in child
  )

  const selectedOption = options.find((opt) => opt.props.value === value)

  const displayValue = selectedOption?.props.children ?? placeholder

  const handleSelect = (optionValue: string) => {
    if (onChange) {
      onChange(optionValue)
    }
    setIsOpen(false)
  }

  return (
    <label className="block space-y-1.5">
      {label ? (
        <span id={`select-label-${label.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm font-medium text-text-primary">{label}</span>
      ) : null}

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          disabled={disabled}
          aria-label={label || placeholder}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined}
          aria-disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={[
            'flex w-full items-center justify-between rounded-xl border bg-surface px-4 py-2.5 text-left text-sm transition-all duration-200',
            'border-surface-border hover:border-brand-primary/50 hover:bg-surface-hover',
            'focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20',
            error
              ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20'
              : isOpen
                ? 'border-brand-primary ring-2 ring-brand-primary/20'
                : '',
            disabled ? 'cursor-not-allowed opacity-60' : '',
            className,
          ].join(' ')}
        >
          <span className={value ? 'text-text-primary' : 'text-text-secondary'}>
            {displayValue}
          </span>
          <ChevronDown
            className={[
              'h-4 w-4 text-text-secondary transition-transform duration-200',
              isOpen ? 'rotate-180' : '',
            ].join(' ')}
          />
        </button>

        <div
          role="listbox"
          aria-label={label || placeholder}
          aria-labelledby={label ? `select-label-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined}
          tabIndex={-1}
          className={[
            'absolute left-0 right-0 top-full z-50 mt-2 max-h-60 overflow-auto rounded-xl border border-surface-border bg-surface py-1 shadow-lg',
            'opacity-0 invisible -translate-y-2 transition-all duration-200',
            isOpen ? 'opacity-100 visible translate-y-0' : '',
          ].join(' ')}
        >
          {options.map((option, index) => {
            const optionValue = option.props.value
            const isSelected = optionValue === value

            return (
              <button
                key={optionValue ?? index}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={disabled}
                onClick={() => optionValue && handleSelect(optionValue)}
                className={[
                  'flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors',
                  isSelected
                    ? 'bg-brand-primary/10 text-brand-primary'
                    : 'text-text-primary hover:bg-surface-hover',
                  disabled ? 'cursor-not-allowed opacity-60' : '',
                ].join(' ')}
              >
                <span>{option.props.children}</span>
                {isSelected && <Check className="h-4 w-4 text-brand-primary" />}
              </button>
            )
          })}
        </div>
      </div>

      {error ? <span className="text-sm text-red-600">{error}</span> : null}
    </label>
  )
}
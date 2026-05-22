import {
  Children,
  useState,
  useRef,
  useEffect,
  type ReactNode,
  type ReactElement,
  isValidElement,
} from 'react'
import { ChevronDown, Check } from 'lucide-react'

type OptionElement = ReactElement<{
  value?: string
  children?: ReactNode
}>

type AppSelectOption = {
  value: string
  label: string
}

type AppSelectProps = {
  label?: string
  error?: string | null
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  options?: AppSelectOption[]
  children?: ReactNode
  className?: string
  disabled?: boolean
}

const EMPTY_OPTIONS: AppSelectOption[] = []

export default function AppSelect({
  label,
  error,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  options: selectOptions,
  children,
  className = '',
  disabled = false,
}: AppSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const listboxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const flatChildren = Children.toArray(children ?? [])
  const childOptions = flatChildren.filter(
    (child): child is OptionElement =>
      isValidElement(child) && 'props' in child,
  )
  const effectiveOptions = selectOptions ?? EMPTY_OPTIONS
  const hasChildOptions = childOptions.length > 0
  const optionsList = hasChildOptions ? childOptions : effectiveOptions

  const selectedOption = optionsList.find((opt) =>
    hasChildOptions ? (opt as OptionElement).props.value === value : (opt as AppSelectOption).value === value
  )
  const displayValue = hasChildOptions
    ? (selectedOption as OptionElement | undefined)?.props.children
    : (selectedOption as AppSelectOption | undefined)?.label ?? placeholder

  const handleSelect = (optionValue: string) => {
    if (onChange) {
      onChange(optionValue)
    }
    setIsOpen(false)
    setActiveIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (isOpen && activeIndex >= 0 && optionsList[activeIndex]) {
          const optVal = hasChildOptions
            ? (optionsList[activeIndex] as OptionElement).props.value ?? ''
            : (optionsList[activeIndex] as AppSelectOption).value ?? ''
          handleSelect(optVal)
        } else {
          setIsOpen(true)
        }
        break

      case 'ArrowDown':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
          setActiveIndex(0)
        } else {
          setActiveIndex((prev) => {
            const next = prev < optionsList.length - 1 ? prev + 1 : 0
            return next
          })
        }
        break

      case 'ArrowUp':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
          setActiveIndex(optionsList.length - 1)
        } else {
          setActiveIndex((prev) => {
            const next = prev > 0 ? prev - 1 : optionsList.length - 1
            return next
          })
        }
        break

      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setActiveIndex(-1)
        break

      case 'Tab':
        setIsOpen(false)
        setActiveIndex(-1)
        break
    }
  }

  const labelId = label
    ? `select-label-${label.toLowerCase().replace(/\s+/g, '-')}`
    : undefined
  const listboxId = label
    ? `select-${label.toLowerCase().replace(/\s+/g, '-')}`
    : undefined

  return (
    <div className="block space-y-1.5">
      {label ? (
        <span id={labelId} className="text-sm font-medium text-text-primary">
          {label}
        </span>
      ) : null}

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          disabled={disabled}
          aria-label={label || placeholder}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-disabled={disabled}
          aria-labelledby={labelId}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
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
          ref={listboxRef}
          role="listbox"
          aria-label={label || placeholder}
          aria-labelledby={labelId}
          id={listboxId}
          tabIndex={-1}
          className={[
            'absolute left-0 right-0 top-full z-50 mt-2 max-h-60 overflow-auto rounded-xl border border-surface-border bg-surface py-1 shadow-lg',
            'opacity-0 invisible -translate-y-2 transition-all duration-200',
            isOpen ? 'opacity-100 visible translate-y-0' : '',
          ].join(' ')}
        >
          {optionsList.map((option, index) => {
            const optionValue = hasChildOptions
              ? (option as OptionElement).props.value ?? ''
              : (option as AppSelectOption).value ?? ''
            const optionLabel = hasChildOptions
              ? (option as OptionElement).props.children
              : (option as AppSelectOption).label ?? ''
            const isSelected = optionValue === value
            const isActive = index === activeIndex

            return (
              <button
                key={optionValue === '' ? '__placeholder__' : optionValue}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={disabled}
                onClick={() => handleSelect(optionValue)}
                onMouseEnter={() => setActiveIndex(index)}
                className={[
                  'flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors',
                  isSelected
                    ? 'bg-brand-primary/10 text-brand-primary'
                    : 'text-text-primary hover:bg-surface-hover',
                  isActive ? 'bg-surface-hover ring-1 ring-brand-primary/30' : '',
                  disabled ? 'cursor-not-allowed opacity-60' : '',
                ].join(' ')}
              >
                <span>{optionLabel}</span>
                {isSelected && <Check className="h-4 w-4 text-brand-primary" />}
              </button>
            )
          })}
        </div>
      </div>

      {error ? <span className="text-sm text-red-600">{error}</span> : null}
    </div>
  )
}
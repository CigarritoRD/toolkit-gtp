import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { Globe, ChevronDown, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'zh', label: '简体中文' },
  { code: 'zh-TW', label: '繁體中文' },
  { code: 'zh-TW-TW', label: '台灣中文' },
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const currentLang = LANGUAGES.find((lang) => lang.code === i18n.language) || LANGUAGES[1]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = async (code: string) => {
    await i18n.changeLanguage(code)
    setIsOpen(false)
    buttonRef.current?.focus()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsOpen(!isOpen)
    } else if (isOpen && e.key === 'Escape') {
      setIsOpen(false)
      buttonRef.current?.focus()
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        aria-label="Seleccionar idioma"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="language-dropdown"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={[
          'flex items-center gap-2 rounded-xl border border-surface-border bg-surface px-3 py-2 text-sm font-medium text-text-primary',
          'shadow-[var(--shadow-soft)] transition-all duration-200',
          'hover:bg-surface-hover hover:border-brand-primary/50',
          'focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20',
          isOpen ? 'border-brand-primary ring-2 ring-brand-primary/20' : '',
        ].join(' ')}
      >
        <Globe className="h-4 w-4 text-brand-primary" aria-hidden="true" />
        <span>{currentLang.label}</span>
        <ChevronDown
          className={[
            'h-4 w-4 text-text-secondary transition-transform duration-200',
            isOpen ? 'rotate-180' : '',
          ].join(' ')}
          aria-hidden="true"
        />
      </button>

      <div
        id="language-dropdown"
        role="listbox"
        aria-label="Idiomas disponibles"
        className={[
          'absolute left-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-surface-border bg-surface shadow-lg',
          'opacity-0 invisible -translate-y-2 transition-all duration-200',
          isOpen ? 'opacity-100 visible translate-y-0' : '',
        ].join(' ')}
      >
        <div className="py-1" role="none">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              role="option"
              aria-selected={lang.code === currentLang.code}
              onClick={() => handleSelect(lang.code)}
              className={[
                'flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors',
                lang.code === currentLang.code
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-text-primary hover:bg-surface-hover',
              ].join(' ')}
            >
              <span>{lang.label}</span>
              {lang.code === currentLang.code && (
                <Check className="h-4 w-4 text-brand-primary" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
import { Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'zh', label: '中文' },
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const current = i18n.language?.split('-')[0] || 'en'

  const handleChange = async (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const next = event.target.value
    await i18n.changeLanguage(next)
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
        <Globe className="h-4 w-4" />
      </div>

      <select
        value={current}
        onChange={handleChange}
        className="h-10 rounded-xl border border-surface-border bg-surface pl-9 pr-8 text-sm font-medium text-text-primary shadow-[var(--shadow-soft)] transition hover:bg-surface-hover focus:border-brand-primary focus:outline-none"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  )
}
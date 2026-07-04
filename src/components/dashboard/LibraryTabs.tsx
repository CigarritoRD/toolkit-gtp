import { useTranslation } from 'react-i18next'

type LibraryTabValue = 'all' | 'saved' | 'favorite' | 'assigned' | 'unlocked'

type LibraryTabsProps = {
  value: LibraryTabValue
  onChange: (value: LibraryTabValue) => void
}

const tabKeys: { key: string; value: LibraryTabValue }[] = [
  { key: 'libraryTabs.all', value: 'all' },
  { key: 'libraryTabs.saved', value: 'saved' },
  { key: 'libraryTabs.favorites', value: 'favorite' },
  { key: 'libraryTabs.assigned', value: 'assigned' },
  { key: 'libraryTabs.unlocked', value: 'unlocked' },
]

export default function LibraryTabs({ value, onChange }: LibraryTabsProps) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-wrap gap-3">
      {tabKeys.map((tab) => {
        const isActive = tab.value === value

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={[
              'rounded-2xl px-4 py-2 text-sm font-medium transition',
              isActive
                ? 'bg-brand-primary text-white shadow-soft'
                : 'border border-surface-border bg-surface text-text-primary hover:bg-surface-hover',
            ].join(' ')}
          >
            {t(tab.key)}
          </button>
        )
      })}
    </div>
  )
}

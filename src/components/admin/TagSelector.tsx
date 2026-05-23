import { useMemo, useCallback } from 'react'
import { Tag } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { TagRecord } from '@/lib/api/tags'

type TagSelectorProps = {
  tags: TagRecord[]
  value: string[]
  onChange: (next: string[]) => void
  label?: string
  helpText?: string
}

export default function TagSelector({
  tags,
  value,
  onChange,
  label,
  helpText,
}: TagSelectorProps) {
  const { t } = useTranslation()

  const grouped = useMemo(() => {
    const map = new Map<string, TagRecord[]>()

    for (const tag of tags) {
      const key = tag.group_key?.trim() || t('admin.resourceForm.ungrouped')
      const current = map.get(key) ?? []
      current.push(tag)
      map.set(key, current)
    }

    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [tags, t])

  const toggleTag = useCallback(
    (tagId: string) => {
      if (value.includes(tagId)) {
        onChange(value.filter((id) => id !== tagId))
        return
      }

      onChange([...value, tagId])
    },
    [value, onChange],
  )

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-primary">
          {label || t('admin.resourceForm.tags')}
        </label>
        {helpText ? (
          <p id="tag-selector-help" className="mt-1 text-sm text-text-secondary">
            {helpText}
          </p>
        ) : null}
      </div>

      <div role="group" aria-labelledby="tag-selector-label" className="space-y-4">
        {grouped.map(([group, groupTags]) => (
          <div key={group} className="space-y-2">
            <p
              id="tag-selector-label"
              className="text-xs uppercase tracking-[0.18em] text-brand-primary"
            >
              {group}
            </p>

            <div className="flex flex-wrap gap-2" role="listbox" aria-multiselectable="true">
              {groupTags.map((tag) => {
                const active = value.includes(tag.id)

                return (
                  <button
                    key={tag.id}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => toggleTag(tag.id)}
                    className={[
                      'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition',
                      active
                        ? 'border-brand-primary bg-brand-primary text-white'
                        : 'border-surface-border bg-bg-soft text-text-primary hover:bg-surface-hover',
                    ].join(' ')}
                  >
                    <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                    {tag.name}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
import { useEffect, useMemo, useCallback } from 'react'
import { toast } from 'sonner'

type UploadBoxProps = {
  label: string
  helper: string
  accept?: string
  file: File | null
  currentUrl?: string | null
  onChange: (file: File | null) => void
  maxSize?: number
}

export default function UploadBox({
  label,
  helper,
  accept,
  file,
  currentUrl,
  onChange,
  maxSize,
}: UploadBoxProps) {
  const previewUrl = useMemo(() => {
    if (!file) return null
    return URL.createObjectURL(file)
  }, [file])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0] ?? null
      if (!selected) {
        onChange(null)
        return
      }

      if (maxSize && selected.size > maxSize) {
        toast.error(
          `El archivo excede el tamaño máximo de ${(maxSize / 1024 / 1024).toFixed(0)} MB.`,
        )
        return
      }

      onChange(selected)
    },
    [maxSize, onChange],
  )

  const isImage = accept?.includes('image')
  const displayName = file?.name || (currentUrl ? 'Current file uploaded' : '')

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-text-primary">{label}</label>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-surface-border bg-bg-soft px-6 py-8 text-center transition hover:border-brand-primary/60 hover:bg-brand-primary/5">
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          className="sr-only"
        />

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
          <span className="text-xl">{isImage ? '🖼️' : '📄'}</span>
        </div>

        <p className="mt-4 text-sm font-medium text-text-primary">Click to upload</p>

        <p className="mt-1 max-w-md text-xs text-text-secondary">{helper}</p>

        {displayName ? (
          <p className="mt-4 rounded-full bg-white px-4 py-2 text-xs text-text-secondary shadow-sm">
            {displayName}
          </p>
        ) : null}
      </label>

      {isImage && (previewUrl || currentUrl) ? (
        <div className="overflow-hidden rounded-2xl border border-surface-border bg-white p-3">
          <p className="mb-2 text-xs text-text-secondary">
            {previewUrl ? 'New preview' : 'Current thumbnail'}
          </p>
          <img
            src={previewUrl || currentUrl || ''}
            alt="Thumbnail preview"
            className="h-44 w-full rounded-xl object-cover"
          />
        </div>
      ) : null}

      {file ? (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-xs font-medium text-red-600 hover:underline"
        >
          Remove selected file
        </button>
      ) : null}
    </div>
  )
}
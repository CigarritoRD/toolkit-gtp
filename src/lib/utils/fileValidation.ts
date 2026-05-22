export const FILE_LIMITS = {
  thumbnail: {
    maxSize: 2 * 1024 * 1024, // 2MB
    types: ['image/jpeg', 'image/png', 'image/webp'],
    label: '2 MB',
  },
  avatar: {
    maxSize: 2 * 1024 * 1024, // 2MB
    types: ['image/jpeg', 'image/png', 'image/webp'],
    label: '2 MB',
  },
  resourceFile: {
    maxSize: 25 * 1024 * 1024, // 25MB
    types: ['application/pdf'],
    label: '25 MB',
  },
} as const

export type FileType = keyof typeof FILE_LIMITS

export interface ValidationResult {
  valid: boolean
  error?: string
}

export function validateFile(file: File, type: FileType): ValidationResult {
  const limit = FILE_LIMITS[type]

  if (file.size > limit.maxSize) {
    return {
      valid: false,
      error: `El archivo excede el tamaño máximo de ${limit.label}.`,
    }
  }

  if (!limit.types.includes(file.type as never)) {
    const allowed = limit.types.map((t) => t.split('/')[1].toUpperCase()).join(', ')
    return {
      valid: false,
      error: `Tipo de archivo no permitido. Usa: ${allowed}.`,
    }
  }

  return { valid: true }
}
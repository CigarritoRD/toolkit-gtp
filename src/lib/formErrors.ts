export type SubmitErrorType =
  | 'duplicateSlug'
  | 'permissionDenied'
  | 'uploadFailed'
  | 'loadOptionsFailed'
  | 'unknown'

const ERROR_PATTERNS: Record<SubmitErrorType, RegExp[]> = {
  duplicateSlug: [/duplicate key/i, /unique constraint/i, /llave duplicada/i],
  permissionDenied: [
    /permission denied/i,
    /row-level security/i,
    /violates row-level security/i,
    /no tiene permisos/i,
  ],
  uploadFailed: [/storage/i, /bucket/i, /upload/i, /archivo/i],
  loadOptionsFailed: [/contributor/i, /category/i, /tag/i],
  unknown: [],
}

export function parseSubmitError(error: unknown): SubmitErrorType {
  const message = error instanceof Error ? error.message : String(error)

  for (const [type, patterns] of Object.entries(ERROR_PATTERNS) as [
    SubmitErrorType,
    RegExp[],
  ][]) {
    if (type === 'unknown') continue
    if (patterns.some((pattern) => pattern.test(message))) {
      return type
    }
  }

  return 'unknown'
}

export function getSubmitErrorMessage(
  type: SubmitErrorType,
  fallbackMessage: string,
): string {
  const messages: Record<SubmitErrorType, string | null> = {
    duplicateSlug: null,
    permissionDenied: null,
    uploadFailed: null,
    loadOptionsFailed: null,
    unknown: fallbackMessage,
  }

  return messages[type] ?? fallbackMessage
}
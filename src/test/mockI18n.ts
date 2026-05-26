import { vi } from 'vitest'

const tMock = (key: string, options?: Record<string, unknown>) => {
  if (options?.email) {
    return key.replace('{{ email }}', options.email as string)
  }
  return key
}

export const mockI18n = () => ({
  t: tMock,
  i18n: {
    language: 'en',
    changeLanguage: vi.fn().mockResolvedValue(undefined),
  },
  ready: true,
})

export const mockUseTranslation = () => ({
  t: tMock,
  i18n: {
    language: 'en',
    changeLanguage: vi.fn().mockResolvedValue(undefined),
  },
  ready: true,
})

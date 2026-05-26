import { vi } from 'vitest'

export const createMockUseAuth = (overrides?: {
  user?: object | null
  profile?: object | null
  loading?: boolean
  signIn?: ReturnType<typeof vi.fn>
  signUp?: ReturnType<typeof vi.fn>
  signOut?: ReturnType<typeof vi.fn>
  changePassword?: ReturnType<typeof vi.fn>
  refreshProfile?: ReturnType<typeof vi.fn>
}) => {
  return {
    user: overrides?.user ?? null,
    profile: overrides?.profile ?? null,
    loading: overrides?.loading ?? false,
    signIn: overrides?.signIn ?? vi.fn().mockResolvedValue(undefined),
    signUp: overrides?.signUp ?? vi.fn().mockResolvedValue(undefined),
    signOut: overrides?.signOut ?? vi.fn().mockResolvedValue(undefined),
    changePassword: overrides?.changePassword ?? vi.fn().mockResolvedValue(undefined),
    refreshProfile: overrides?.refreshProfile ?? vi.fn().mockResolvedValue(undefined),
  }
}

export const mockUseAuth = createMockUseAuth()

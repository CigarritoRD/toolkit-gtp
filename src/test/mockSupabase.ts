import { vi } from 'vitest'

export const createMockSupabase = (overrides?: {
  signInWithPassword?: { error?: Error | null; data?: object }
  signUp?: { error?: Error | null; data?: object }
  signOut?: { error?: Error | null }
  updateUser?: { error?: Error | null }
  resetPasswordForEmail?: { error?: Error | null }
  getUser?: { data: { user: object | null }; error?: Error | null }
  getSession?: { data: { session: object | null }; error?: Error | null }
  onAuthStateChange?: ReturnType<typeof vi.fn>
}) => {
  return {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue(
        overrides?.signInWithPassword ?? { data: { user: { id: 'test-user' } }, error: null },
      ),
      signUp: vi.fn().mockResolvedValue(
        overrides?.signUp ?? { data: { user: { id: 'test-user' } }, error: null },
      ),
      signOut: vi.fn().mockResolvedValue(
        overrides?.signOut ?? { error: null },
      ),
      updateUser: vi.fn().mockResolvedValue(
        overrides?.updateUser ?? { error: null },
      ),
      resetPasswordForEmail: vi.fn().mockResolvedValue(
        overrides?.resetPasswordForEmail ?? { error: null },
      ),
      getUser: vi.fn().mockResolvedValue(
        overrides?.getUser ?? { data: { user: { id: 'test-user' } }, error: null },
      ),
      getSession: vi.fn().mockResolvedValue(
        overrides?.getSession ?? { data: { session: null }, error: null },
      ),
      onAuthStateChange: overrides?.onAuthStateChange ?? vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
        order: vi.fn().mockReturnValue({
          range: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    }),
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: null, error: null }),
        remove: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    },
  }
}

export const mockSupabase = createMockSupabase()

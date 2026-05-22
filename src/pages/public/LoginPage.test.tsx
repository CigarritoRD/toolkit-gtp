import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from './LoginPage'

vi.mock('@/auth/useAuth', () => ({
  useAuth: () => ({
    signIn: vi.fn().mockResolvedValue(undefined),
  }),
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
      }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { role: 'user' }, error: null }),
        }),
      }),
    }),
  },
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza el título de login', () => {
    renderWithRouter(<LoginPage />)
    expect(screen.getByText(/auth.loginTitle/i)).toBeInTheDocument()
  })

  it('renderiza campos de email y password', () => {
    renderWithRouter(<LoginPage />)
    expect(screen.getByLabelText(/auth.email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/auth.password/i)).toBeInTheDocument()
  })

  it('renderiza botón de submit', () => {
    renderWithRouter(<LoginPage />)
    expect(screen.getByRole('button', { name: /auth.signIn/i })).toBeInTheDocument()
  })

  it('renderiza link a register', () => {
    renderWithRouter(<LoginPage />)
    expect(screen.getByRole('link', { name: /nav.register/i })).toBeInTheDocument()
  })
})
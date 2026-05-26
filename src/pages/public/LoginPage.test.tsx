import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from './LoginPage'

const mockSignIn = vi.fn()
const mockGetUser = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/auth/useAuth', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
  }),
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: () => mockGetUser(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: () => mockFrom(),
  },
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

const navigateMock = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    navigateMock.mockReset()
    mockSignIn.mockResolvedValue(undefined)
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    })
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

  it('renderiza link a forgot password', () => {
    renderWithRouter(<LoginPage />)
    expect(screen.getByRole('link', { name: /auth.forgotPasswordLabel/i })).toBeInTheDocument()
  })

  it('llama a signIn con email y password al enviar formulario', async () => {
    const user = userEvent.setup()
    renderWithRouter(<LoginPage />)

    await user.type(screen.getByLabelText(/auth.email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/auth.password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /auth.signIn/i }))

    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
  })

  it('navega a /dashboard cuando el login es exitoso como usuario', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    })
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { role: 'user' }, error: null }),
        }),
      }),
    })

    const user = userEvent.setup()
    renderWithRouter(<LoginPage />)

    await user.type(screen.getByLabelText(/auth.email/i), 'user@example.com')
    await user.type(screen.getByLabelText(/auth.password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /auth.signIn/i }))

    expect(navigateMock).toHaveBeenCalledWith('/dashboard')
  })

  it('navega a /admin cuando el login es exitoso como admin', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-123' } },
      error: null,
    })
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
        }),
      }),
    })

    const user = userEvent.setup()
    renderWithRouter(<LoginPage />)

    await user.type(screen.getByLabelText(/auth.email/i), 'admin@example.com')
    await user.type(screen.getByLabelText(/auth.password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /auth.signIn/i }))

    expect(navigateMock).toHaveBeenCalledWith('/admin')
  })

  it('no llama a signIn si los campos están vacíos', async () => {
    const user = userEvent.setup()
    renderWithRouter(<LoginPage />)

    await user.click(screen.getByRole('button', { name: /auth.signIn/i }))

    expect(mockSignIn).not.toHaveBeenCalled()
  })
})

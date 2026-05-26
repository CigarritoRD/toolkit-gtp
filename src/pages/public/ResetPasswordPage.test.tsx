import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import ResetPasswordPage from './ResetPasswordPage'

const mockUpdateUser = vi.fn()
const mockSignOut = vi.fn()

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      updateUser: (...args: unknown[]) => mockUpdateUser(...args),
      signOut: (...args: unknown[]) => mockSignOut(...args),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
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

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    navigateMock.mockReset()
    mockUpdateUser.mockResolvedValue({ error: null })
    mockSignOut.mockResolvedValue({ error: null })
  })

  it('renderiza el título', () => {
    renderWithRouter(<ResetPasswordPage />)
    expect(screen.getByText(/auth.resetPassword.title/i)).toBeInTheDocument()
  })

  it('renderiza los campos de password y confirmPassword', () => {
    renderWithRouter(<ResetPasswordPage />)
    expect(screen.getByLabelText(/auth.resetPassword.newPassword/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/auth.resetPassword.confirmPassword/i)).toBeInTheDocument()
  })

  it('renderiza botón de actualizar', () => {
    renderWithRouter(<ResetPasswordPage />)
    expect(screen.getByRole('button', { name: /auth.resetPassword.submit/i })).toBeInTheDocument()
  })

  it('no envía si los campos están vacíos', async () => {
    const user = userEvent.setup()
    renderWithRouter(<ResetPasswordPage />)

    await user.click(screen.getByRole('button', { name: /auth.resetPassword.submit/i }))

    expect(mockUpdateUser).not.toHaveBeenCalled()
  })

  it('muestra error si el password es menor a 8 caracteres', async () => {
    const user = userEvent.setup()
    renderWithRouter(<ResetPasswordPage />)

    await user.type(screen.getByLabelText(/auth.resetPassword.newPassword/i), 'short')
    await user.type(screen.getByLabelText(/auth.resetPassword.confirmPassword/i), 'short')
    await user.click(screen.getByRole('button', { name: /auth.resetPassword.submit/i }))

    expect(screen.getByText(/auth.passwordMinLength/i)).toBeInTheDocument()
    expect(mockUpdateUser).not.toHaveBeenCalled()
  })

  it('muestra error si las contraseñas no coinciden', async () => {
    const user = userEvent.setup()
    renderWithRouter(<ResetPasswordPage />)

    await user.type(screen.getByLabelText(/auth.resetPassword.newPassword/i), 'password123')
    await user.type(screen.getByLabelText(/auth.resetPassword.confirmPassword/i), 'differentpass')
    await user.click(screen.getByRole('button', { name: /auth.resetPassword.submit/i }))

    expect(screen.getByText(/auth.passwordsDoNotMatch/i)).toBeInTheDocument()
    expect(mockUpdateUser).not.toHaveBeenCalled()
  })

  it('llama a updateUser y signOut, y navega a /login tras éxito', async () => {
    const user = userEvent.setup()
    renderWithRouter(<ResetPasswordPage />)

    await user.type(screen.getByLabelText(/auth.resetPassword.newPassword/i), 'newpassword123')
    await user.type(screen.getByLabelText(/auth.resetPassword.confirmPassword/i), 'newpassword123')
    await user.click(screen.getByRole('button', { name: /auth.resetPassword.submit/i }))

    expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'newpassword123' })
    expect(mockSignOut).toHaveBeenCalled()
    expect(navigateMock).toHaveBeenCalledWith('/login')
  })

  it('muestra error inline si updateUser falla', async () => {
    mockUpdateUser.mockRejectedValue(new Error('Token expired'))
    const user = userEvent.setup()
    renderWithRouter(<ResetPasswordPage />)

    await user.type(screen.getByLabelText(/auth.resetPassword.newPassword/i), 'newpassword123')
    await user.type(screen.getByLabelText(/auth.resetPassword.confirmPassword/i), 'newpassword123')
    await user.click(screen.getByRole('button', { name: /auth.resetPassword.submit/i }))

    expect(await screen.findByText('Token expired')).toBeInTheDocument()
    expect(mockSignOut).not.toHaveBeenCalled()
    expect(navigateMock).not.toHaveBeenCalled()
  })

  it('no navega a /login si updateUser falla', async () => {
    mockUpdateUser.mockRejectedValue(new Error('Token expired'))
    const user = userEvent.setup()
    renderWithRouter(<ResetPasswordPage />)

    await user.type(screen.getByLabelText(/auth.resetPassword.newPassword/i), 'newpassword123')
    await user.type(screen.getByLabelText(/auth.resetPassword.confirmPassword/i), 'newpassword123')
    await user.click(screen.getByRole('button', { name: /auth.resetPassword.submit/i }))

    expect(await screen.findByText('Token expired')).toBeInTheDocument()
    expect(navigateMock).not.toHaveBeenCalled()
  })
})

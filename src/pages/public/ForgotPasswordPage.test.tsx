import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import ForgotPasswordPage from './ForgotPasswordPage'

const mockResetPasswordForEmail = vi.fn()

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: (...args: unknown[]) => mockResetPasswordForEmail(...args),
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

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResetPasswordForEmail.mockResolvedValue({ error: null })
  })

  it('renderiza el título', () => {
    renderWithRouter(<ForgotPasswordPage />)
    expect(screen.getByText(/auth.forgotPassword.title/i)).toBeInTheDocument()
  })

  it('renderiza el campo de email', () => {
    renderWithRouter(<ForgotPasswordPage />)
    expect(screen.getByLabelText(/auth.email/i)).toBeInTheDocument()
  })

  it('renderiza botón de enviar', () => {
    renderWithRouter(<ForgotPasswordPage />)
    expect(screen.getByRole('button', { name: /auth.forgotPassword.submit/i })).toBeInTheDocument()
  })

  it('renderiza link a login', () => {
    renderWithRouter(<ForgotPasswordPage />)
    expect(screen.getByRole('link', { name: /nav.login/i })).toBeInTheDocument()
  })

  it('llama a resetPasswordForEmail con email normalizado', async () => {
    const user = userEvent.setup()
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:5173' },
      writable: true,
    })
    renderWithRouter(<ForgotPasswordPage />)

    await user.type(screen.getByLabelText(/auth.email/i), '  Test@Example.COM  ')
    await user.click(screen.getByRole('button', { name: /auth.forgotPassword.submit/i }))

    expect(mockResetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
      redirectTo: 'http://localhost:5173/reset-password',
    })
  })

  it('muestra pantalla de éxito tras envío exitoso', async () => {
    const user = userEvent.setup()
    renderWithRouter(<ForgotPasswordPage />)

    await user.type(screen.getByLabelText(/auth.email/i), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /auth.forgotPassword.submit/i }))

    expect(await screen.findByText(/auth.forgotPassword.successTitle/i)).toBeInTheDocument()
    expect(screen.getByText(/auth.forgotPassword.successBody/i)).toBeInTheDocument()
  })

  it('en pantalla de éxito muestra link para volver a login', async () => {
    const user = userEvent.setup()
    renderWithRouter(<ForgotPasswordPage />)

    await user.type(screen.getByLabelText(/auth.email/i), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /auth.forgotPassword.submit/i }))

    expect(await screen.findByRole('link', { name: /auth.forgotPassword.backToLogin/i })).toBeInTheDocument()
  })

  it('no envía si el email está vacío', async () => {
    const user = userEvent.setup()
    renderWithRouter(<ForgotPasswordPage />)

    await user.click(screen.getByRole('button', { name: /auth.forgotPassword.submit/i }))

    expect(mockResetPasswordForEmail).not.toHaveBeenCalled()
  })

  it('muestra error inline si Supabase falla', async () => {
    mockResetPasswordForEmail.mockRejectedValue(new Error('User not found'))
    const user = userEvent.setup()
    renderWithRouter(<ForgotPasswordPage />)

    await user.type(screen.getByLabelText(/auth.email/i), 'notfound@example.com')
    await user.click(screen.getByRole('button', { name: /auth.forgotPassword.submit/i }))

    expect(await screen.findByText('User not found')).toBeInTheDocument()
  })

  it('no muestra la pantalla de éxito si hay error', async () => {
    mockResetPasswordForEmail.mockRejectedValue(new Error('User not found'))
    const user = userEvent.setup()
    renderWithRouter(<ForgotPasswordPage />)

    await user.type(screen.getByLabelText(/auth.email/i), 'notfound@example.com')
    await user.click(screen.getByRole('button', { name: /auth.forgotPassword.submit/i }))

    expect(await screen.findByText('User not found')).toBeInTheDocument()
    expect(screen.queryByText(/auth.forgotPassword.successTitle/i)).not.toBeInTheDocument()
  })
})

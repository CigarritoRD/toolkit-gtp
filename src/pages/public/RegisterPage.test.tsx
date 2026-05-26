import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import RegisterPage from './RegisterPage'

const mockSignUp = vi.fn()

vi.mock('@/auth/useAuth', () => ({
  useAuth: () => ({
    signUp: mockSignUp,
  }),
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
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

vi.mock('@/components/ui/CountrySelect', () => ({
  default: ({
    label,
    value,
    onChange,
  }: {
    label: string
    value: string
    onChange: (val: string) => void
  }) => (
    <div>
      <label id="country-label">{label}</label>
      <select
        data-testid="country-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-labelledby="country-label"
      >
        <option value="">Select country</option>
        <option value="DO">Dominican Republic</option>
        <option value="US">United States</option>
      </select>
    </div>
  ),
}))

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSignUp.mockResolvedValue(undefined)
  })

  it('renderiza el título de registro', () => {
    renderWithRouter(<RegisterPage />)
    expect(screen.getByText(/auth.registerTitle/i)).toBeInTheDocument()
  })

  it('renderiza todos los campos del formulario', () => {
    renderWithRouter(<RegisterPage />)
    expect(screen.getByLabelText(/auth.fullName/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/auth.email/i)).toBeInTheDocument()
    expect(screen.getByTestId('country-select')).toBeInTheDocument()
    expect(screen.getByLabelText(/auth.phoneOptional/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/auth.password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/auth.confirmPassword/i)).toBeInTheDocument()
  })

  it('renderiza botón de registro', () => {
    renderWithRouter(<RegisterPage />)
    expect(screen.getByRole('button', { name: /auth.signUp/i })).toBeInTheDocument()
  })

  it('renderiza link a login', () => {
    renderWithRouter(<RegisterPage />)
    expect(screen.getByRole('link', { name: /nav.login/i })).toBeInTheDocument()
  })

  it('no envía el formulario si los campos están vacíos', async () => {
    const user = userEvent.setup()
    renderWithRouter(<RegisterPage />)

    await user.click(screen.getByRole('button', { name: /auth.signUp/i }))

    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('muestra error si las contraseñas no coinciden', async () => {
    const user = userEvent.setup()
    renderWithRouter(<RegisterPage />)

    await user.type(screen.getByLabelText(/auth.fullName/i), 'John Doe')
    await user.type(screen.getByLabelText(/auth.email/i), 'test@example.com')
    await user.selectOptions(screen.getByTestId('country-select'), 'US')
    await user.type(screen.getByLabelText(/auth.password/i), 'password123')
    await user.type(screen.getByLabelText(/auth.confirmPassword/i), 'differentpassword')
    await user.click(screen.getByRole('button', { name: /auth.signUp/i }))

    expect(screen.getByText(/auth.passwordsDoNotMatch/i)).toBeInTheDocument()
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('muestra error si el password es menor a 8 caracteres', async () => {
    const user = userEvent.setup()
    renderWithRouter(<RegisterPage />)

    await user.type(screen.getByLabelText(/auth.fullName/i), 'John Doe')
    await user.type(screen.getByLabelText(/auth.email/i), 'test@example.com')
    await user.selectOptions(screen.getByTestId('country-select'), 'US')
    await user.type(screen.getByLabelText(/auth.password/i), 'short')
    await user.type(screen.getByLabelText(/auth.confirmPassword/i), 'short')
    await user.click(screen.getByRole('button', { name: /auth.signUp/i }))

    expect(screen.getByText(/auth.passwordMinLength/i)).toBeInTheDocument()
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('llama a signUp con datos normalizados al registrar correctamente', async () => {
    const user = userEvent.setup()
    renderWithRouter(<RegisterPage />)

    await user.type(screen.getByLabelText(/auth.fullName/i), '  John Doe  ')
    await user.type(screen.getByLabelText(/auth.email/i), '  Test@Example.COM  ')
    await user.selectOptions(screen.getByTestId('country-select'), 'US')
    await user.type(screen.getByLabelText(/auth.password/i), 'password123')
    await user.type(screen.getByLabelText(/auth.confirmPassword/i), 'password123')
    await user.click(screen.getByRole('button', { name: /auth.signUp/i }))

    expect(mockSignUp).toHaveBeenCalledWith(
      'test@example.com',
      'password123',
      'John Doe',
      'US',
      undefined,
    )
  })

  it('muestra pantalla de email enviado tras registro exitoso', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue(undefined)
    renderWithRouter(<RegisterPage />)

    await user.type(screen.getByLabelText(/auth.fullName/i), 'John Doe')
    await user.type(screen.getByLabelText(/auth.email/i), 'test@example.com')
    await user.selectOptions(screen.getByTestId('country-select'), 'US')
    await user.type(screen.getByLabelText(/auth.password/i), 'password123')
    await user.type(screen.getByLabelText(/auth.confirmPassword/i), 'password123')
    await user.click(screen.getByRole('button', { name: /auth.signUp/i }))

    expect(await screen.findByText(/auth.registerCheckEmailTitle/i)).toBeInTheDocument()
    expect(screen.getByText(/auth.registerCheckEmailBody/i)).toBeInTheDocument()
  })

  it('en la pantalla de éxito muestra botón para ir a login', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue(undefined)
    renderWithRouter(<RegisterPage />)

    await user.type(screen.getByLabelText(/auth.fullName/i), 'John Doe')
    await user.type(screen.getByLabelText(/auth.email/i), 'test@example.com')
    await user.selectOptions(screen.getByTestId('country-select'), 'US')
    await user.type(screen.getByLabelText(/auth.password/i), 'password123')
    await user.type(screen.getByLabelText(/auth.confirmPassword/i), 'password123')
    await user.click(screen.getByRole('button', { name: /auth.signUp/i }))

    expect(await screen.findByRole('link', { name: /auth.registerCheckEmailAction/i })).toBeInTheDocument()
  })

  it('muestra error inline si signUp falla', async () => {
    mockSignUp.mockRejectedValue(new Error('Email already exists'))
    const user = userEvent.setup()
    renderWithRouter(<RegisterPage />)

    await user.type(screen.getByLabelText(/auth.fullName/i), 'John Doe')
    await user.type(screen.getByLabelText(/auth.email/i), 'test@example.com')
    await user.selectOptions(screen.getByTestId('country-select'), 'US')
    await user.type(screen.getByLabelText(/auth.password/i), 'password123')
    await user.type(screen.getByLabelText(/auth.confirmPassword/i), 'password123')
    await user.click(screen.getByRole('button', { name: /auth.signUp/i }))

    expect(await screen.findByText(/auth.registerError/i)).toBeInTheDocument()
  })

  it('muestra sugerencia si el email termina en .oeg', async () => {
    const user = userEvent.setup()
    renderWithRouter(<RegisterPage />)

    await user.type(screen.getByLabelText(/auth.fullName/i), 'John Doe')
    await user.type(screen.getByLabelText(/auth.email/i), 'test@domain.oeg')
    await user.selectOptions(screen.getByTestId('country-select'), 'US')
    await user.type(screen.getByLabelText(/auth.password/i), 'password123')
    await user.type(screen.getByLabelText(/auth.confirmPassword/i), 'password123')
    await user.click(screen.getByRole('button', { name: /auth.signUp/i }))

    expect(screen.getByText(/auth.emailSuggestion/i)).toBeInTheDocument()
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('muestra sugerencia si el email termina en gmail.con', async () => {
    const user = userEvent.setup()
    renderWithRouter(<RegisterPage />)

    await user.type(screen.getByLabelText(/auth.fullName/i), 'John Doe')
    await user.type(screen.getByLabelText(/auth.email/i), 'test@gmail.con')
    await user.selectOptions(screen.getByTestId('country-select'), 'US')
    await user.type(screen.getByLabelText(/auth.password/i), 'password123')
    await user.type(screen.getByLabelText(/auth.confirmPassword/i), 'password123')
    await user.click(screen.getByRole('button', { name: /auth.signUp/i }))

    expect(screen.getByText(/auth.emailSuggestion/i)).toBeInTheDocument()
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('al hacer clic en la sugerencia de email, corrige el email', async () => {
    const user = userEvent.setup()
    renderWithRouter(<RegisterPage />)

    await user.type(screen.getByLabelText(/auth.fullName/i), 'John Doe')
    await user.type(screen.getByLabelText(/auth.email/i), 'test@domain.oeg')
    await user.selectOptions(screen.getByTestId('country-select'), 'US')
    await user.type(screen.getByLabelText(/auth.password/i), 'password123')
    await user.type(screen.getByLabelText(/auth.confirmPassword/i), 'password123')
    await user.click(screen.getByRole('button', { name: /auth.signUp/i }))

    const suggestionButton = screen.getByText(/auth.didYouMean/i)
    await user.click(suggestionButton)

    expect(screen.getByLabelText(/auth.email/i)).toHaveValue('test@domain.org')
  })
})

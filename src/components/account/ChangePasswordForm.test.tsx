import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import ChangePasswordForm from './ChangePasswordForm'

const mockChangePassword = vi.fn()

vi.mock('@/auth/useAuth', () => ({
  useAuth: () => ({
    changePassword: mockChangePassword,
  }),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('ChangePasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockChangePassword.mockResolvedValue(undefined)
  })

  it('renderiza el título', () => {
    renderWithRouter(<ChangePasswordForm />)
    expect(screen.getByText(/profile.changePasswordTitle/i)).toBeInTheDocument()
  })

  it('renderiza los tres campos de password', () => {
    renderWithRouter(<ChangePasswordForm />)
    expect(screen.getByLabelText(/profile.currentPassword/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/profile.newPassword/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/profile.confirmNewPassword/i)).toBeInTheDocument()
  })

  it('renderiza botón de actualizar', () => {
    renderWithRouter(<ChangePasswordForm />)
    expect(screen.getByRole('button', { name: /profile.updatePassword/i })).toBeInTheDocument()
  })

  it('no envía si todos los campos están vacíos', async () => {
    const user = userEvent.setup()
    renderWithRouter(<ChangePasswordForm />)

    await user.click(screen.getByRole('button', { name: /profile.updatePassword/i }))

    expect(mockChangePassword).not.toHaveBeenCalled()
  })

  it('muestra error si newPassword es menor a 8 caracteres', async () => {
    const user = userEvent.setup()
    renderWithRouter(<ChangePasswordForm />)

    await user.type(screen.getByLabelText(/profile.currentPassword/i), 'currentpass123')
    await user.type(screen.getByLabelText(/profile.newPassword/i), 'short')
    await user.type(screen.getByLabelText(/profile.confirmNewPassword/i), 'short')
    await user.click(screen.getByRole('button', { name: /profile.updatePassword/i }))

    expect(screen.getByText(/auth.passwordMinLength/i)).toBeInTheDocument()
    expect(mockChangePassword).not.toHaveBeenCalled()
  })

  it('muestra error si las contraseñas nuevas no coinciden', async () => {
    const user = userEvent.setup()
    renderWithRouter(<ChangePasswordForm />)

    await user.type(screen.getByLabelText(/profile.currentPassword/i), 'currentpass123')
    await user.type(screen.getByLabelText(/profile.newPassword/i), 'newpassword123')
    await user.type(screen.getByLabelText(/profile.confirmNewPassword/i), 'differentpass123')
    await user.click(screen.getByRole('button', { name: /profile.updatePassword/i }))

    expect(screen.getByText(/auth.passwordsDoNotMatch/i)).toBeInTheDocument()
    expect(mockChangePassword).not.toHaveBeenCalled()
  })

  it('llama a changePassword con current y new password', async () => {
    const user = userEvent.setup()
    renderWithRouter(<ChangePasswordForm />)

    await user.type(screen.getByLabelText(/profile.currentPassword/i), 'currentpass123')
    await user.type(screen.getByLabelText(/profile.newPassword/i), 'newpassword123')
    await user.type(screen.getByLabelText(/profile.confirmNewPassword/i), 'newpassword123')
    await user.click(screen.getByRole('button', { name: /profile.updatePassword/i }))

    expect(mockChangePassword).toHaveBeenCalledWith('currentpass123', 'newpassword123')
  })

  it('limpia los campos tras cambio exitoso', async () => {
    const user = userEvent.setup()
    renderWithRouter(<ChangePasswordForm />)

    const currentPasswordInput = screen.getByLabelText(/profile.currentPassword/i)
    const newPasswordInput = screen.getByLabelText(/profile.newPassword/i)
    const confirmPasswordInput = screen.getByLabelText(/profile.confirmNewPassword/i)

    await user.type(currentPasswordInput, 'currentpass123')
    await user.type(newPasswordInput, 'newpassword123')
    await user.type(confirmPasswordInput, 'newpassword123')
    await user.click(screen.getByRole('button', { name: /profile.updatePassword/i }))

    expect(currentPasswordInput).toHaveValue('')
    expect(newPasswordInput).toHaveValue('')
    expect(confirmPasswordInput).toHaveValue('')
  })

  it('muestra error en campo currentPassword si la contraseña actual es incorrecta', async () => {
    mockChangePassword.mockRejectedValue(new Error('La contraseña actual es incorrecta.'))
    const user = userEvent.setup()
    renderWithRouter(<ChangePasswordForm />)

    await user.type(screen.getByLabelText(/profile.currentPassword/i), 'wrongpassword')
    await user.type(screen.getByLabelText(/profile.newPassword/i), 'newpassword123')
    await user.type(screen.getByLabelText(/profile.confirmNewPassword/i), 'newpassword123')
    await user.click(screen.getByRole('button', { name: /profile.updatePassword/i }))

    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('muestra error inline genérico si changePassword falla con error no relacionado', async () => {
    mockChangePassword.mockRejectedValue(new Error('Something went wrong'))
    const user = userEvent.setup()
    renderWithRouter(<ChangePasswordForm />)

    await user.type(screen.getByLabelText(/profile.currentPassword/i), 'currentpass123')
    await user.type(screen.getByLabelText(/profile.newPassword/i), 'newpassword123')
    await user.type(screen.getByLabelText(/profile.confirmNewPassword/i), 'newpassword123')
    await user.click(screen.getByRole('button', { name: /profile.updatePassword/i }))

    expect(await screen.findByText('Something went wrong')).toBeInTheDocument()
  })
})

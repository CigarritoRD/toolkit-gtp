import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AppInput from './AppInput'

describe('AppInput', () => {
  it('renderiza sin label cuando no se proporciona', () => {
    render(<AppInput placeholder="Escribe algo" />)
    const input = screen.getByPlaceholderText('Escribe algo')
    expect(input).toBeInTheDocument()
  })

  it('renderiza con label cuando se proporciona', () => {
    render(<AppInput label="Nombre" />)
    expect(screen.getByText('Nombre')).toBeInTheDocument()
  })

  it('renderiza con placeholder', () => {
    render(<AppInput placeholder="Mi placeholder" />)
    expect(screen.getByPlaceholderText('Mi placeholder')).toBeInTheDocument()
  })

  it('renderiza con valor inicial', () => {
    render(<AppInput value="Valor inicial" readOnly />)
    const input = screen.getByDisplayValue('Valor inicial')
    expect(input).toBeInTheDocument()
  })

  it('llama a onChange al escribir', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    render(<AppInput onChange={handleChange} />)
    const input = screen.getByRole('textbox')

    await user.type(input, 'nuevo valor')

    expect(handleChange).toHaveBeenCalled()
  })

  it('renderiza con error', () => {
    render(<AppInput error="Campo requerido" />)
    expect(screen.getByText('Campo requerido')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveClass('border-red-300')
  })

  it('acepta diferentes tipos de input', () => {
    render(<AppInput type="email" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'email')
  })

  it('acepta disabled', () => {
    render(<AppInput disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('renderiza como required', () => {
    render(<AppInput required />)
    expect(screen.getByRole('textbox')).toBeRequired()
  })
})
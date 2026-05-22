import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AppButton from './AppButton'

describe('AppButton', () => {
  it('renderiza correctamente con children', () => {
    render(<AppButton>Click me</AppButton>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('renderiza con variant primary por defecto', () => {
    render(<AppButton>Test</AppButton>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-brand-primary')
  })

  it('renderiza con variant secondary', () => {
    render(<AppButton variant="secondary">Test</AppButton>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('border')
  })

  it('renderiza con variant danger', () => {
    render(<AppButton variant="danger">Test</AppButton>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('text-red-700')
  })

  it('renderiza deshabilitado cuando disabled es true', () => {
    render(<AppButton disabled>Test</AppButton>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('acepta type submit', () => {
    render(<AppButton type="submit">Submit</AppButton>)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('acepta onClick', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<AppButton onClick={handleClick}>Click me</AppButton>)
    await user.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renderiza con fullWidth', () => {
    render(<AppButton fullWidth>Test</AppButton>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('w-full')
  })
})
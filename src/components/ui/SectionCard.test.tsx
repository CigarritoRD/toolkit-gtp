import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SectionCard from './SectionCard'

describe('SectionCard', () => {
  it('renderiza children correctamente', () => {
    render(<SectionCard>Contenido de prueba</SectionCard>)
    expect(screen.getByText('Contenido de prueba')).toBeInTheDocument()
  })

  it('renderiza con clases personalizadas', () => {
    render(<SectionCard className="custom-class">Test</SectionCard>)
    const card = screen.getByText('Test')
    expect(card).toHaveClass('custom-class')
  })

  it('tiene las clases base de card', () => {
    render(<SectionCard>Test</SectionCard>)
    const card = screen.getByText('Test')
    expect(card).toHaveClass('rounded-xl')
    expect(card).toHaveClass('border')
    expect(card).toHaveClass('bg-surface')
  })

  it('renderiza múltiples elementos children', () => {
    render(
      <SectionCard>
        <span>Elemento 1</span>
        <span>Elemento 2</span>
      </SectionCard>
    )
    expect(screen.getByText('Elemento 1')).toBeInTheDocument()
    expect(screen.getByText('Elemento 2')).toBeInTheDocument()
  })
})
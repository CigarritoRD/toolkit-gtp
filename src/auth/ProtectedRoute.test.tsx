import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'

vi.mock('@/auth/useAuth', () => ({
  useAuth: vi.fn(),
}))

const { useAuth } = vi.mocked(await import('@/auth/useAuth'))

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muestra "Cargando…" mientras loading es true', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: true } as never)
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<ProtectedRoute />}>
            <Route index element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('Preparando tu espacio...')).toBeInTheDocument()
  })

  it('redirige a /login cuando no hay usuario', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: false } as never)
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<ProtectedRoute />}>
            <Route index element={<div>Protected Content</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renderiza el contenido protegido cuando hay usuario y no está loading', () => {
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'user-123' }, loading: false } as never)
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<ProtectedRoute />}>
            <Route index element={<div>Protected Content</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
  })

  it('no muestra contenido de loading cuando el usuario está autenticado', () => {
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'user-123' }, loading: false } as never)
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<ProtectedRoute />}>
            <Route index element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.queryByText('Preparando tu espacio...')).not.toBeInTheDocument()
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})

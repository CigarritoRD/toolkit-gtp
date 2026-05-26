/* eslint-disable react-refresh/only-export-components */
import { BrowserRouter } from 'react-router-dom'
import { render, type RenderOptions } from '@testing-library/react'

function Wrapper({ children }: { children: React.ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>
}

export function renderWithRouter(
  ui: React.ReactElement,
  options?: RenderOptions,
) {
  return render(ui, { wrapper: Wrapper, ...options })
}

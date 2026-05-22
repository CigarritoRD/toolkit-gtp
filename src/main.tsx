import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { router } from '@/app/router/routes'
import { AuthProvider } from '@/auth/AuthProvider'
import 'flag-icons/css/flag-icons.min.css'
import './index.css'
import '@/lib/i18n'


const savedTheme = window.localStorage.getItem('Toolkit-theme')
const initialTheme = savedTheme === 'dark' ? 'dark' : 'light'

if (initialTheme === 'dark') {
  document.documentElement.classList.add('dark')
} else {
  document.documentElement.classList.remove('dark')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: 'var(--surface)',
            border: '1px solid var(--surface-border)',
            color: 'var(--text-primary)',
          },
        }}
      />
    </AuthProvider>
  </React.StrictMode>,
)
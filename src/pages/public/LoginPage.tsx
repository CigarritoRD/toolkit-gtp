import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/auth/useAuth'
import { supabase } from '@/lib/supabaseClient'
import AppInput from '@/components/ui/AppInput'
import AppButton from '@/components/ui/AppButton'
import SectionCard from '@/components/ui/SectionCard'

export default function LoginPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { signIn } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    try {
      setLoading(true)

      await signIn(email, password)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('No authenticated user found after login.')
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError) {
        throw profileError
      }

      if (profile?.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      console.error(err)
      setSubmitError(t('auth.invalidCredentials'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg px-6 text-text-primary">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(0,116,115,0.12),transparent_40%),radial-gradient(circle_at_top_right,rgba(0,171,199,0.10),transparent_35%)]" />

      <SectionCard className="w-full max-w-md p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
              <LogIn className="h-5 w-5" />
            </div>

            <h1 className="mt-4 font-heading text-2xl">
              {t('auth.loginTitle')}
            </h1>
            <p className="mt-2 text-sm text-brand-primary">
              {t('auth.loginSubtitle')}
            </p>
          </div>

          {submitError ? (
            <div className="mb-4 rounded-xl border border-red-200/50 bg-red-50/50 px-4 py-3 text-sm text-red-600">
              {submitError}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AppInput
              label={t('auth.email')}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (submitError) setSubmitError(null)
              }}
              placeholder="correo@email.com"
              autoComplete="email"
            />

            <AppInput
              label={t('auth.password')}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (submitError) setSubmitError(null)
              }}
              placeholder="••••••••"
              autoComplete="current-password"
            />

            <AppButton type="submit" disabled={loading} className="w-full">
              {loading ? t('auth.signingIn') : t('auth.signIn')}
            </AppButton>
          </form>

          <p className="mt-4 text-center text-sm text-brand-primary">
            <Link to="/forgot-password" className="text-brand-accent hover:underline">
              {t('auth.forgotPasswordLabel')}
            </Link>
          </p>

          <p className="mt-6 text-center text-sm text-brand-primary">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-brand-accent hover:underline">
              {t('nav.register')}
            </Link>
          </p>
        </SectionCard>
    </div>
  )
}
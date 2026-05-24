import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabaseClient'
import AppInput from '@/components/ui/AppInput'
import AppButton from '@/components/ui/AppButton'
import SectionCard from '@/components/ui/SectionCard'

export default function ForgotPasswordPage() {
  const { t } = useTranslation()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) return

    try {
      setLoading(true)
      setSubmitError(null)

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        throw error
      }

      setSubmitted(true)
    } catch (err) {
      console.error(err)
      setSubmitError(err instanceof Error ? err.message : t('auth.forgotPassword.error'))
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-bg px-6 text-text-primary">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(0,116,115,0.12),transparent_40%),radial-gradient(circle_at_top_right,rgba(0,171,199,0.10),transparent_35%)]" />

        <SectionCard className="w-full max-w-md p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
            <Mail className="h-5 w-5" />
          </div>

          <h1 className="mt-4 font-heading text-2xl">
            {t('auth.forgotPassword.successTitle')}
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            {t('auth.forgotPassword.successBody')}
          </p>

          <Link to="/login" className="mt-6 inline-block text-sm text-brand-accent hover:underline">
            {t('auth.forgotPassword.backToLogin')}
          </Link>
        </SectionCard>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg px-6 text-text-primary">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(0,116,115,0.12),transparent_40%),radial-gradient(circle_at_top_right,rgba(0,171,199,0.10),transparent_35%)]" />

      <SectionCard className="w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
            <Mail className="h-5 w-5" />
          </div>

          <h1 className="mt-4 font-heading text-2xl">
            {t('auth.forgotPassword.title')}
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            {t('auth.forgotPassword.subtitle')}
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

          <AppButton type="submit" disabled={loading} className="w-full">
            {loading ? t('auth.forgotPassword.sending') : t('auth.forgotPassword.submit')}
          </AppButton>
        </form>

        <p className="mt-6 text-center text-sm text-brand-primary">
          {t('auth.rememberPassword')}{' '}
          <Link to="/login" className="text-brand-accent hover:underline">
            {t('nav.login')}
          </Link>
        </p>
      </SectionCard>
    </div>
  )
}
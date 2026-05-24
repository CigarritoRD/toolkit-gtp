import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabaseClient'
import AppInput from '@/components/ui/AppInput'
import AppButton from '@/components/ui/AppButton'
import SectionCard from '@/components/ui/SectionCard'

export default function ResetPasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{
    password?: string
    confirmPassword?: string
  }>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  const validate = () => {
    const errors: typeof fieldErrors = {}

    if (!password) {
      errors.password = t('auth.resetPassword.passwordRequired')
    } else if (password.length < 8) {
      errors.password = t('auth.passwordMinLength')
    }

    if (!confirmPassword) {
      errors.confirmPassword = t('auth.resetPassword.confirmRequired')
    } else if (password !== confirmPassword) {
      errors.confirmPassword = t('auth.passwordsDoNotMatch')
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    try {
      setLoading(true)
      setSubmitError(null)

      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        throw error
      }

      await supabase.auth.signOut()
      navigate('/login')
    } catch (err) {
      console.error(err)
      setSubmitError(
        err instanceof Error ? err.message : t('auth.resetPassword.error'),
      )
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
            <Lock className="h-5 w-5" />
          </div>

          <h1 className="mt-4 font-heading text-2xl">
            {t('auth.resetPassword.title')}
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            {t('auth.resetPassword.subtitle')}
          </p>
        </div>

        {submitError ? (
          <div className="mb-4 rounded-xl border border-red-200/50 bg-red-50/50 px-4 py-3 text-sm text-red-600">
            {submitError}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <AppInput
            label={t('auth.resetPassword.newPassword')}
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (fieldErrors.password) {
                setFieldErrors((prev) => ({ ...prev, password: undefined }))
              }
            }}
            error={fieldErrors.password}
            placeholder={t('profile.newPasswordPlaceholder')}
            autoComplete="new-password"
          />

          <AppInput
            label={t('auth.resetPassword.confirmPassword')}
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              if (fieldErrors.confirmPassword) {
                setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }))
              }
            }}
            error={fieldErrors.confirmPassword}
            placeholder={t('auth.resetPassword.confirmPlaceholder')}
            autoComplete="new-password"
          />

          <AppButton type="submit" disabled={loading} className="w-full">
            {loading ? t('auth.resetPassword.updating') : t('auth.resetPassword.submit')}
          </AppButton>
        </form>
      </SectionCard>
    </div>
  )
}
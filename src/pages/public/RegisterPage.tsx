import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, UserPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/auth/useAuth'
import AppInput from '@/components/ui/AppInput'
import AppButton from '@/components/ui/AppButton'
import CountrySelect from '@/components/ui/CountrySelect'
import SectionCard from '@/components/ui/SectionCard'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function suggestEmailFix(email: string) {
  const normalized = email.trim().toLowerCase()

  if (normalized.endsWith('.oeg')) {
    return normalized.replace(/\.oeg$/, '.org')
  }

  if (normalized.endsWith('@gmail.con')) {
    return normalized.replace('@gmail.con', '@gmail.com')
  }

  if (normalized.endsWith('@hotmail.con')) {
    return normalized.replace('@hotmail.con', '@hotmail.com')
  }

  if (normalized.endsWith('@outlook.con')) {
    return normalized.replace('@outlook.con', '@outlook.com')
  }

  return null
}

type FieldErrors = {
  name?: string
  email?: string
  country?: string
  password?: string
  confirmPassword?: string
  form?: string
}

export default function RegisterPage() {
  const { t } = useTranslation()
  const { signUp } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [country, setCountry] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)

  const emailSuggestion = suggestEmailFix(email)

  const validate = (): boolean => {
    const errors: FieldErrors = {}

    if (!name.trim()) {
      errors.name = t('auth.nameRequired')
    }

    if (!email.trim()) {
      errors.email = t('auth.emailRequired')
    } else if (!EMAIL_RE.test(email.trim())) {
      errors.email = t('auth.emailInvalid')
    } else if (emailSuggestion) {
      errors.email = t('auth.emailSuggestion', { email: emailSuggestion })
    }

    if (!country) {
      errors.country = t('auth.countryRequired')
    }

    if (password.length < 8) {
      errors.password = t('auth.passwordMinLength')
    }

    if (!confirmPassword) {
      errors.confirmPassword = t('auth.confirmPasswordRequired')
    } else if (password !== confirmPassword) {
      errors.confirmPassword = t('auth.passwordsDoNotMatch')
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    const normalizedName = name.trim()
    const normalizedEmail = email.trim().toLowerCase()

    try {
      setLoading(true)
      setFieldErrors({})
      await signUp(normalizedEmail, password, normalizedName, country, phone || undefined)
      setSubmittedEmail(normalizedEmail)
    } catch (err) {
      console.error(err)
      setFieldErrors({
        form: t('auth.registerError'),
      })
    } finally {
      setLoading(false)
    }
  }

  if (submittedEmail) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-bg px-6 text-text-primary">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(0,116,115,0.12),transparent_40%),radial-gradient(circle_at_top_right,rgba(0,171,199,0.10),transparent_35%)]" />

        <SectionCard className="w-full max-w-md p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-primary/10">
            <Mail className="h-8 w-8 text-brand-primary" />
          </div>

          <h1 className="mt-6 font-heading text-3xl">
            {t('auth.registerCheckEmailTitle')}
          </h1>
          <p className="mt-3 text-sm text-text-secondary">
            {t('auth.registerCheckEmailBody', { email: submittedEmail })}
          </p>

          <div className="mt-8">
            <Link to="/login">
              <AppButton className="w-full">
                {t('auth.registerCheckEmailAction')}
              </AppButton>
            </Link>
          </div>
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
              <UserPlus className="h-5 w-5" />
            </div>

            <h1 className="mt-4 font-heading text-2xl">
              {t('auth.registerTitle')}
            </h1>
            <p className="mt-2 text-sm text-brand-primary">
              {t('auth.registerSubtitle')}
            </p>
          </div>

          {fieldErrors.form ? (
            <div className="mb-4 rounded-xl border border-red-200/50 bg-red-50/50 px-4 py-3 text-sm text-red-600">
              {fieldErrors.form}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AppInput
              label={t('auth.fullName')}
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }))
              }}
              error={fieldErrors.name}
            />

            <div>
              <AppInput
                label={t('auth.email')}
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }))
                }}
                error={fieldErrors.email}
              />

              {emailSuggestion ? (
                <button
                  type="button"
                  onClick={() => setEmail(emailSuggestion)}
                  className="mt-2 text-left text-xs font-medium text-brand-primary hover:underline"
                >
                  {t('auth.didYouMean', { email: emailSuggestion })}
                </button>
              ) : null}
            </div>

            <div>
              <CountrySelect
                label={t('profile.country')}
                value={country}
                placeholder={t('common.selectCountry')}
                onChange={(val) => {
                  setCountry(val)
                  if (fieldErrors.country) setFieldErrors((prev) => ({ ...prev, country: undefined }))
                }}
              />
              {fieldErrors.country ? (
                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.country}</p>
              ) : null}
            </div>

            <AppInput
              label={t('auth.phoneOptional')}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 809 555 1234"
            />

            <AppInput
              label={t('auth.password')}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }))
              }}
              error={fieldErrors.password}
            />

            <AppInput
              label={t('auth.confirmPassword')}
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }))
              }}
              error={fieldErrors.confirmPassword}
            />

            <AppButton type="submit" disabled={loading} className="w-full">
              {loading ? t('auth.signingUp') : t('auth.signUp')}
            </AppButton>
          </form>

          <p className="mt-6 text-center text-sm text-brand-primary">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link to="/login" className="text-brand-accent hover:underline">
              {t('nav.login')}
            </Link>
          </p>
        </SectionCard>
    </div>
  )
}
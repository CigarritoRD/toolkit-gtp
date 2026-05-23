import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
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

export default function RegisterPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { signUp } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [country, setCountry] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const emailSuggestion = suggestEmailFix(email)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const normalizedName = name.trim()
    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedName) {
      toast.error(t('auth.nameRequired'))
      return
    }

    if (!normalizedEmail) {
      toast.error(t('auth.emailRequired'))
      return
    }

    if (!EMAIL_RE.test(normalizedEmail)) {
      toast.error(t('auth.emailInvalid'))
      return
    }

    if (emailSuggestion) {
      toast.error(t('auth.emailSuggestion', { email: emailSuggestion }))
      return
    }

    if (!country) {
      toast.error(t('auth.countryRequired'))
      return
    }

    if (password.length < 8) {
      toast.error(t('auth.passwordMinLength'))
      return
    }

    if (password !== confirmPassword) {
      toast.error(t('auth.passwordsDoNotMatch'))
      return
    }

    try {
      setLoading(true)

      await signUp(normalizedEmail, password, normalizedName, country, phone || undefined)

      toast.success(t('auth.registerSuccess'))
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      toast.error(t('auth.registerError'))
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
              <UserPlus className="h-5 w-5" />
            </div>

            <h1 className="mt-4 font-heading text-2xl">
              {t('auth.registerTitle')}
            </h1>
            <p className="mt-2 text-sm text-brand-primary">
              {t('auth.registerSubtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AppInput
              label={t('auth.fullName')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div>
              <AppInput
                label={t('auth.email')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

            <CountrySelect
              label={t('profile.country')}
              value={country}
              placeholder={t('common.selectCountry')}
              onChange={setCountry}
            />

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
              onChange={(e) => setPassword(e.target.value)}
            />

            <AppInput
              label={t('auth.confirmPassword')}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
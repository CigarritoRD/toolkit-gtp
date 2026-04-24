import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Send, Sparkles, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuth } from '@/auth/useAuth'
import FadeIn from '@/components/ui/FadeIn'
import SectionCard from '@/components/ui/SectionCard'
import AppInput from '@/components/ui/AppInput'
import AppTextarea from '@/components/ui/AppTextarea'
import AppButton from '@/components/ui/AppButton'
import FileInput from '@/components/ui/FileInput'
import {
  createContributorApplication,
  uploadContributorApplicationAvatar,
} from '@/lib/api/contributor-applications'

type FormErrors = Partial<Record<
  | 'contactName'
  | 'contactRole'
  | 'contactEmail'
  | 'contactPhone'
  | 'organizationName'
  | 'country'
  | 'organization'
  | 'specialty'
  | 'shortBio'
  | 'fullBio'
  | 'websiteUrl'
  | 'instagramUrl'
  | 'facebookUrl'
  | 'linkedinUrl'
  | 'youtubeUrl',
  string
>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[0-9+()\-\s]{7,}$/

function normalizeOptionalUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  return `https://${trimmed}`
}

function isValidUrl(value: string) {
  if (!value.trim()) return true

  try {
    const url = new URL(normalizeOptionalUrl(value))
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}

function getFriendlyError(
  error: unknown,
  fallback: string,
  requiredFieldMessage: string,
) {
  if (!error || typeof error !== 'object') return fallback

  const maybeError = error as { message?: string; details?: string; code?: string }
  const raw = `${maybeError.message ?? ''} ${maybeError.details ?? ''}`.toLowerCase()

  if (raw.includes('full_name')) return requiredFieldMessage
  if (raw.includes('contact_email') || raw.includes('email')) return requiredFieldMessage
  if (raw.includes('organization_name')) return requiredFieldMessage
  if (raw.includes('duplicate') || raw.includes('unique')) {
    return 'Ya existe una solicitud similar. Si crees que es un error, contáctanos.'
  }

  return fallback
}

export default function BecomeContributorPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user, profile } = useAuth()

  const initialContactName = useMemo(
    () => profile?.full_name?.trim() || '',
    [profile?.full_name],
  )

  const initialContactEmail = useMemo(() => user?.email || '', [user?.email])

  const [contactName, setContactName] = useState(initialContactName)
  const [contactRole, setContactRole] = useState('')
  const [contactEmail, setContactEmail] = useState(initialContactEmail)
  const [contactPhone, setContactPhone] = useState('')

  const [organizationName, setOrganizationName] = useState(
    profile?.organization ?? '',
  )
  const [country, setCountry] = useState(profile?.country ?? '')
  const [organization, setOrganization] = useState(profile?.organization ?? '')
  const [specialty, setSpecialty] = useState('')
  const [shortBio, setShortBio] = useState('')
  const [fullBio, setFullBio] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [facebookUrl, setFacebookUrl] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const nextErrors: FormErrors = {}

    const normalizedContactName = contactName.trim()
    const normalizedContactEmail = contactEmail.trim().toLowerCase()
    const normalizedOrganizationName = organizationName.trim()
    const normalizedContactPhone = contactPhone.trim()

    if (!normalizedContactName) {
      nextErrors.contactName = t('contributorApply.validation.contactName')
    }

    if (!normalizedContactEmail) {
      nextErrors.contactEmail = t('contributorApply.validation.contactEmail')
    } else if (!EMAIL_RE.test(normalizedContactEmail)) {
      nextErrors.contactEmail = 'Ingresa un correo válido.'
    }

    if (!normalizedOrganizationName) {
      nextErrors.organizationName = t('contributorApply.validation.organizationName')
    }

    if (normalizedContactPhone && !PHONE_RE.test(normalizedContactPhone)) {
      nextErrors.contactPhone = 'Ingresa un teléfono válido.'
    }

    if (!shortBio.trim()) {
      nextErrors.shortBio = 'Agrega una descripción breve.'
    }

    if (!fullBio.trim()) {
      nextErrors.fullBio = 'Agrega una descripción completa.'
    }

    if (!isValidUrl(websiteUrl)) {
      nextErrors.websiteUrl = 'Ingresa una URL válida.'
    }

    if (!isValidUrl(instagramUrl)) {
      nextErrors.instagramUrl = 'Ingresa una URL válida.'
    }

    if (!isValidUrl(facebookUrl)) {
      nextErrors.facebookUrl = 'Ingresa una URL válida.'
    }

    if (!isValidUrl(linkedinUrl)) {
      nextErrors.linkedinUrl = 'Ingresa una URL válida.'
    }

    if (!isValidUrl(youtubeUrl)) {
      nextErrors.youtubeUrl = 'Ingresa una URL válida.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const clearFieldError = (field: keyof FormErrors) => {
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validate()) {
      toast.error('Revisa los campos marcados e inténtalo de nuevo.')
      return
    }

    const normalizedContactName = contactName.trim()
    const normalizedContactEmail = contactEmail.trim().toLowerCase()
    const normalizedOrganizationName = organizationName.trim()

    try {
      setLoading(true)

      let avatarUrl: string | null = null

      if (avatarFile) {
        avatarUrl = await uploadContributorApplicationAvatar(
          avatarFile,
          user?.id || normalizedContactEmail,
        )
      }

      await createContributorApplication({
        user_id: user?.id ?? null,
        contact_name: normalizedContactName,
        contact_role: contactRole.trim() || null,
        contact_email: normalizedContactEmail,
        contact_phone: contactPhone.trim() || null,
        organization_name: normalizedOrganizationName,
        avatar_url: avatarUrl,
        country: country.trim() || null,
        organization: organization.trim() || null,
        specialty: specialty.trim() || null,
        short_bio: shortBio.trim() || null,
        full_bio: fullBio.trim() || null,
        website_url: normalizeOptionalUrl(websiteUrl) || null,
        instagram_url: normalizeOptionalUrl(instagramUrl) || null,
        facebook_url: normalizeOptionalUrl(facebookUrl) || null,
        linkedin_url: normalizeOptionalUrl(linkedinUrl) || null,
        youtube_url: normalizeOptionalUrl(youtubeUrl) || null,
      })

      toast.success(t('contributorApply.success'))
      navigate('/')
    } catch (error) {
      console.error(error)
      toast.error(
        getFriendlyError(
          error,
          t('contributorApply.error'),
          'Faltan campos obligatorios en la solicitud. Revisa nombre, correo y organización.',
        ),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-bg text-text-primary">
      <FadeIn>
        <section className="relative overflow-hidden px-6 py-14 md:px-10 lg:px-16 lg:py-16">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(0,116,115,0.12),transparent_35%),radial-gradient(circle_at_top_right,rgba(0,171,199,0.10),transparent_30%)]" />
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-surface-border bg-surface px-4 py-1 text-sm text-brand-primary shadow-[var(--shadow-soft)]">
                  <Sparkles className="h-4 w-4 text-brand-primary" />
                  {t('contributorApply.badge')}
                </div>

                <h1 className="mt-4 font-heading text-4xl md:text-5xl">
                  {t('contributorApply.title')}
                </h1>

                <p className="mt-4 max-w-2xl text-lg text-brand-primary">
                  {t('contributorApply.subtitle')}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <SectionCard className="p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                    <Users className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-heading text-lg text-text-primary">
                    {t('contributorApply.point1Title')}
                  </h3>
                  <p className="mt-2 text-sm text-brand-primary">
                    {t('contributorApply.point1Body')}
                  </p>
                </SectionCard>

                <SectionCard className="p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-accent/10 text-brand-accent">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-heading text-lg text-text-primary">
                    {t('contributorApply.point2Title')}
                  </h3>
                  <p className="mt-2 text-sm text-brand-primary">
                    {t('contributorApply.point2Body')}
                  </p>
                </SectionCard>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.06}>
        <section className="px-6 pb-16 md:px-10 lg:px-16">
          <div className="mx-auto max-w-5xl">
            <SectionCard className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-8" noValidate>
                <div className="space-y-4">
                  <div>
                    <h2 className="font-heading text-xl">
                      {t('contributorApply.contactSection')}
                    </h2>
                    <p className="mt-1 text-sm text-brand-primary">
                      {t('contributorApply.contactHelp')}
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <AppInput
                        label={t('contributorApply.contactName')}
                        value={contactName}
                        onChange={(e) => {
                          setContactName(e.target.value)
                          clearFieldError('contactName')
                        }}
                        placeholder={t('contributorApply.contactNamePlaceholder')}
                      />
                      {errors.contactName ? <p className="mt-1 text-sm text-red-500">{errors.contactName}</p> : null}
                    </div>

                    <div>
                      <AppInput
                        label={t('contributorApply.contactRole')}
                        value={contactRole}
                        onChange={(e) => {
                          setContactRole(e.target.value)
                          clearFieldError('contactRole')
                        }}
                        placeholder={t('contributorApply.contactRolePlaceholder')}
                      />
                    </div>

                    <div>
                      <AppInput
                        label={t('contributorApply.contactEmail')}
                        type="email"
                        value={contactEmail}
                        onChange={(e) => {
                          setContactEmail(e.target.value)
                          clearFieldError('contactEmail')
                        }}
                        placeholder="you@email.com"
                      />
                      {errors.contactEmail ? <p className="mt-1 text-sm text-red-500">{errors.contactEmail}</p> : null}
                    </div>

                    <div>
                      <AppInput
                        label={t('contributorApply.contactPhone')}
                        value={contactPhone}
                        onChange={(e) => {
                          setContactPhone(e.target.value)
                          clearFieldError('contactPhone')
                        }}
                        placeholder={t('contributorApply.contactPhonePlaceholder')}
                      />
                      {errors.contactPhone ? <p className="mt-1 text-sm text-red-500">{errors.contactPhone}</p> : null}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h2 className="font-heading text-xl">
                      {t('contributorApply.ministrySection')}
                    </h2>
                    <p className="mt-1 text-sm text-brand-primary">
                      {t('contributorApply.ministryHelp')}
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <AppInput
                        label={t('contributorApply.organizationName')}
                        value={organizationName}
                        onChange={(e) => {
                          setOrganizationName(e.target.value)
                          clearFieldError('organizationName')
                        }}
                        placeholder={t('contributorApply.organizationNamePlaceholder')}
                      />
                      {errors.organizationName ? <p className="mt-1 text-sm text-red-500">{errors.organizationName}</p> : null}
                    </div>

                    <AppInput
                      label={t('contributorApply.country')}
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder={t('contributorApply.countryPlaceholder')}
                    />

                    <AppInput
                      label={t('contributorApply.organization')}
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder={t('contributorApply.organizationPlaceholder')}
                    />

                    <AppInput
                      label={t('contributorApply.specialty')}
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      placeholder={t('contributorApply.specialtyPlaceholder')}
                    />
                  </div>

                  <div>
                    <AppTextarea
                      label={t('contributorApply.shortBio')}
                      rows={3}
                      value={shortBio}
                      onChange={(e) => {
                        setShortBio(e.target.value)
                        clearFieldError('shortBio')
                      }}
                      placeholder={t('contributorApply.shortBioPlaceholder')}
                    />
                    {errors.shortBio ? <p className="mt-1 text-sm text-red-500">{errors.shortBio}</p> : null}
                  </div>

                  <div>
                    <AppTextarea
                      label={t('contributorApply.fullBio')}
                      rows={6}
                      value={fullBio}
                      onChange={(e) => {
                        setFullBio(e.target.value)
                        clearFieldError('fullBio')
                      }}
                      placeholder={t('contributorApply.fullBioPlaceholder')}
                    />
                    {errors.fullBio ? <p className="mt-1 text-sm text-red-500">{errors.fullBio}</p> : null}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h2 className="font-heading text-xl">
                      {t('contributorApply.avatarSection')}
                    </h2>
                    <p className="mt-1 text-sm text-brand-primary">
                      {t('contributorApply.avatarHelp')}
                    </p>
                  </div>

                  <FileInput
                    label={t('contributorApply.avatar')}
                    accept="image/*"
                    fileName={avatarFile?.name ?? null}
                    hint="PNG, JPG o WEBP"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                    onClear={() => setAvatarFile(null)}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h2 className="font-heading text-xl">
                      {t('contributorApply.linksSection')}
                    </h2>
                    <p className="mt-1 text-sm text-brand-primary">
                      {t('contributorApply.linksHelp')}
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <AppInput
                        label={t('contributorApply.website')}
                        value={websiteUrl}
                        onChange={(e) => {
                          setWebsiteUrl(e.target.value)
                          clearFieldError('websiteUrl')
                        }}
                        placeholder="https://..."
                      />
                      {errors.websiteUrl ? <p className="mt-1 text-sm text-red-500">{errors.websiteUrl}</p> : null}
                    </div>

                    <div>
                      <AppInput
                        label="Instagram"
                        value={instagramUrl}
                        onChange={(e) => {
                          setInstagramUrl(e.target.value)
                          clearFieldError('instagramUrl')
                        }}
                        placeholder="https://instagram.com/..."
                      />
                      {errors.instagramUrl ? <p className="mt-1 text-sm text-red-500">{errors.instagramUrl}</p> : null}
                    </div>

                    <div>
                      <AppInput
                        label="Facebook"
                        value={facebookUrl}
                        onChange={(e) => {
                          setFacebookUrl(e.target.value)
                          clearFieldError('facebookUrl')
                        }}
                        placeholder="https://facebook.com/..."
                      />
                      {errors.facebookUrl ? <p className="mt-1 text-sm text-red-500">{errors.facebookUrl}</p> : null}
                    </div>

                    <div>
                      <AppInput
                        label="LinkedIn"
                        value={linkedinUrl}
                        onChange={(e) => {
                          setLinkedinUrl(e.target.value)
                          clearFieldError('linkedinUrl')
                        }}
                        placeholder="https://linkedin.com/in/..."
                      />
                      {errors.linkedinUrl ? <p className="mt-1 text-sm text-red-500">{errors.linkedinUrl}</p> : null}
                    </div>

                    <div className="md:col-span-2">
                      <AppInput
                        label="YouTube"
                        value={youtubeUrl}
                        onChange={(e) => {
                          setYoutubeUrl(e.target.value)
                          clearFieldError('youtubeUrl')
                        }}
                        placeholder="https://youtube.com/..."
                      />
                      {errors.youtubeUrl ? <p className="mt-1 text-sm text-red-500">{errors.youtubeUrl}</p> : null}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <AppButton type="submit" disabled={loading}>
                    <Send className="h-4 w-4" />
                    {loading
                      ? t('contributorApply.submitting')
                      : t('contributorApply.submit')}
                  </AppButton>
                </div>
              </form>
            </SectionCard>
          </div>
        </section>
      </FadeIn>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Camera, RotateCcw, Save } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuth } from '@/auth/useAuth'
import AppButton from '@/components/ui/AppButton'
import AppInput from '@/components/ui/AppInput'
import CountrySelect from '@/components/ui/CountrySelect'
import FileInput from '@/components/ui/FileInput'
import SectionCard from '@/components/ui/SectionCard'
import {
  updateMyProfile,
  uploadProfileAvatar,
} from '@/lib/api/profile'

export default function DashboardProfilePage() {
  const { t } = useTranslation()
  const { user, profile, refreshProfile } = useAuth()

  const initialName = useMemo(() => {
    return profile?.full_name?.trim() || user?.email?.split('@')[0] || ''
  }, [profile?.full_name, user?.email])

  const initialAvatar = profile?.avatar_url ?? ''
  const initialCountry = profile?.country ?? ''

  const [fullName, setFullName] = useState(initialName)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatar)
  const [country, setCountry] = useState(initialCountry)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setFullName(initialName)
  }, [initialName])

  useEffect(() => {
    setAvatarUrl(initialAvatar)
  }, [initialAvatar])

  useEffect(() => {
    setCountry(initialCountry)
  }, [initialCountry])

  useEffect(() => {
    if (!avatarFile) {
      setPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(avatarFile)
    setPreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [avatarFile])

  const hasChanges =
    fullName.trim() !== initialName.trim() ||
    !!avatarFile ||
    avatarUrl !== initialAvatar ||
    country !== initialCountry

  const displayInitial = (fullName.trim() || user?.email || 'U')
    .charAt(0)
    .toUpperCase()

  const currentAvatar = previewUrl || avatarUrl || ''

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!user) {
      toast.error(t('profile.missingSession'))
      return
    }

    const normalizedName = fullName.trim()

    if (!normalizedName) {
      toast.error(t('profile.nameRequired'))
      return
    }

    try {
      setLoading(true)

      let nextAvatarUrl = avatarUrl || null

      if (avatarFile) {
        nextAvatarUrl = await uploadProfileAvatar(avatarFile, user.id)
      }

      await updateMyProfile(user.id, {
        full_name: normalizedName,
        avatar_url: nextAvatarUrl,
        country: country || null,
      })

      await refreshProfile()

      setAvatarFile(null)
      setAvatarUrl(nextAvatarUrl || '')
      toast.success(t('profile.saveSuccess'))
    } catch (error) {
      console.error(error)
      toast.error(t('profile.saveError'))
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFullName(initialName)
    setAvatarUrl(initialAvatar)
    setCountry(initialCountry)
    setAvatarFile(null)
    setPreviewUrl(null)
  }

  return (
    <div className="bg-bg text-text-primary">
      <section className="px-0 py-2">
          <div className="mx-auto max-w-5xl">
            <SectionCard className="p-8">
              <p className="text-sm uppercase tracking-[0.2em] text-brand-primary">
                {t('profile.badge')}
              </p>
              <h1 className="mt-3 font-heading text-4xl md:text-5xl">
                {t('profile.title')}
              </h1>
              <p className="mt-4 max-w-2xl font-body text-lg text-brand-primary">
                {t('profile.subtitle')}
              </p>
            </SectionCard>
          </div>
        </section>

        <section className="px-0 py-8">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-6 md:grid-cols-[220px_1fr]">
              <SectionCard className="p-6 text-center">
                <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl bg-bg-soft shadow-[var(--shadow-soft)]">
                  {currentAvatar ? (
                    <img
                      src={currentAvatar}
                      alt={fullName.trim() || 'Usuario'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="font-heading text-3xl text-text-primary">
                      {displayInitial}
                    </span>
                  )}
                </div>

                <p className="mt-4 font-medium text-text-primary">
                  {fullName.trim() || 'Usuario'}
                </p>

                <p className="mt-1 break-all text-sm text-brand-primary">
                  {user?.email}
                </p>

                <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-surface-border bg-bg-soft px-3 py-2 text-xs text-brand-primary">
                  <Camera className="h-4 w-4" />
                  {t('profile.avatarBadge')}
                </div>
              </SectionCard>

              <SectionCard className="p-6">
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <AppInput
                      label={t('profile.fullName')}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={t('profile.fullNamePlaceholder')}
                    />

                    <AppInput
                      label={t('profile.email')}
                      type="email"
                      value={user?.email ?? ''}
                      disabled
                    />

                    <CountrySelect
                      label={t('profile.country')}
                      value={country}
                      placeholder={t('common.selectCountry')}
                      onChange={setCountry}
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <p className="mb-2 text-sm font-medium text-text-primary">
                        {t('profile.userId')}
                      </p>
                      <div className="rounded-2xl border border-surface-border bg-bg-soft px-4 py-3 text-sm text-brand-primary">
                        <span className="break-all">{user?.id}</span>
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-sm font-medium text-text-primary">
                        {t('profile.accountStatus')}
                      </p>
                      <div className="rounded-2xl border border-surface-border bg-bg-soft px-4 py-3 text-sm text-text-primary">
                        {t('profile.active')}
                      </div>
                    </div>
                  </div>

                  <FileInput
                    label={t('profile.avatar')}
                    accept="image/*"
                    fileName={avatarFile?.name ?? null}
                    hint={t('profile.avatarHint')}
                    onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                    onClear={() => setAvatarFile(null)}
                  />

                  <div className="flex flex-wrap gap-3">
                    <AppButton type="submit" disabled={loading || !hasChanges}>
                      <Save className="h-4 w-4" />
                      {loading ? t('profile.saving') : t('profile.saveChanges')}
                    </AppButton>

                    <AppButton
                      type="button"
                      variant="secondary"
                      disabled={loading || !hasChanges}
                      onClick={handleReset}
                    >
                      <RotateCcw className="h-4 w-4" />
                      {t('profile.reset')}
                    </AppButton>
                  </div>
                </form>
              </SectionCard>
            </div>
          </div>
        </section>
    </div>
  )
}
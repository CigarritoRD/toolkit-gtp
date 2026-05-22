import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuth } from '@/auth/useAuth'
import {
  getMyContributorProfile,
  updateMyContributorProfile,
} from '@/lib/api/contributor-dashboard'
import { supabase } from '@/lib/supabaseClient'
import SectionCard from '@/components/ui/SectionCard'
import AppInput from '@/components/ui/AppInput'
import AppTextarea from '@/components/ui/AppTextarea'
import AppButton from '@/components/ui/AppButton'
import FileInput from '@/components/ui/FileInput'

function normalizeUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export default function ContributorProfilePage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState('')
  const [shortBio, setShortBio] = useState('')
  const [fullBio, setFullBio] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [facebookUrl, setFacebookUrl] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  useEffect(() => {
    async function load() {
      if (!user?.id) return
      try {
        const data = await getMyContributorProfile(user.id)
        setName(data.name ?? '')
        setShortBio(data.short_bio ?? '')
        setFullBio(data.full_bio ?? '')
        setSpecialty(data.specialty ?? '')
        setAvatarUrl(data.avatar_url ?? '')
        setWebsiteUrl(data.website_url ?? '')
        setInstagramUrl(data.instagram_url ?? '')
        setFacebookUrl(data.facebook_url ?? '')
        setLinkedinUrl(data.linkedin_url ?? '')
        setYoutubeUrl(data.youtube_url ?? '')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t('common.error'))
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [user?.id, t])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!user?.id) return

    try {
      setSaving(true)
      let finalAvatarUrl = avatarUrl

      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop() ?? 'jpg'
        const path = `${user.id}/avatar-${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, avatarFile, { upsert: true })
        if (uploadError) throw uploadError
        const { data } = supabase.storage.from('avatars').getPublicUrl(path)
        finalAvatarUrl = data.publicUrl
      }

      await updateMyContributorProfile(user.id, {
        name: name.trim() || null,
        short_bio: shortBio.trim() || null,
        full_bio: fullBio.trim() || null,
        specialty: specialty.trim() || null,
        avatar_url: finalAvatarUrl || null,
        website_url: normalizeUrl(websiteUrl) || null,
        instagram_url: normalizeUrl(instagramUrl) || null,
        facebook_url: normalizeUrl(facebookUrl) || null,
        linkedin_url: normalizeUrl(linkedinUrl) || null,
        youtube_url: normalizeUrl(youtubeUrl) || null,
      })

      toast.success(t('contributorDashboard.saveSuccess'))
      navigate('/dashboard/contributor')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionCard className="p-6">
          <p className="text-sm text-brand-primary">{t('common.loading')}</p>
        </SectionCard>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.22em] text-brand-primary">
          {t('contributorDashboard.badge')}
        </p>
        <h1 className="mt-2 font-heading text-3xl md:text-4xl">
          {t('contributorDashboard.myProfile')}
        </h1>
        <p className="mt-3 text-sm text-text-secondary">
          {t('contributorDashboard.profileSubtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <SectionCard className="p-6 md:p-8">
          <div className="space-y-4">
            <div>
              <h2 className="font-heading text-lg">{t('contributorDashboard.basicInfo')}</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <AppInput
                label={t('contributorDashboard.name')}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <AppInput
                label={t('contributorDashboard.specialty')}
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              />
            </div>
            <AppTextarea
              label={t('contributorDashboard.shortBio')}
              rows={2}
              value={shortBio}
              onChange={(e) => setShortBio(e.target.value)}
            />
            <AppTextarea
              label={t('contributorDashboard.fullBio')}
              rows={6}
              value={fullBio}
              onChange={(e) => setFullBio(e.target.value)}
            />
          </div>
        </SectionCard>

        <SectionCard className="p-6 md:p-8">
          <div className="space-y-4">
            <div>
              <h2 className="font-heading text-lg">{t('contributorDashboard.avatar')}</h2>
            </div>
            <FileInput
              label={t('contributorDashboard.avatar')}
              accept="image/*"
              fileName={avatarFile?.name ?? null}
              hint="PNG, JPG o WEBP (máx. 2 MB)"
              maxSize={2 * 1024 * 1024}
              onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
              onClear={() => setAvatarFile(null)}
            />
            {avatarUrl && !avatarFile && (
              <img src={avatarUrl} alt="Avatar" className="h-20 w-20 rounded-full object-cover" />
            )}
          </div>
        </SectionCard>

        <SectionCard className="p-6 md:p-8">
          <div className="space-y-4">
            <div>
              <h2 className="font-heading text-lg">{t('contributorDashboard.links')}</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <AppInput
                label={t('contributorDashboard.website')}
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://..."
              />
              <AppInput
                label="Instagram"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/..."
              />
              <AppInput
                label="Facebook"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="https://facebook.com/..."
              />
              <AppInput
                label="LinkedIn"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/..."
              />
              <AppInput
                label="YouTube"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/..."
              />
            </div>
          </div>
        </SectionCard>

        <div className="flex gap-3">
          <AppButton type="submit" disabled={saving}>
            {saving ? t('common.saving') : t('common.save')}
          </AppButton>
          <AppButton variant="secondary" onClick={() => navigate('/dashboard/contributor')}>
            {t('common.cancel')}
          </AppButton>
        </div>
      </form>
    </div>
  )
}
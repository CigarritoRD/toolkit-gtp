import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import FadeIn from '@/components/ui/FadeIn'
import SectionCard from '@/components/ui/SectionCard'
import AppButton from '@/components/ui/AppButton'
import AppInput from '@/components/ui/AppInput'
import AppTextarea from '@/components/ui/AppTextarea'
import { supabase } from '@/lib/supabaseClient'

export default function BecomeContributorPage() {
  const { t } = useTranslation()

  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    contact_name: '',
    contact_email: '',
    contact_role: '',
    contact_phone: '',
    organization_name: '',
    country: '',
    organization: '',
    specialty: '',
    short_bio: '',
    full_bio: '',
    website_url: '',
  })

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const validate = () => {
    if (!form.contact_name) {
      toast.error(t('contributorApply.validation.contactName'))
      return false
    }
    if (!form.contact_email) {
      toast.error(t('contributorApply.validation.contactEmail'))
      return false
    }
    if (!form.organization_name) {
      toast.error(t('contributorApply.validation.organizationName'))
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validate()) return

    try {
      setLoading(true)

      const { error } = await supabase
        .from('contributor_applications')
        .insert([form])

      if (error) throw error

      toast.success(t('contributorApply.success'))

      setForm({
        contact_name: '',
        contact_email: '',
        contact_role: '',
        contact_phone: '',
        organization_name: '',
        country: '',
        organization: '',
        specialty: '',
        short_bio: '',
        full_bio: '',
        website_url: '',
      })
    } catch (err) {
      console.error(err)
      toast.error(t('contributorApply.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-bg text-text-primary">
      <FadeIn>
        <section className="relative px-6 py-14 md:px-10 lg:px-16 lg:py-16">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-accent/5" />

          <div className="relative mx-auto max-w-4xl">
            <p className="text-sm uppercase tracking-[0.22em] text-brand-primary">
              {t('contributorApply.badge')}
            </p>

            <h1 className="mt-4 font-heading text-4xl md:text-5xl">
              {t('contributorApply.title')}
            </h1>

            <p className="mt-5 text-lg leading-8 text-text-secondary">
              {t('contributorApply.subtitle')}
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <SectionCard className="p-5">
                <h3 className="font-heading text-lg">
                  {t('contributorApply.point1Title')}
                </h3>
                <p className="mt-2 text-sm text-text-secondary">
                  {t('contributorApply.point1Body')}
                </p>
              </SectionCard>

              <SectionCard className="p-5">
                <h3 className="font-heading text-lg">
                  {t('contributorApply.point2Title')}
                </h3>
                <p className="mt-2 text-sm text-text-secondary">
                  {t('contributorApply.point2Body')}
                </p>
              </SectionCard>
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.08}>
        <section className="px-6 pb-16 md:px-10 lg:px-16">
          <div className="mx-auto max-w-4xl">
            <SectionCard className="p-6 md:p-8 space-y-8">

              {/* CONTACT */}
              <div>
                <h2 className="font-heading text-xl">
                  {t('contributorApply.contactSection')}
                </h2>
                <p className="mt-2 text-sm text-text-secondary">
                  {t('contributorApply.contactHelp')}
                </p>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <AppInput
                    label={t('contributorApply.contactName')}
                    value={form.contact_name}
                    onChange={(e) => handleChange('contact_name', e.target.value)}
                  />

                  <AppInput
                    label={t('contributorApply.contactEmail')}
                    value={form.contact_email}
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                  />

                  <AppInput
                    label={t('contributorApply.contactRole')}
                    value={form.contact_role}
                    onChange={(e) => handleChange('contact_role', e.target.value)}
                  />

                  <AppInput
                    label={t('contributorApply.contactPhone')}
                    value={form.contact_phone}
                    onChange={(e) => handleChange('contact_phone', e.target.value)}
                  />
                </div>
              </div>

              {/* ORGANIZATION */}
              <div>
                <h2 className="font-heading text-xl">
                  {t('contributorApply.ministrySection')}
                </h2>
                <p className="mt-2 text-sm text-text-secondary">
                  {t('contributorApply.ministryHelp')}
                </p>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <AppInput
                    label={t('contributorApply.organizationName')}
                    value={form.organization_name}
                    onChange={(e) =>
                      handleChange('organization_name', e.target.value)
                    }
                  />

                  <AppInput
                    label={t('contributorApply.country')}
                    value={form.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                  />

                  <AppInput
                    label={t('contributorApply.organization')}
                    value={form.organization}
                    onChange={(e) =>
                      handleChange('organization', e.target.value)
                    }
                  />

                  <AppInput
                    label={t('contributorApply.specialty')}
                    value={form.specialty}
                    onChange={(e) =>
                      handleChange('specialty', e.target.value)
                    }
                  />
                </div>
              </div>

              {/* DESCRIPTION */}
              <div>
                <h2 className="font-heading text-xl">
                  {t('contributorApply.descriptionSection')}
                </h2>

                <div className="mt-5 space-y-4">
                  <AppTextarea
                    label={t('contributorApply.shortBio')}
                    value={form.short_bio}
                    onChange={(e) =>
                      handleChange('short_bio', e.target.value)
                    }
                  />

                  <AppTextarea
                    label={t('contributorApply.fullBio')}
                    value={form.full_bio}
                    onChange={(e) =>
                      handleChange('full_bio', e.target.value)
                    }
                  />
                </div>
              </div>

              {/* LINKS */}
              <div>
                <h2 className="font-heading text-xl">
                  {t('contributorApply.linksSection')}
                </h2>

                <div className="mt-5">
                  <AppInput
                    label={t('contributorApply.website')}
                    value={form.website_url}
                    onChange={(e) =>
                      handleChange('website_url', e.target.value)
                    }
                  />
                </div>
              </div>

              {/* SUBMIT */}
              <div className="pt-4">
                <AppButton
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full md:w-auto"
                >
                  {loading
                    ? t('contributorApply.submitting')
                    : t('contributorApply.submit')}
                </AppButton>
              </div>
            </SectionCard>
          </div>
        </section>
      </FadeIn>
    </div>
  )
}
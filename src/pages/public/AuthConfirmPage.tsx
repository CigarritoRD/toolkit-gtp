import { CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SectionCard from '@/components/ui/SectionCard'
import AppButton from '@/components/ui/AppButton'

export default function AuthConfirmPage() {
  const { t } = useTranslation()

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg px-6 text-text-primary">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(0,116,115,0.12),transparent_40%),radial-gradient(circle_at_top_right,rgba(0,171,199,0.10),transparent_35%)]" />

      <SectionCard className="w-full max-w-md p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-primary/10">
          <CheckCircle2 className="h-8 w-8 text-brand-primary" />
        </div>

        <h1 className="mt-6 font-heading text-3xl">
          {t('auth.confirmTitle')}
        </h1>
        <p className="mt-3 text-sm text-text-secondary">
          {t('auth.confirmSubtitle')}
        </p>

        <div className="mt-8">
          <Link to="/login">
            <AppButton className="w-full">
              {t('auth.confirmAction')}
            </AppButton>
          </Link>
        </div>
      </SectionCard>
    </div>
  )
}
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import gtpLogo from '@/assets/gtp-logo.png'

export default function PublicFooter() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-surface-border/70 bg-bg-soft/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-[1.1fr_0.9fr_1fr] md:px-10 lg:px-16">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-surface-border bg-surface shadow-[var(--shadow-soft)]">
              <img
                src={gtpLogo}
                alt="GTP"
                className="h-11 w-11 object-contain"
              />
            </div>

            <div>
              <h3 className="font-heading text-xl text-text-primary">Toolkit</h3>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-brand-primary">
                by GTP
              </p>
            </div>
          </div>

          <p className="mt-5 max-w-md text-sm leading-7 text-brand-primary">
            {t('footer.description')}
          </p>

          <div className="mt-6 rounded-xl border border-surface-border bg-surface p-5 shadow-[var(--shadow-soft)]">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-primary">
              {t('footer.poweredBy')}
            </p>

            <div className="mt-3 flex items-center gap-3">
              <img
                src={gtpLogo}
                alt="GTP"
                className="h-10 w-10 object-contain"
              />
              <div>
                <p className="font-heading text-lg text-text-primary">Global Trust Partners</p>
                <p className="text-sm text-brand-primary">
                  {t('footer.poweredByBody')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-heading text-sm uppercase tracking-[0.2em] text-brand-primary">
            {t('footer.navigation')}
          </h4>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            <Link
              to="/"
              className="text-brand-primary transition hover:text-text-primary"
            >
              {t('footer.home')}
            </Link>
            <Link
              to="/resources"
              className="text-brand-primary transition hover:text-text-primary"
            >
              {t('footer.resources')}
            </Link>
            <Link
              to="/contributors"
              className="text-brand-primary transition hover:text-text-primary"
            >
              {t('footer.contributors')}
            </Link>
            <Link
              to="/become-a-contributor"
              className="text-brand-primary transition hover:text-text-primary"
            >
              {t('footer.becomeContributor')}
            </Link>
          </div>
        </div>

        <div>
          <h4 className="font-heading text-sm uppercase tracking-[0.2em] text-brand-primary">
            {t('footer.contribute')}
          </h4>

          <div className="mt-4 rounded-xl border border-surface-border bg-surface p-5 shadow-[var(--shadow-soft)]">
            <h5 className="font-heading text-lg text-text-primary">
              {t('footer.contributeTitle')}
            </h5>

            <p className="mt-3 text-sm leading-7 text-brand-primary">
              {t('footer.contributeBody')}
            </p>

            <Link
              to="/become-a-contributor"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-accent transition hover:underline"
            >
              {t('footer.becomeContributor')} →
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-surface-border/70 px-6 py-4 md:px-10 lg:px-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 text-xs text-brand-primary md:flex-row md:items-center md:justify-between">
          <p>{t('footer.rights')}</p>
          <p>{t('footer.madeFor')}</p>
        </div>
      </div>
    </footer>
  )
}
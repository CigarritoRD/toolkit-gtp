import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from '@/locales/en/common'
import es from '@/locales/es/common'
import zh from '@/locales/zh/common'

const savedLanguage =
  typeof window !== 'undefined' ? localStorage.getItem('tb-language') : null

void i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: en,
    },
      es: {
        common: es,
      },
      zh: {
        common: zh,
      },
  },
  lng: savedLanguage || 'es',
  fallbackLng: 'es',
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
})

i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('tb-language', lng)
    document.documentElement.lang = lng
  }
})

export default i18n
// src/components/ui/CountryFlag.tsx

import { getCountryByCode } from '@/lib/constants/countries'

type CountryFlagProps = {
  code?: string | null
  className?: string
}

export default function CountryFlag({ code, className = '' }: CountryFlagProps) {
  const country = getCountryByCode(code)

  if (!country) {
    return (
      <span
        className={`inline-flex h-5 w-7 items-center justify-center rounded bg-bg-soft text-[10px] font-bold text-text-secondary ${className}`}
      >
        --
      </span>
    )
  }

  return (
    <span
      className={`fi fi-${country.flagCode} rounded-sm shadow-sm ${className}`}
      title={country.name}
      aria-label={country.name}
    />
  )
}
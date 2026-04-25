export const COUNTRIES = [
  // América
  { code: 'AR', name: 'Argentina', flagCode:'ar' },
  { code: 'BO', name: 'Bolivia', flagCode: 'bo' },
  { code: 'BR', name: 'Brazil', flagCode: 'br' },
  { code: 'CA', name: 'Canada', flagCode: 'ca' },
  { code: 'CL', name: 'Chile', flagCode: 'cl' },
  { code: 'CO', name: 'Colombia', flagCode: 'co' },
  { code: 'CR', name: 'Costa Rica', flagCode: 'cr' },
  { code: 'CU', name: 'Cuba', flagCode: 'cu' },
  { code: 'DO', name: 'Dominican Republic', flagCode:'do' },
  { code: 'EC', name: 'Ecuador', flagCode: 'ec' },
  { code: 'SV', name: 'El Salvador', flagCode: 'sv' },
  { code: 'GT', name: 'Guatemala', flagCode: 'gt' },
  { code: 'HN', name: 'Honduras', flagCode: 'hn' },
  { code: 'MX', name: 'Mexico', flagCode: 'mx' },
  { code: 'NI', name: 'Nicaragua', flagCode: 'ni' },
  { code: 'PA', name: 'Panama', flagCode: 'pa' },
  { code: 'PY', name: 'Paraguay', flagCode: 'py' },
  { code: 'PE', name: 'Peru', flagCode: 'pe' },
  { code: 'PR', name: 'Puerto Rico', flagCode: 'pr' },
  { code: 'US', name: 'United States', flagCode: 'us' },
  { code: 'UY', name: 'Uruguay', flagCode: 'uy' },
  { code: 'VE', name: 'Venezuela', flagCode: 've' },
  
  // Europa
  { code: 'ES', name: 'Spain', flagCode: 'es' },
  { code: 'FR', name: 'France', flagCode: 'fr' },
  { code: 'DE', name: 'Germany', flagCode: 'de' },
  { code: 'IT', name: 'Italy', flagCode: 'it' },
  { code: 'PT', name: 'Portugal', flagCode: 'pt' },
  { code: 'GB', name: 'United Kingdom', flagCode: 'gb' },
  { code: 'NL', name: 'Netherlands', flagCode: 'nl' },

  // Asia 
  { code: 'CN', name: 'China', flagCode: 'cn' },
  { code: 'JP', name: 'Japan', flagCode: 'jp' },
  { code: 'KR', name: 'South Korea', flagCode: 'kr' },
  { code: 'IN', name: 'India', flagCode: 'in' },
  { code: 'PH', name: 'Philippines', flagCode: 'ph' },
  { code: 'ID', name: 'Indonesia', flagCode: 'id' },
  { code: 'TH', name: 'Thailand', flagCode: 'th' },
  { code: 'TW', name: 'Taiwan', flagCode: 'tw' },

  // África
  { code: 'ZA', name: 'South Africa', flagCode: 'za' },
  { code: 'NG', name: 'Nigeria', flagCode: 'ng' },
  { code: 'EG', name: 'Egypt', flagCode: 'eg' },

  // Oceanía
  { code: 'AU', name: 'Australia', flagCode: 'au' },
  { code: 'NZ', name: 'New Zealand', flagCode: 'nz' },
]



export function getCountryByCode(code?: string | null) {
  if (!code) return null

  return COUNTRIES.find(
    (country) => country.code.toLowerCase() === code.toLowerCase(),
  ) ?? null
}

export function getCountryLabel(code?: string | null) {
  const country = getCountryByCode(code)

  if (!country) return code || 'Unknown'

  return country.name
}
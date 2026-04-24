import AppSelect from '@/components/ui/AppSelect'
import { COUNTRIES } from '@/lib/constants/countries'

type CountrySelectProps = {
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
}

export default function CountrySelect({
  label,
  value,
  placeholder,
  onChange,
}: CountrySelectProps) {
  return (
    <AppSelect
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {COUNTRIES.map((country) => (
        <option key={country.code} value={country.code}>
          {country.flag} {country.name}
        </option>
      ))}
    </AppSelect>
  )
}
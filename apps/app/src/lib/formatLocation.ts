import { Country, State } from 'country-state-city'

/**
 * Helper function to format metadata location strings
 * @param locationString string in the format country-province-city
 * @returns the formatted location string
 */
export const formatLocation = (locationString: string) => {
  const [country, province, city] = locationString.split('-', 3)

  const countryCode =
    Country.getAllCountries().find((c) => c.name === country)?.isoCode ?? ''
  const provinceCode = State.getStatesOfCountry(countryCode).find(
    (p) => p.name === province
  )?.isoCode

  if (!city || !provinceCode) return ''

  return `${city}, ${provinceCode}`.toUpperCase()
}

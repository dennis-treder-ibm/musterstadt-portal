const LOCALE = 'de-DE'
const TIME_ZONE = 'Europe/Berlin'

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: TIME_ZONE,
})

const currencyFormatter = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'EUR' })

/** Formats an ISO date (or Date) as dd.MM.yyyy. Returns the fallback for empty/invalid input. */
export function formatDate(value: string | Date | null | undefined, fallback = '–'): string {
  if (!value) return fallback
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? fallback : dateFormatter.format(date)
}

/** Formats an amount in EUR using German conventions (decimal comma, € suffix). */
export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount)
}

/** Joins non-empty address parts, e.g. "Hauptstraße 5, 80331 München". */
export function formatAddress(parts: {
  street?: string | null
  houseNumber?: string | null
  postcode?: string | null
  city?: string | null
}): string {
  const street = [parts.street, parts.houseNumber].filter(Boolean).join(' ')
  const town = [parts.postcode, parts.city].filter(Boolean).join(' ')
  return [street, town].filter(Boolean).join(', ')
}

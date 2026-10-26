import { ApplicationStatus, ApplicationType } from '@/types/domain'

const LOCALE = 'de-DE'

const dateFormatter = new Intl.DateTimeFormat(LOCALE, { day: '2-digit', month: '2-digit', year: 'numeric' })
const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium', timeStyle: 'short' })
const currencyFormatter = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'EUR' })

function toDate(value: string | Date | undefined | null): Date | null {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/** dd.MM.yyyy; returns an em dash for missing/invalid values. */
export function formatDate(value: string | Date | undefined | null): string {
  const date = toDate(value)
  return date ? dateFormatter.format(date) : '—'
}

export function formatDateTime(value: string | Date | undefined | null): string {
  const date = toDate(value)
  return date ? dateTimeFormatter.format(date) : '—'
}

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

export function formatFullName(person: { firstName?: string; lastName?: string }): string {
  return [person.firstName, person.lastName].filter(Boolean).join(' ')
}

/** "Musterstraße 1, 12345 Musterstadt" - skips missing parts. */
export function formatAddress(a: { street?: string; houseNumber?: string; postcode?: string; city?: string }): string {
  const street = [a.street, a.houseNumber].filter(Boolean).join(' ')
  const city = [a.postcode, a.city].filter(Boolean).join(' ')
  return [street, city].filter(Boolean).join(', ')
}

/** Vehicle registrations are stored upper-case and trimmed (architecture.md 4.2). */
export function normalizeVehicleRegistration(value: string): string {
  return value.trim().toUpperCase()
}

export const APPLICATION_TYPE_LABELS: Record<ApplicationType, string> = {
  [ApplicationType.Parking]: 'Parkausweis',
  [ApplicationType.Address]: 'Adressänderung',
  [ApplicationType.Dog]: 'Hundeanmeldung',
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.Pending]: 'Ausstehend',
  [ApplicationStatus.Approved]: 'Genehmigt',
  [ApplicationStatus.Rejected]: 'Abgelehnt',
}

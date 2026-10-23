import type { ValidationResult } from '@/types/api'

/**
 * Client-side validators. They mirror the backend rules (ParkingResource, AddressResource,
 * DogResource) so users get immediate feedback; the server remains the source of truth.
 * Each validator returns an error message, or null when the value is valid.
 */

export const VEHICLE_REGISTRATION_MIN_LENGTH = 5
export const POSTCODE_LENGTH = 5

export function required(message: string) {
  return (value: string | null | undefined): ValidationResult => (value?.trim() ? null : message)
}

export function validateVehicleRegistration(value: string | null | undefined): ValidationResult {
  return (value?.trim().length ?? 0) >= VEHICLE_REGISTRATION_MIN_LENGTH
    ? null
    : `Fahrzeugkennzeichen muss mindestens ${VEHICLE_REGISTRATION_MIN_LENGTH} Zeichen lang sein.`
}

export const validateZone = required('Bitte wählen Sie eine Parkzone aus.')
export const validateStreet = required('Straße darf nicht leer sein.')
export const validateCity = required('Ort darf nicht leer sein.')
export const validateDogName = required('Hundename darf nicht leer sein.')

/** Backend only checks length === 5 (known demo weakness); we additionally require digits. */
export function validatePostcode(value: string | null | undefined): ValidationResult {
  return /^\d{5}$/.test(value ?? '') ? null : 'Postleitzahl ungültig'
}

/** Runs a map of validators and returns only the failing fields. */
export function validateAll<T extends Record<string, string | null | undefined>>(
  values: T,
  rules: { [K in keyof T]?: (value: T[K]) => ValidationResult },
): Partial<Record<keyof T, string>> {
  const errors: Partial<Record<keyof T, string>> = {}
  for (const key of Object.keys(rules) as (keyof T)[]) {
    const message = rules[key]?.(values[key])
    if (message) errors[key] = message
  }
  return errors
}

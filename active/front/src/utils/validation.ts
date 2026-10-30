/**
 * Client-side validators mirroring the backend rules in architecture.md section 4.
 * They only improve UX; the Quarkus backend remains the source of truth.
 * Each validator returns an error message (German) or `undefined` when valid.
 */
export type Validator<T = string> = (value: T) => string | undefined

export const required =
  (message = 'Dieses Feld ist erforderlich.'): Validator =>
  (value) =>
    value.trim() === '' ? message : undefined

export const minLength =
  (min: number, message = `Mindestens ${min} Zeichen erforderlich.`): Validator =>
  (value) =>
    value.trim().length < min ? message : undefined

export const exactLength =
  (length: number, message = `Genau ${length} Zeichen erforderlich.`): Validator =>
  (value) =>
    value.trim().length !== length ? message : undefined

export const maxLength =
  (max: number, message = `Höchstens ${max} Zeichen erlaubt.`): Validator =>
  (value) =>
    value.trim().length > max ? message : undefined

export const matches =
  (pattern: RegExp, message: string): Validator =>
  (value) =>
    pattern.test(value.trim()) ? undefined : message

/** Runs validators in order and returns the first error. */
export function compose<T = string>(...validators: Array<Validator<T>>): Validator<T> {
  return (value) => {
    for (const validate of validators) {
      const error = validate(value)
      if (error) return error
    }
    return undefined
  }
}

/** Validates a record of values against per-field validators; returns only fields with errors. */
export function validateForm<T extends Record<string, string>>(
  values: T,
  rules: { [K in keyof T]?: Validator },
): Partial<Record<keyof T, string>> {
  const errors: Partial<Record<keyof T, string>> = {}
  for (const key of Object.keys(rules) as Array<keyof T>) {
    const error = rules[key]?.(values[key] ?? '')
    if (error) errors[key] = error
  }
  return errors
}

/* ---- Domain rules (architecture.md section 4) ---- */

/** Parking: vehicle registration >= 5 characters. */
export const vehicleRegistration = compose(required(), minLength(5, 'Das Kennzeichen muss mindestens 5 Zeichen lang sein.'))

/** Address: German postcode (PLZ), 5 digits. Stricter than the legacy length-only check (see TECHNICAL_DEBT). */
export const postcode = compose(required(), matches(/^\d{5}$/, 'Die Postleitzahl muss aus genau 5 Ziffern bestehen.'))

/** Dog: ISO 11784 chip numbers have 15 digits; the field is optional. */
export const chipNumber: Validator = (value) =>
  value.trim() === '' ? undefined : matches(/^\d{15}$/, 'Die Chipnummer muss aus 15 Ziffern bestehen.')(value)

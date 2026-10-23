import { describe, expect, it } from 'vitest'
import { formatAddress, formatCurrency, formatDate } from './format'
import {
  validateAll,
  validateCity,
  validatePostcode,
  validateStreet,
  validateVehicleRegistration,
  validateZone,
} from './validation'
import { cleanPayload, emptyToUndefined, groupBy } from './transform'

describe('format', () => {
  it('formats ISO dates as dd.MM.yyyy', () => {
    expect(formatDate('2024-03-07T10:00:00Z')).toBe('07.03.2024')
  })

  it('returns the fallback for empty or invalid dates', () => {
    expect(formatDate(null)).toBe('–')
    expect(formatDate('not-a-date', 'n/a')).toBe('n/a')
  })

  it('formats currency with German conventions', () => {
    expect(formatCurrency(1234.5).replace(/\s/g, ' ')).toBe('1.234,50 €')
  })

  it('joins address parts and skips empty ones', () => {
    expect(formatAddress({ street: 'Hauptstraße', houseNumber: '5', postcode: '80331', city: 'München' })).toBe(
      'Hauptstraße 5, 80331 München',
    )
    expect(formatAddress({ street: 'Hauptstraße', houseNumber: null, postcode: null, city: 'München' })).toBe(
      'Hauptstraße, München',
    )
  })
})

describe('validation', () => {
  it('requires vehicle registrations of at least 5 characters', () => {
    expect(validateVehicleRegistration('M-AB1')).toBeNull()
    expect(validateVehicleRegistration('M-A1')).not.toBeNull()
    expect(validateVehicleRegistration('   ')).not.toBeNull()
    expect(validateVehicleRegistration(undefined)).not.toBeNull()
  })

  it('requires non-blank zone, street and city', () => {
    for (const validate of [validateZone, validateStreet, validateCity]) {
      expect(validate('x')).toBeNull()
      expect(validate('  ')).not.toBeNull()
      expect(validate(null)).not.toBeNull()
    }
  })

  it('accepts only five-digit postcodes', () => {
    expect(validatePostcode('80331')).toBeNull()
    expect(validatePostcode('8033')).toBe('Postleitzahl ungültig')
    expect(validatePostcode('ABCDE')).toBe('Postleitzahl ungültig')
  })

  it('validateAll returns only failing fields', () => {
    const errors = validateAll(
      { street: '', postcode: '80331', city: '' },
      { street: validateStreet, postcode: validatePostcode, city: validateCity },
    )
    expect(Object.keys(errors).sort()).toEqual(['city', 'street'])
  })
})

describe('transform', () => {
  it('converts blank strings to undefined', () => {
    expect(emptyToUndefined('  ')).toBeUndefined()
    expect(emptyToUndefined(' a ')).toBe('a')
  })

  it('cleanPayload trims values and drops blanks', () => {
    expect(cleanPayload({ dogName: ' Rex ', breed: '  ', chipNumber: undefined })).toEqual({ dogName: 'Rex' })
  })

  it('groups items by key', () => {
    const grouped = groupBy([{ s: 'A' }, { s: 'B' }, { s: 'A' }], (i) => i.s)
    expect(grouped.A).toHaveLength(2)
    expect(grouped.B).toHaveLength(1)
  })
})

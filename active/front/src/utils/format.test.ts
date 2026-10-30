import { formatAddress, formatDate, formatFullName, normalizeVehicleRegistration } from './format'
import { cleanPayload, nullsToUndefined, toQueryParams } from './transform'

describe('format', () => {
  it('formats dates as dd.MM.yyyy and handles invalid input', () => {
    expect(formatDate('2024-03-05T12:00:00Z')).toBe('05.03.2024')
    expect(formatDate(undefined)).toBe('—')
    expect(formatDate('not-a-date')).toBe('—')
  })

  it('formats names and addresses skipping missing parts', () => {
    expect(formatFullName({ firstName: 'Erika', lastName: 'Muster' })).toBe('Erika Muster')
    expect(formatAddress({ street: 'Hauptstr.', houseNumber: '1', postcode: '12345', city: 'Musterstadt' })).toBe(
      'Hauptstr. 1, 12345 Musterstadt',
    )
    expect(formatAddress({ city: 'Musterstadt' })).toBe('Musterstadt')
  })

  it('normalizes vehicle registration', () => {
    expect(normalizeVehicleRegistration('  ab 123 ')).toBe('AB 123')
  })
})

describe('transform', () => {
  it('nullsToUndefined works recursively', () => {
    expect(nullsToUndefined({ a: null, b: [null, { c: null, d: 1 }] })).toEqual({
      a: undefined,
      b: [undefined, { c: undefined, d: 1 }],
    })
  })

  it('cleanPayload trims and drops empty values', () => {
    expect(cleanPayload({ a: ' x ', b: '', c: undefined, d: 0 })).toEqual({ a: 'x', d: 0 })
  })

  it('toQueryParams skips empty values', () => {
    expect(toQueryParams({ q: 'rex', page: 2, empty: '', none: undefined }).toString()).toBe('q=rex&page=2')
  })
})

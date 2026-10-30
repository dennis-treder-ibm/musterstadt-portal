import { chipNumber, compose, exactLength, minLength, postcode, required, validateForm, vehicleRegistration } from './validation'

describe('validators', () => {
  it('required rejects blank strings', () => {
    expect(required()('  ')).toBeDefined()
    expect(required()('x')).toBeUndefined()
  })

  it('minLength / exactLength', () => {
    expect(minLength(5)('abcd')).toBeDefined()
    expect(minLength(5)('abcde')).toBeUndefined()
    expect(exactLength(5)('abcd')).toBeDefined()
    expect(exactLength(5)('abcde')).toBeUndefined()
  })

  it('compose returns first error', () => {
    const v = compose(required('A'), minLength(3, 'B'))
    expect(v('')).toBe('A')
    expect(v('ab')).toBe('B')
    expect(v('abc')).toBeUndefined()
  })

  it('validateForm only reports invalid fields', () => {
    const errors = validateForm({ a: '', b: 'ok' }, { a: required(), b: required() })
    expect(Object.keys(errors)).toEqual(['a'])
  })
})

describe('domain rules', () => {
  it('vehicleRegistration needs >= 5 chars', () => {
    expect(vehicleRegistration('AB 12')).toBeUndefined()
    expect(vehicleRegistration('AB1')).toBeDefined()
    expect(vehicleRegistration('')).toBeDefined()
  })

  it('postcode needs exactly 5 digits', () => {
    expect(postcode('12345')).toBeUndefined()
    expect(postcode('1234')).toBeDefined()
    expect(postcode('abcde')).toBeDefined()
  })

  it('chipNumber is optional but must be 15 digits', () => {
    expect(chipNumber('')).toBeUndefined()
    expect(chipNumber('123456789012345')).toBeUndefined()
    expect(chipNumber('123')).toBeDefined()
  })
})

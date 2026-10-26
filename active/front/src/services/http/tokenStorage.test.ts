import { decodeJwtPayload, isTokenExpired, tokenStorage } from './tokenStorage'

function makeJwt(payload: object): string {
  const enc = (o: object) =>
    btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(o))))
      .replace(/=+$/, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
  return `${enc({ alg: 'none' })}.${enc(payload)}.sig`
}

describe('tokenStorage', () => {
  beforeEach(() => tokenStorage.clear())

  it('stores, reads and clears the token', () => {
    expect(tokenStorage.get()).toBeNull()
    tokenStorage.set('abc')
    expect(tokenStorage.get()).toBe('abc')
    expect(window.sessionStorage.getItem('bp.accessToken')).toBe('abc')
    tokenStorage.clear()
    expect(tokenStorage.get()).toBeNull()
  })
})

describe('JWT helpers', () => {
  it('decodes payloads including unicode', () => {
    expect(decodeJwtPayload(makeJwt({ name: 'Jürgen' }))).toEqual({ name: 'Jürgen' })
  })

  it('returns null for malformed tokens', () => {
    expect(decodeJwtPayload('garbage')).toBeNull()
  })

  it('detects expiry', () => {
    const now = 1_700_000_000_000
    expect(isTokenExpired(makeJwt({ exp: now / 1000 - 100 }), 10, now)).toBe(true)
    expect(isTokenExpired(makeJwt({ exp: now / 1000 + 1000 }), 10, now)).toBe(false)
    expect(isTokenExpired(makeJwt({}), 10, now)).toBe(false)
  })
})

/**
 * Access-token storage.
 *
 * The token is kept in memory plus sessionStorage (cleared when the tab closes).
 * Note: any script-accessible storage is exposed to XSS. If the Quarkus backend
 * issues httpOnly + SameSite session cookies instead, replace this with
 * `VITE_API_WITH_CREDENTIALS=true` and drop the Authorization header.
 */
const STORAGE_KEY = 'bp.accessToken'

let memoryToken: string | null = null

function safeStorage(): Storage | null {
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

export const tokenStorage = {
  get(): string | null {
    if (memoryToken) return memoryToken
    memoryToken = safeStorage()?.getItem(STORAGE_KEY) ?? null
    return memoryToken
  },
  set(token: string): void {
    memoryToken = token
    safeStorage()?.setItem(STORAGE_KEY, token)
  },
  clear(): void {
    memoryToken = null
    safeStorage()?.removeItem(STORAGE_KEY)
  },
}

/** Decodes the JWT payload (no signature verification - server remains the authority). */
export function decodeJwtPayload<T extends Record<string, unknown>>(token: string): T | null {
  const part = token.split('.')[1]
  if (!part) return null
  try {
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    )
    return JSON.parse(json) as T
  } catch {
    return null
  }
}

export function isTokenExpired(token: string, skewSeconds = 10, now = Date.now()): boolean {
  const payload = decodeJwtPayload<{ exp?: number }>(token)
  if (!payload?.exp) return false
  return payload.exp * 1000 <= now + skewSeconds * 1000
}

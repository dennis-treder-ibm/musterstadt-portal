/**
 * Client-side session. The Quarkus backend is stateless: POST /api/auth/login returns a
 * citizenId which must be sent as `X-Citizen-Id` on every request. The session is kept in
 * sessionStorage so it ends with the browser tab.
 */
export interface AuthSession {
  citizenId: number
  username: string
}

const STORAGE_KEY = 'musterstadt.session'

function isAuthSession(value: unknown): value is AuthSession {
  if (typeof value !== 'object' || value === null) return false
  const { citizenId, username } = value as Record<string, unknown>
  return typeof citizenId === 'number' && typeof username === 'string'
}

export function loadSession(): AuthSession | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isAuthSession(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function saveSession(session: AuthSession): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    // Storage unavailable (private mode / quota): the session then lives in memory only.
  }
}

export function clearSession(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

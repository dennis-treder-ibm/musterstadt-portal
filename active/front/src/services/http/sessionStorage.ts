/**
 * Client-side session storage.
 *
 * The REST backend is stateless: login returns `{ citizenId, username }` and every
 * later request identifies the citizen via the `X-Citizen-Id` header. The session is
 * kept in memory plus sessionStorage (cleared when the tab closes).
 */
const STORAGE_KEY = 'bp.session'

export interface StoredSession {
  citizenId: number
  username: string
}

let memorySession: StoredSession | null = null

function safeStorage(): Storage | null {
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

function isStoredSession(value: unknown): value is StoredSession {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return typeof candidate.citizenId === 'number' && Number.isFinite(candidate.citizenId) && typeof candidate.username === 'string'
}

export const sessionStore = {
  get(): StoredSession | null {
    if (memorySession) return memorySession
    const raw = safeStorage()?.getItem(STORAGE_KEY)
    if (!raw) return null
    try {
      const parsed: unknown = JSON.parse(raw)
      memorySession = isStoredSession(parsed) ? parsed : null
    } catch {
      memorySession = null
    }
    return memorySession
  },
  set(session: StoredSession): void {
    memorySession = session
    safeStorage()?.setItem(STORAGE_KEY, JSON.stringify(session))
  },
  clear(): void {
    memorySession = null
    safeStorage()?.removeItem(STORAGE_KEY)
  },
}

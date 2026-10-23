import type { ApiError } from '@/services/http'
import type { ApiErrorCode } from '@/types/api'

/** German, citizen-friendly fallbacks per error code (UI language of the portal is German). */
const MESSAGES: Record<ApiErrorCode, string> = {
  BAD_REQUEST: 'Die Anfrage ist ungültig. Bitte prüfen Sie Ihre Eingaben.',
  VALIDATION_ERROR: 'Bitte prüfen Sie Ihre Eingaben.',
  UNAUTHORIZED: 'Bitte melden Sie sich an.',
  FORBIDDEN: 'Sie haben keine Berechtigung für diese Aktion.',
  NOT_FOUND: 'Die angeforderten Daten wurden nicht gefunden.',
  SERVER_ERROR: 'Der Server ist derzeit nicht erreichbar. Bitte versuchen Sie es später erneut.',
  NETWORK_ERROR: 'Keine Verbindung zum Server. Bitte prüfen Sie Ihre Internetverbindung.',
  TIMEOUT: 'Der Server antwortet nicht rechtzeitig. Bitte versuchen Sie es erneut.',
  CANCELED: 'Die Anfrage wurde abgebrochen.',
  UNKNOWN: 'Ein unerwarteter Fehler ist aufgetreten.',
}

/** Codes for which the backend message is written for citizens and safe to show verbatim. */
const SERVER_MESSAGE_CODES: readonly ApiErrorCode[] = ['VALIDATION_ERROR', 'BAD_REQUEST', 'NOT_FOUND', 'UNAUTHORIZED']

function isApiError(error: unknown): error is ApiError {
  return error instanceof Error && error.name === 'ApiError'
}

/** Returns a message suitable for display. Never leaks stack traces or technical details. */
export function getUserMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.status !== null && SERVER_MESSAGE_CODES.includes(error.code) && error.message) {
      return error.message
    }
    return MESSAGES[error.code]
  }
  return MESSAGES.UNKNOWN
}

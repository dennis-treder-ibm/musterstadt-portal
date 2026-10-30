import { isApiError, type ApiError } from './ApiError'

/** User-facing (German) messages; technical details stay in the log, never in the UI. */
const MESSAGES: Record<ApiError['kind'], string> = {
  network: 'Keine Verbindung zum Server. Bitte prüfen Sie Ihre Internetverbindung.',
  timeout: 'Der Server antwortet nicht rechtzeitig. Bitte versuchen Sie es erneut.',
  unauthorized: 'Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.',
  forbidden: 'Sie haben keine Berechtigung für diese Aktion.',
  not_found: 'Die angeforderten Daten wurden nicht gefunden.',
  validation: 'Bitte prüfen Sie Ihre Eingaben.',
  conflict: 'Die Aktion steht im Konflikt mit dem aktuellen Datenstand.',
  server: 'Es ist ein Serverfehler aufgetreten. Bitte versuchen Sie es später erneut.',
  canceled: 'Die Anfrage wurde abgebrochen.',
  unknown: 'Es ist ein unerwarteter Fehler aufgetreten.',
}

export const GENERIC_ERROR_MESSAGE = MESSAGES.unknown

/**
 * Returns a safe message for display. For validation errors the first
 * backend-provided field message is used, since these are written for end users.
 */
export function getUserMessage(error: unknown): string {
  if (!isApiError(error)) return GENERIC_ERROR_MESSAGE
  if (error.kind === 'validation' && error.fieldErrors[0]) return error.fieldErrors[0].message
  return MESSAGES[error.kind]
}

/** Maps backend field errors to `{ field: message }` for form libraries / TextField helperText. */
export function getFieldErrorMap(error: unknown): Record<string, string> {
  if (!isApiError(error)) return {}
  return Object.fromEntries(error.fieldErrors.map((e) => [e.field, e.message]))
}

import { describe, expect, it, vi } from 'vitest'
import { addLogSink, redact, setLogLevel, logger, type LogEntry } from './logger'
import { getUserMessage } from './errorMessages'
import { ApiError } from '@/services/http'

describe('logger', () => {
  it('redacts sensitive keys', () => {
    expect(redact({ password: 'x', Authorization: 'y', url: '/a' })).toEqual({
      password: '[REDACTED]',
      Authorization: '[REDACTED]',
      url: '/a',
    })
  })

  it('respects the log threshold and delivers entries to sinks', () => {
    const sink = vi.fn<(entry: LogEntry) => void>()
    const remove = addLogSink(sink)
    setLogLevel('warn')
    logger.info('hidden')
    logger.warn('shown', { token: 'secret' })
    remove()

    expect(sink).toHaveBeenCalledTimes(1)
    expect(sink.mock.calls[0]?.[0]).toMatchObject({ level: 'warn', message: 'shown', context: { token: '[REDACTED]' } })
  })
})

describe('getUserMessage', () => {
  it('shows backend messages for validation errors', () => {
    const error = new ApiError({ message: 'Postleitzahl ungültig', status: 400, code: 'VALIDATION_ERROR' })
    expect(getUserMessage(error)).toBe('Postleitzahl ungültig')
  })

  it('hides technical details for server errors', () => {
    const error = new ApiError({ message: 'NullPointerException at ...', status: 500, code: 'SERVER_ERROR' })
    expect(getUserMessage(error)).not.toContain('NullPointer')
  })

  it('uses a network message when no response was received', () => {
    const error = new ApiError({ message: 'Network Error', status: null, code: 'NETWORK_ERROR' })
    expect(getUserMessage(error)).toContain('Keine Verbindung')
  })

  it('falls back to a generic message for unknown values', () => {
    expect(getUserMessage('boom')).toBe('Ein unerwarteter Fehler ist aufgetreten.')
  })
})

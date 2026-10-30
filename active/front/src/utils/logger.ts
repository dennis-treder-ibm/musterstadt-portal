import { env } from '@/config/env'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  timestamp: string
}

export type LogSink = (entry: LogEntry) => void

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 }

const consoleSink: LogSink = ({ level, message, context }) => {
  const args = context ? [message, context] : [message]
  // eslint-disable-next-line no-console
  console[level](...args)
}

const sinks = new Set<LogSink>([consoleSink])
let minLevel: LogLevel = env.isDev ? 'debug' : 'warn'

/**
 * Minimal structured logger. Never pass secrets, tokens or personal data in
 * `context`. Register remote sinks (e.g. a backend log endpoint) via `addSink`.
 */
function log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[minLevel]) return
  const entry: LogEntry = { level, message, context, timestamp: new Date().toISOString() }
  sinks.forEach((sink) => sink(entry))
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => log('debug', message, context),
  info: (message: string, context?: Record<string, unknown>) => log('info', message, context),
  warn: (message: string, context?: Record<string, unknown>) => log('warn', message, context),
  error: (message: string, context?: Record<string, unknown>) => log('error', message, context),
  setLevel: (level: LogLevel) => {
    minLevel = level
  },
  addSink: (sink: LogSink) => {
    sinks.add(sink)
    return () => {
      sinks.delete(sink)
    }
  },
}

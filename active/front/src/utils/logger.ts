import { env } from '@/config/env'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'
export type LogThreshold = LogLevel | 'silent'

export interface LogEntry {
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  timestamp: string
}

export type LogSink = (entry: LogEntry) => void

const LEVEL_ORDER: Record<LogThreshold, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 100,
}

const SENSITIVE_KEY = /pass(word)?|token|secret|authorization/i

/** Masks values of sensitive keys so credentials never reach the logs. */
export function redact(context: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => [key, SENSITIVE_KEY.test(key) ? '[REDACTED]' : value]),
  )
}

const consoleSink: LogSink = ({ level, message, context }) => {
  const args: unknown[] = [`[${level.toUpperCase()}] ${message}`]
  if (context) args.push(context)
  console[level](...args)
}

let threshold: LogThreshold = env.isDev ? 'debug' : 'warn'
const sinks = new Set<LogSink>([consoleSink])

export function setLogLevel(level: LogThreshold): void {
  threshold = level
}

/** Registers an additional sink (e.g. remote error reporting). Returns an unsubscribe function. */
export function addLogSink(sink: LogSink): () => void {
  sinks.add(sink)
  return () => sinks.delete(sink)
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[threshold]) return
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context ? { context: redact(context) } : {}),
  }
  sinks.forEach((sink) => sink(entry))
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => log('debug', message, context),
  info: (message: string, context?: Record<string, unknown>) => log('info', message, context),
  warn: (message: string, context?: Record<string, unknown>) => log('warn', message, context),
  error: (message: string, context?: Record<string, unknown>) => log('error', message, context),
}

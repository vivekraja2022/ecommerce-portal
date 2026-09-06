// Structured logger used throughout the server. Safe to import unconditionally:
// - The OTel logs bridge (`@opentelemetry/api-logs`) is a documented no-op until
//   `instrumentation.js` registers a real LoggerProvider, so this has zero effect
//   when observability is off.
// - Pino always prints to stdout, pretty-printed in dev, JSON in production.
import pino from 'pino'
import { trace } from '@opentelemetry/api'
import { logs, SeverityNumber } from '@opentelemetry/api-logs'

const isDev = process.argv.includes('--dev')

const pinoLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: undefined,
  mixin() {
    const spanContext = trace.getActiveSpan()?.spanContext()
    return spanContext ? { trace_id: spanContext.traceId, span_id: spanContext.spanId } : {}
  },
  transport: isDev
    ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } }
    : undefined,
})

const otelLogger = logs.getLogger('shoply-api')

const SEVERITY = {
  debug: SeverityNumber.DEBUG,
  info: SeverityNumber.INFO,
  warn: SeverityNumber.WARN,
  error: SeverityNumber.ERROR,
}

function emit(level, msg, attributes) {
  pinoLogger[level](attributes, msg)
  otelLogger.emit({ severityNumber: SEVERITY[level], severityText: level, body: msg, attributes })
}

export const logger = {
  debug: (msg, attributes = {}) => emit('debug', msg, attributes),
  info: (msg, attributes = {}) => emit('info', msg, attributes),
  warn: (msg, attributes = {}) => emit('warn', msg, attributes),
  error: (msg, attributes = {}) => emit('error', msg, attributes),
}

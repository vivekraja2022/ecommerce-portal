// OpenTelemetry bootstrap, exporting to Grafana Cloud — OFF by default.
//
// This file is only loaded when the app is started with `--import ./server/otel/instrumentation.js`
// (see the `*:otel` npm scripts, which also load `.env.otel`). Normal `npm run dev` / `npm start` /
// tests never touch this file, so observability can never interfere with the app or the Playwright
// suite. See observability/README.md for how to get the two env vars this needs.
//
// It must be imported before any other module (express, pg, etc.) so the auto-instrumentations
// can patch them at require-time. Node's `--import` flag guarantees that ordering.

if (process.env.OTEL_ENABLED === 'false') {
  console.log('[otel] OTEL_ENABLED=false — observability disabled for this run')
} else if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT || !process.env.OTEL_EXPORTER_OTLP_HEADERS) {
  console.warn(
    '[otel] OTEL_EXPORTER_OTLP_ENDPOINT / OTEL_EXPORTER_OTLP_HEADERS are not set — skipping ' +
      'instrumentation. Copy .env.otel.example to .env.otel and fill in your Grafana Cloud ' +
      'OTLP endpoint + auth header (see observability/README.md).'
  )
} else {
  const { NodeSDK } = await import('@opentelemetry/sdk-node')
  const { resourceFromAttributes } = await import('@opentelemetry/resources')
  const { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } = await import('@opentelemetry/semantic-conventions')
  const { getNodeAutoInstrumentations } = await import('@opentelemetry/auto-instrumentations-node')
  const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-http')
  const { OTLPMetricExporter } = await import('@opentelemetry/exporter-metrics-otlp-http')
  const { OTLPLogExporter } = await import('@opentelemetry/exporter-logs-otlp-http')
  const { PeriodicExportingMetricReader } = await import('@opentelemetry/sdk-metrics')
  const { BatchLogRecordProcessor } = await import('@opentelemetry/sdk-logs')

  // No `url`/`headers` passed to any exporter below: they all resolve
  // OTEL_EXPORTER_OTLP_ENDPOINT (appending /v1/traces, /v1/metrics, /v1/logs) and
  // OTEL_EXPORTER_OTLP_HEADERS automatically — that's how the Basic Auth header for
  // Grafana Cloud gets attached to every export.
  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'shoply-api',
    [ATTR_SERVICE_VERSION]: process.env.npm_package_version || '0.0.0',
    'deployment.environment': process.env.NODE_ENV || 'development',
  })

  const sdk = new NodeSDK({
    resource,
    traceExporter: new OTLPTraceExporter(),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter(),
      exportIntervalMillis: 5000,
    }),
    logRecordProcessors: [new BatchLogRecordProcessor({ exporter: new OTLPLogExporter() })],
    instrumentations: [
      getNodeAutoInstrumentations({
        // Quiet the noisy fs instrumentation; we care about HTTP, Express and pg.
        '@opentelemetry/instrumentation-fs': { enabled: false },
      }),
    ],
  })

  sdk.start()
  console.log(`[otel] instrumentation started — exporting to ${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}`)

  for (const signal of ['SIGTERM', 'SIGINT']) {
    process.on(signal, () => {
      sdk
        .shutdown()
        .catch((err) => console.error('[otel] error shutting down', err))
        .finally(() => process.exit(0))
    })
  }
}

# Observability (OpenTelemetry -> Grafana Cloud)

Logs, metrics, and traces for the app, correlated by `trace_id`, shipped straight to
your Grafana Cloud stack. No local infrastructure to run — the app's OTel SDK exports
directly over OTLP/HTTP to Grafana Cloud's OTLP gateway. **Off by default** — nothing
here does anything unless you set up `.env.otel` and use the `*:otel` scripts.

## One-time setup

1. Sign in to [grafana.com](https://grafana.com) and open (or create) a Grafana Cloud
   stack — the free tier is enough for this.
2. In that stack, go to **Connections -> Add new connection**, search for
   **OpenTelemetry**, and open it. That page generates, and lets you copy directly:
   - an `OTEL_EXPORTER_OTLP_ENDPOINT` value (something like
     `https://otlp-gateway-prod-us-east-0.grafana.net/otlp`)
   - an `OTEL_EXPORTER_OTLP_HEADERS` value — a `Authorization=Basic%20<token>` string
     with your stack's instance ID and an API token already base64-encoded together.
     (If you'd rather generate the token yourself: **Administration -> API Keys** /
     **Access Policies**, create one scoped to `metrics:write`, `logs:write`,
     `traces:write`, then base64-encode `<instance ID>:<token>`.)
3. Copy `.env.otel.example` (project root) to `.env.otel` and paste in those two
   values exactly as Grafana Cloud gave them. `.env.otel` is gitignored — it holds a
   real credential, same as `.env` and `.env.test`.

## Running it

```
npm run dev:otel      # dev server, instrumented — use instead of `npm run dev`
npm run start:otel    # production server, instrumented
```

Use the app for a bit (browse products, sign up, place an order, trigger a stock or
validation error at checkout), then open your Grafana Cloud instance and explore —
**Explore -> Tempo** for traces, **Explore -> Loki** for logs, **Explore -> Prometheus**
(actually Mimir) for metrics. Data typically shows up within a few seconds.

Plain `npm run dev` / `npm start` / `npm run test:e2e` are untouched — they never load
`server/otel/instrumentation.js` and have no dependency on any of this.

## How it's wired

- **Traces**: `@opentelemetry/auto-instrumentations-node` instruments Express and
  `pg` automatically, so every HTTP request and every database query becomes a span
  in the same trace — no manual span code in the routes.
- **Metrics**: the same auto-instrumentation gives request-rate/latency metrics for
  free. On top of that, `server/otel/metrics.js` defines the counters that actually
  matter for this app: `shoply.orders.placed`, `shoply.orders.revenue`, and
  `shoply.checkout.failed{reason}`. (The app's checkout is mocked and takes no real
  payment — `checkout.failed` is the realistic stand-in for "payment failed" here:
  it fires on out-of-stock, validation, and server errors at the point of purchase.)
- **Logs**: `server/otel/logger.js` wraps `pino` — pretty-printed in your terminal as
  always, and also emitted as OTel log records. Every log line written inside a
  request automatically carries that request's `trace_id`/`span_id`, which is how
  Grafana can jump straight from a trace to its logs and back (Tempo's "Logs for this
  span" and Loki's derived-field link both key off it).
- All three signals go out via plain OTLP/HTTP using the *standard* OpenTelemetry env
  vars (`OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_EXPORTER_OTLP_HEADERS`) — the exporters in
  `server/otel/instrumentation.js` don't hardcode a URL or auth header, they just read
  those two env vars, which is exactly what lets you point this at Grafana Cloud (or
  any other OTLP-compatible backend) purely through `.env.otel`.

## Why it can't affect the app or the tests

`server/otel/instrumentation.js` is only loaded via `--import` in the `*:otel` npm
scripts (see the Node `--import` flag in `dev:otel`/`start:otel`). Every other script,
including `npm run dev`, `npm start`, and the whole Playwright suite, never imports
that file, so there's zero code path by which observability being on or off changes
app behavior. `server/otel/logger.js` and `server/otel/metrics.js` *are* imported
unconditionally by the app code (that's what lets routes just call `logger.info(...)`
without an `if (otelEnabled)` check everywhere) — but `@opentelemetry/api` /
`@opentelemetry/api-logs` are documented to be safe, inert no-ops until a real SDK is
registered, so those calls do nothing when `.env.otel` isn't set up.

## Troubleshooting

- Nothing shows up in Grafana Cloud: `dev:otel`/`start:otel` print a startup line —
  either `[otel] instrumentation started — exporting to <endpoint>` or a warning that
  `.env.otel` is missing/incomplete. If it says "started", double-check the endpoint
  and header were pasted verbatim from the Grafana Cloud OpenTelemetry connection page
  (a stray space or missing `%20` in the header is the usual culprit).
- 401/403 from the OTLP gateway: the API token was revoked or scoped wrong — regenerate
  it with `metrics:write`, `logs:write`, `traces:write`.

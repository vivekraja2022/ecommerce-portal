# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Shoply — a small full-stack eCommerce demo: browse products, add to cart, sign in, check out.

- **Frontend**: React 19 + Vite, React Router
- **Backend**: Express 5 — a single Node process serves both the REST API (`/api/*`) and the built frontend, so there's only one thing to run and one thing to deploy
- **Database**: Neon (serverless Postgres)
- **Auth**: [Better Auth](https://www.better-auth.com/) — email/password with cookie sessions

## Commands

Setup (first time in a fresh checkout):
```
npm install
cp .env.example .env   # fill in DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL
npm run db:migrate      # applies server/db/schema.sql
npm run db:seed         # loads mock product data
```

Day to day:
```
npm run dev              # Express + Vite middleware mode with HMR, http://localhost:3000
npm run build             # builds frontend to dist/
npm start                 # production server (serves dist/ + API; run build first)
npm run lint              # oxlint
```

E2E tests (Playwright, real Chromium, always headed — see `tests/e2e/README.md`):
```
npm run test:e2e          # resets/reseeds the test DB, then runs the full suite
npm run test:e2e:ui       # same, in Playwright's interactive UI mode
npm run test:e2e:report   # open the HTML report from the last run
```
Run a single spec/test the normal Playwright way once the test DB is set up, e.g.
`npm run test:e2e:setup && npx playwright test tests/e2e/specs/checkout.spec.js`.
The suite runs against `.env.test` (a separate Neon DB, port 3100) — never the dev DB.

**CI** (`.github/workflows/ci.yml`): on every push/PR to `main`, a `lint-and-build` job
runs oxlint + `vite build`, then an `e2e` job runs the full Playwright suite headed
under Xvfb, reading `DATABASE_URL`/`BETTER_AUTH_SECRET` from the `E2E_DATABASE_URL`/
`E2E_BETTER_AUTH_SECRET` repo secrets instead of `.env.test` (which is gitignored and
not present in CI). The e2e job has its own `concurrency` group so two runs never
truncate/reseed the shared test database at the same time. There is no security or
performance suite in CI yet — see README for the plan to add them non-blocking/
on-demand when they exist.

Observability (OpenTelemetry -> Grafana Cloud; **off by default**, see `observability/README.md`):
```
cp .env.otel.example .env.otel   # fill in OTEL_EXPORTER_OTLP_ENDPOINT/HEADERS from Grafana Cloud
npm run dev:otel                  # dev server, instrumented (use instead of `npm run dev`)
npm run start:otel                # production server, instrumented
```

## Architecture

**Single-process deployment model.** `server/index.js` is the only entry point. In dev
(`--dev` flag) it creates a Vite server in middleware mode and mounts it on the same
Express app; in production it serves the built `dist/` and falls back to `index.html`
for client-side routing. There's no separate frontend dev server and no CORS to
configure — plan changes with this in mind.

**Middleware ordering in `server/index.js` matters and is deliberate**: the Better Auth
handler (`app.all('/api/auth/*splat', toNodeHandler(auth))`) is mounted *before*
`express.json()` because Better Auth needs the raw request body. Anything added before
that line runs for every request including auth; the request-logging middleware is
scoped to `/api` only to avoid logging every Vite asset request in dev.

**API routes** live in `server/routes/` (`products.js`, `orders.js`), mounted under
`/api` via `server/routes/index.js`. `orders.js` is the one route with real business
logic: `POST /api/orders` runs inside a transaction that `SELECT ... FOR UPDATE`s the
ordered products, validates stock/qty, inserts the order + order_items, decrements
stock, and commits — read it before touching checkout behavior. `requireAuth`
(`server/middleware/requireAuth.js`) gates orders routes via Better Auth's session
lookup and attaches `req.user`.

**Database**: `server/db/pool.js` exports a single `pg` `Pool` used everywhere (no ORM).
`server/db/schema.sql` is the one migration file — it contains both Better Auth's own
tables (`user`, `session`, `account`, `verification`, generated via
`npx @better-auth/cli generate` and kept here for a single migration path) and the
app's own tables (`products`, `orders`, `order_items`). `npm run db:migrate` just
applies this file; there's no migration framework/history to reconcile. `server/db/seed.js`
+ `seedData.js` load the mock product catalog.

**Frontend state** is two React contexts, not a global store:
- `ProductsContext` (`src/context/ProductsContext.jsx`) fetches `/api/products` once
  and exposes `products`/`categories`/`getProductById`.
- `CartContext` (`src/context/CartContext.jsx`) persists cart line items (productId +
  qty) to `localStorage` via `useLocalStorage`, and joins them against
  `ProductsContext` to compute `subtotal`/`totalCount` — the cart itself never stores
  product data, only ids and quantities.

`src/api/client.js` is a thin `fetch` wrapper (all calls go to `/api/...`); auth is
handled separately through Better Auth's own client (`src/lib/authClient.js`,
`createAuthClient` + `useSession`/`signIn`/`signUp`/`signOut`), not through
`api/client.js`. Protected routes (`/checkout`, `/orders`) are wrapped in
`<RequireAuth>` in `src/App.jsx`.

**Checkout is intentionally mocked** — no real payment is taken (see the note in
`Checkout.jsx`); "placing an order" is the full checkout flow.

## Repo-specific notes

- `training/black-friday-incident/` is a self-contained subagent training exercise
  (log analysis / root-cause finding) — it doesn't touch the real app; see its own
  README before treating it as part of the product codebase.
- `observability/` (`server/otel/` + `.env.otel`) is fully optional OpenTelemetry
  instrumentation exporting to Grafana Cloud, gated behind the `*:otel` npm scripts via
  Node's `--import` flag. Plain `dev`/`start`/`test:e2e` never load it. Route/middleware
  code (`server/otel/logger.js`, `server/otel/metrics.js`) is imported and called
  unconditionally regardless of that flag — both wrap `@opentelemetry/api`, which
  provides documented no-op implementations until `instrumentation.js` registers real
  providers, so those calls are inert (not errors) when observability is off.
- **Auth session refetch race**: after `signIn.email(...)` resolves, Better Auth's
  `useSession` hasn't updated yet — it only kicks off a background refresh. Code that
  navigates to a protected route right after sign-in must `await refetchSession()`
  first (see `src/pages/Login.jsx`), or `RequireAuth` reads the still-stale
  unauthenticated session and bounces back to `/login`.

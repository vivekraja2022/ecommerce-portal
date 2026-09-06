# E2E UI regression suite (Playwright)

Real browser tests against the actual app (Express + Vite dev middleware + Postgres),
driven through the UI exactly as a user would use it. Run this before merging any
change that touches routing, cart, checkout, auth, or product browsing.

## Running it

```
npm run test:e2e
```

This always launches Chromium **headed** (a visible browser window) — that's a fixed
policy for this suite, not a flag you can turn off. It also always runs against the
dedicated test database configured in `.env.test`, never your dev/prod database.

Other commands:
- `npm run test:e2e:ui` — same suite in Playwright's interactive UI mode
- `npm run test:e2e:report` — open the HTML report from the last run
- `npm run test:e2e:setup` — just reset + reseed the test DB, without running tests

## How it stays isolated from your dev server

- Runs on `PORT=3100` (dev server stays on 3000) and a separate Vite HMR port
  (`VITE_HMR_PORT=24679`) — see `.env.test`. Both can run at the same time.
- Every run truncates and reseeds the test database (`tests/e2e/reset-db.js`) before
  the suite starts, so results never depend on leftover state from a previous run.
- `.env.test` holds a real Postgres connection string and is gitignored — set your
  own before running this suite in a fresh checkout (see the skill that generated
  this suite for how to provision one).

## Structure

- `pages/` — Page Object Model classes, one per screen/component (`HomePage`,
  `CartPage`, `CheckoutPage`, ...). Specs should not contain raw CSS selectors;
  add them to a page object instead.
- `fixtures/test-data.js` — the one fixed test user and the product references
  specs use, kept in sync with `server/db/seedData.js`.
- `global-setup.js` — registers one real account through the UI once per run and
  saves its session (`.auth/user.json`) so specs that need to already be logged in
  (checkout, orders) don't repeat the login flow every test.
- `specs/` — the actual regression tests, grouped by feature area.

## Known bugs this suite has caught

None currently — the last one found (signing in from a login-redirect bounced back
to `/login` instead of continuing to the protected page, a session-hydration race
in `Login.jsx`) was fixed on 2026-08-29.

# Shoply

A small full-stack eCommerce demo: browse products, add to cart, sign in, and check out.

## Stack

- **Frontend**: React 19 + Vite, React Router
- **Backend**: Express 5 — a single Node process serves both the REST API (`/api/*`) and the built frontend, so there's only one thing to run and one thing to deploy
- **Database**: Neon (serverless Postgres)
- **Auth**: [Better Auth](https://www.better-auth.com/) — email/password with cookie sessions

## Project layout

```
server/         Express app, API routes, DB pool, auth config, migrations/seed
src/            React app (pages, components, contexts, API client)
```

## Local setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` — your Neon connection string
   - `BETTER_AUTH_SECRET` — random string, e.g. `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - `BETTER_AUTH_URL` — `http://localhost:3000` for local dev
3. `npm run db:migrate` — creates tables (products, orders, order_items, plus Better Auth's user/session/account/verification tables)
4. `npm run db:seed` — loads mock product data
5. `npm run dev` — starts the app at http://localhost:3000 (Express + Vite middleware mode, with HMR)

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server (Express + Vite HMR), one process |
| `npm run build` | Builds the frontend to `dist/` |
| `npm start` | Production server — serves `dist/` + the API (run `build` first) |
| `npm run db:migrate` | Applies `server/db/schema.sql` |
| `npm run db:seed` | Loads mock product data |

## Deploying

This app is one deployable unit: build the frontend, then run the same Express server to serve both the UI and the API.

- **Build command**: `npm install && npm run build`
- **Start command**: `npm start`
- **Environment variables**: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (set to your live URL, e.g. `https://your-app.onrender.com`)

No CORS setup is needed since the frontend and API are served from the same origin.

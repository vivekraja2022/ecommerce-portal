// Wipes all rows from the test database so every `npm run test:e2e` starts from
// an identical, empty-of-user-data state. Run after migrate (tables must exist)
// and before seed (products get reloaded fresh). Never point this at a real
// DATABASE_URL — it is destructive by design.
import pg from 'pg'

const { Client } = pg

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. This script must run with .env.test loaded.')
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

await client.connect()
await client.query(
  'TRUNCATE TABLE "user", "session", "account", "verification", products, orders, order_items RESTART IDENTITY CASCADE'
)
await client.end()
console.log('Test database reset.')

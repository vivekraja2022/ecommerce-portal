import { betterAuth } from 'better-auth'
import { pool } from './db/pool.js'

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || 3000}`,
  emailAndPassword: {
    enabled: true,
  },
})

import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { toNodeHandler } from 'better-auth/node'
import { auth } from './auth.js'
import apiRouter from './routes/index.js'
import { logger } from './otel/logger.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const distDir = path.join(rootDir, 'dist')
const isDev = process.argv.includes('--dev')
const port = process.env.PORT || 3000

const app = express()

app.use((req, res, next) => {
  const { method, path } = req
  if (!path.startsWith('/api')) return next()
  const startedAt = process.hrtime.bigint()
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6
    logger.info('http_request', {
      method,
      path,
      status: res.statusCode,
      duration_ms: Math.round(durationMs),
    })
  })
  next()
})

// Better Auth needs the raw request body, so it must be mounted before express.json().
app.all('/api/auth/*splat', toNodeHandler(auth))

app.use(express.json())
app.use('/api', apiRouter)

if (isDev) {
  // Development: run Vite in middleware mode inside this same process,
  // so one command serves the API and the frontend with HMR.
  const { createServer: createViteServer } = await import('vite')
  const vite = await createViteServer({
    root: rootDir,
    server: { middlewareMode: true },
    appType: 'spa',
  })
  app.use(vite.middlewares)
} else {
  // Production: serve the pre-built frontend from dist/.
  if (!fs.existsSync(path.join(distDir, 'index.html'))) {
    console.error('No production build found. Run `npm run build` first.')
    process.exit(1)
  }
  app.use(express.static(distDir))
  app.use((req, res) => {
    res.sendFile(path.join(distDir, 'index.html'))
  })
}

app.use((err, req, res, next) => {
  logger.error(err.message, { status: err.status || 500, path: req.path, stack: err.stack })
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

app.listen(port, () => {
  const label = isDev ? 'dev mode' : 'production build'
  logger.info(`Server listening on port ${port} (${label})`)
})

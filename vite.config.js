import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // In middleware mode (server/index.js --dev) Vite's HMR websocket doesn't share
    // the Express port and falls back to a fixed default (24678), which collides if
    // more than one dev instance runs at once (e.g. the main dev server and the
    // Playwright test server). Let it be overridden per-instance.
    hmr: process.env.VITE_HMR_PORT ? { port: Number(process.env.VITE_HMR_PORT) } : undefined,
  },
})

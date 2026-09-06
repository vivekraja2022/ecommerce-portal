import { chromium } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { TEST_USER } from './fixtures/test-data.js'
import { registerViaUi } from './utils/auth-actions.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const AUTH_STATE_PATH = path.join(__dirname, '.auth', 'user.json')

// Runs once before the suite: creates one real account through the actual
// registration UI (not a DB insert or API shortcut) and saves its session so
// specs that need "already logged in" don't have to repeat that flow.
export default async function globalSetup(config) {
  const baseURL = config.projects[0].use.baseURL
  const browser = await chromium.launch()
  const context = await browser.newContext({ baseURL })
  const page = await context.newPage()

  await registerViaUi(page, TEST_USER)

  await context.storageState({ path: AUTH_STATE_PATH })
  await browser.close()
}

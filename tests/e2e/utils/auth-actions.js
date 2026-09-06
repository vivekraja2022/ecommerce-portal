import { LoginPage, RegisterPage } from '../pages/AuthPages.js'

export async function registerViaUi(page, { name, email, password }) {
  const registerPage = new RegisterPage(page)
  await registerPage.goto()
  await registerPage.register({ name, email, password })
  await page.waitForURL('/')
}

export async function loginViaUi(page, { email, password }) {
  const loginPage = new LoginPage(page)
  await loginPage.goto()
  await loginPage.login(email, password)
}

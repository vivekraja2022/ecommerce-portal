import { test, expect } from '@playwright/test'
import { LoginPage, RegisterPage } from '../pages/AuthPages.js'
import { OrdersPage } from '../pages/OrdersPage.js'
import { HeaderComponent } from '../pages/HeaderComponent.js'
import { TEST_USER, uniqueEmail } from '../fixtures/test-data.js'

// This file intentionally starts every test signed out (no storageState override)
// so it can exercise the register/login/redirect flows themselves.

test.describe('Registration', () => {
  test('creating an account signs the user in and shows their name in the header', async ({ page }) => {
    const register = new RegisterPage(page)
    await register.goto()
    await register.register({ name: 'New Shopper', email: uniqueEmail('register'), password: 'BrandNewPass1!' })

    await expect(page).toHaveURL('/')
    const header = new HeaderComponent(page)
    await expect(header.userLabel).toHaveText('New Shopper')
  })

  test('registering with an email that already exists shows an error and does not sign in', async ({ page }) => {
    const register = new RegisterPage(page)
    await register.goto()
    await register.register({ name: 'Duplicate User', email: TEST_USER.email, password: 'AnotherPass1!' })

    await expect(register.error).toBeVisible()
    await expect(page).toHaveURL('/register')
  })
})

test.describe('Login', () => {
  test('signing in with the wrong password shows an error and stays on the login page', async ({ page }) => {
    const login = new LoginPage(page)
    await login.goto()
    await login.login(TEST_USER.email, 'not-the-right-password')

    await expect(login.error).toBeVisible()
    await expect(page).toHaveURL('/login')
  })

  test('signing in with valid credentials logs in and sign-out returns to signed-out state', async ({ page }) => {
    const login = new LoginPage(page)
    await login.goto()
    await login.login(TEST_USER.email, TEST_USER.password)

    await expect(page).toHaveURL('/')
    const header = new HeaderComponent(page)
    await expect(header.userLabel).toHaveText(TEST_USER.name)

    await header.signOut()
    await expect(header.signInLink).toBeVisible()
  })
})

test.describe('Protected routes', () => {
  test('visiting /orders while signed out redirects to login, then back to /orders after signing in', async ({ page }) => {
    const orders = new OrdersPage(page)
    await orders.goto()

    await expect(page).toHaveURL('/login')

    const login = new LoginPage(page)
    await login.login(TEST_USER.email, TEST_USER.password)

    await expect(page).toHaveURL('/orders')
  })
})

export class LoginPage {
  constructor(page) {
    this.page = page
    this.emailInput = page.locator('input[type="email"]')
    this.passwordInput = page.locator('input[type="password"]')
    this.submitButton = page.getByRole('button', { name: /sign in/i })
    this.error = page.locator('.field-error')
  }

  async goto() {
    await this.page.goto('/login')
  }

  async login(email, password) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }
}

export class RegisterPage {
  constructor(page) {
    this.page = page
    this.nameInput = page.locator('input:not([type])')
    this.emailInput = page.locator('input[type="email"]')
    this.passwordInput = page.locator('input[type="password"]')
    this.submitButton = page.getByRole('button', { name: /create account/i })
    this.error = page.locator('.field-error')
  }

  async goto() {
    await this.page.goto('/register')
  }

  async register({ name, email, password }) {
    await this.nameInput.fill(name)
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }
}

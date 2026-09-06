export class CheckoutPage {
  constructor(page) {
    this.page = page
    this.nameInput = page.locator('input[name="name"]')
    this.emailInput = page.locator('input[name="email"]')
    this.addressInput = page.locator('input[name="address"]')
    this.cityInput = page.locator('input[name="city"]')
    this.zipInput = page.locator('input[name="zip"]')
    this.placeOrderButton = page.getByRole('button', { name: /place order/i })
    this.fieldErrors = page.locator('.field-error')
    this.confirmationHeading = page.locator('.order-confirmation h1')
    this.orderId = page.locator('.order-id')
    this.orderTotal = page.locator('.order-total')
    this.mockNote = page.locator('.mock-note')
  }

  async goto() {
    await this.page.goto('/checkout')
  }

  async fillShipping({ name, email, address, city, zip }) {
    if (name !== undefined) await this.nameInput.fill(name)
    if (email !== undefined) await this.emailInput.fill(email)
    if (address !== undefined) await this.addressInput.fill(address)
    if (city !== undefined) await this.cityInput.fill(city)
    if (zip !== undefined) await this.zipInput.fill(zip)
  }

  async submit() {
    await this.placeOrderButton.click()
  }

  async fieldErrorTexts() {
    return this.fieldErrors.allInnerTexts()
  }
}

export class CartPage {
  constructor(page) {
    this.page = page
    this.items = page.locator('.cart-item')
    this.emptyState = page.locator('.empty-state')
    this.subtotal = page.locator('.cart-summary__row--total span').nth(1)
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' })
    this.clearCartButton = page.getByRole('button', { name: 'Clear cart' })
  }

  async goto() {
    await this.page.goto('/cart')
  }

  item(productName) {
    return this.items.filter({ has: this.page.getByText(productName, { exact: true }) })
  }

  async increaseQty(productName) {
    await this.item(productName).getByRole('button', { name: 'Increase quantity' }).click()
  }

  async decreaseQty(productName) {
    await this.item(productName).getByRole('button', { name: 'Decrease quantity' }).click()
  }

  async lineTotal(productName) {
    return this.item(productName).locator('.cart-item__line-total').innerText()
  }

  async remove(productName) {
    await this.item(productName).getByRole('button', { name: /remove/i }).click()
  }
}

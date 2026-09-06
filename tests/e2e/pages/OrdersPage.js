export class OrdersPage {
  constructor(page) {
    this.page = page
    this.emptyState = page.locator('.empty-state')
    this.orderItems = page.locator('.order-list__item')
  }

  async goto() {
    await this.page.goto('/orders')
    await this.page.waitForLoadState('networkidle')
  }

  orderById(orderId) {
    return this.orderItems.filter({ has: this.page.getByText(orderId, { exact: true }) })
  }
}

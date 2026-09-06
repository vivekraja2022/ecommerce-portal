export class HomePage {
  constructor(page) {
    this.page = page
    this.searchInput = page.getByLabel('Search products')
    this.categorySelect = page.getByLabel('Filter by category')
    this.sortSelect = page.getByLabel('Sort products')
    this.productCards = page.locator('.product-card')
    this.emptyState = page.locator('.empty-state')
  }

  async goto() {
    await this.page.goto('/')
    await this.page.waitForLoadState('networkidle')
  }

  card(productName) {
    return this.productCards.filter({ has: this.page.getByText(productName, { exact: true }) })
  }

  async addToCartByName(productName) {
    await this.card(productName).getByRole('button', { name: /add to cart/i }).click()
  }

  async openProduct(productName) {
    await this.card(productName).locator('.product-card__name').click()
  }

  async search(query) {
    await this.searchInput.fill(query)
  }

  async filterByCategory(category) {
    await this.categorySelect.selectOption(category)
  }

  async sortBy(label) {
    await this.sortSelect.selectOption({ label })
  }

  async productNames() {
    return this.productCards.locator('.product-card__name').allInnerTexts()
  }

  async productPrices() {
    const texts = await this.productCards.locator('.price').allInnerTexts()
    return texts.map((t) => Number(t.replace('$', '')))
  }
}

export class ProductDetailPage {
  constructor(page) {
    this.page = page
    this.heading = page.locator('.product-detail__info h1')
    this.price = page.locator('.price--large')
    this.stockNote = page.locator('.stock-note')
    this.addToCartButton = page.getByRole('button', { name: 'Add to cart' })
    this.buyNowButton = page.getByRole('button', { name: 'Buy now' })
    this.justAddedNote = page.locator('.confirm-note')
    this.increaseQtyButton = page.getByRole('button', { name: 'Increase quantity' })
    this.decreaseQtyButton = page.getByRole('button', { name: 'Decrease quantity' })
    this.qtyValue = page.locator('.qty-value')
    this.outOfStockBadge = page.locator('.badge--out')
    this.notFound = page.getByText('Product not found.')
  }

  async goto(productId) {
    await this.page.goto(`/product/${productId}`)
    await this.page.waitForLoadState('networkidle')
  }
}

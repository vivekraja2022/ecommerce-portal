import { test, expect } from '@playwright/test'
import { HomePage } from '../pages/HomePage.js'
import { ProductDetailPage } from '../pages/ProductDetailPage.js'
import { HeaderComponent } from '../pages/HeaderComponent.js'
import { PRODUCTS, TEST_USER } from '../fixtures/test-data.js'

test.describe('Product detail', () => {
  test('navigating from the catalog shows full product details', async ({ page }) => {
    const home = new HomePage(page)
    await home.goto()
    await home.openProduct(PRODUCTS.inStock.name)

    const detail = new ProductDetailPage(page)
    await expect(detail.heading).toHaveText(PRODUCTS.inStock.name)
    await expect(detail.price).toHaveText(`$${PRODUCTS.inStock.price.toFixed(2)}`)
  })

  test('adding to cart shows confirmation and updates the header badge', async ({ page }) => {
    const detail = new ProductDetailPage(page)
    await detail.goto(PRODUCTS.inStock.id)

    await detail.addToCartButton.click()

    await expect(detail.justAddedNote).toBeVisible()
    const header = new HeaderComponent(page)
    await expect(header.cartBadge).toHaveText('1')
  })

  test('quantity stepper is capped at available stock', async ({ page }) => {
    const detail = new ProductDetailPage(page)
    await detail.goto(PRODUCTS.lowStock.id)

    await expect(detail.stockNote).toHaveText(`Only ${PRODUCTS.lowStock.stock} left in stock`)

    for (let i = 1; i < PRODUCTS.lowStock.stock; i++) {
      await detail.increaseQtyButton.click()
    }
    await expect(detail.qtyValue).toHaveText(String(PRODUCTS.lowStock.stock))
    await expect(detail.increaseQtyButton).toBeDisabled()
  })

  test('out-of-stock product cannot be purchased', async ({ page }) => {
    const detail = new ProductDetailPage(page)
    await detail.goto(PRODUCTS.outOfStock.id)

    await expect(detail.outOfStockBadge).toBeVisible()
    await expect(detail.stockNote).toHaveText('Currently out of stock')
    await expect(detail.addToCartButton).toHaveCount(0)
    await expect(detail.buyNowButton).toHaveCount(0)
  })

  test('unknown product id shows a not-found state', async ({ page }) => {
    const detail = new ProductDetailPage(page)
    await detail.goto('does-not-exist')

    await expect(detail.notFound).toBeVisible()
  })

  test('buy now while signed out redirects through login and back to checkout', async ({ page }) => {
    const detail = new ProductDetailPage(page)
    await detail.goto(PRODUCTS.inStock.id)
    await detail.buyNowButton.click()

    await expect(page).toHaveURL('/login')

    await page.locator('input[type="email"]').fill(TEST_USER.email)
    await page.locator('input[type="password"]').fill(TEST_USER.password)
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page).toHaveURL('/checkout')
  })
})

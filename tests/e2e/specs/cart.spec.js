import { test, expect } from '@playwright/test'
import { ProductDetailPage } from '../pages/ProductDetailPage.js'
import { CartPage } from '../pages/CartPage.js'
import { HeaderComponent } from '../pages/HeaderComponent.js'
import { PRODUCTS } from '../fixtures/test-data.js'

// Cart state lives in localStorage (see src/context/CartContext.jsx), so these
// tests never touch the server or its stock counts.

test.describe('Cart', () => {
  test('empty cart shows the empty state with a link back to shopping', async ({ page }) => {
    const cart = new CartPage(page)
    await cart.goto()

    await expect(cart.emptyState).toHaveText('Your cart is empty.')
    await expect(page.getByRole('link', { name: 'Start shopping' })).toBeVisible()
  })

  test('items added from product pages appear in the cart with correct totals', async ({ page }) => {
    const detail = new ProductDetailPage(page)
    await detail.goto(PRODUCTS.inStock.id)
    await detail.addToCartButton.click()

    await detail.goto(PRODUCTS.secondary.id)
    await detail.addToCartButton.click()

    const cart = new CartPage(page)
    await cart.goto()

    await expect(cart.items).toHaveCount(2)
    await expect(cart.item(PRODUCTS.inStock.name)).toBeVisible()
    await expect(cart.item(PRODUCTS.secondary.name)).toBeVisible()
  })

  test('changing quantity updates the line total and subtotal', async ({ page }) => {
    const detail = new ProductDetailPage(page)
    await detail.goto(PRODUCTS.inStock.id)
    await detail.addToCartButton.click()

    const cart = new CartPage(page)
    await cart.goto()
    await cart.increaseQty(PRODUCTS.inStock.name)

    const expectedLine = (PRODUCTS.inStock.price * 2).toFixed(2)
    await expect(cart.item(PRODUCTS.inStock.name).locator('.cart-item__line-total')).toHaveText(`$${expectedLine}`)
    await expect(cart.subtotal).toHaveText(`$${expectedLine}`)
  })

  test('removing an item drops it from the cart and updates the header badge', async ({ page }) => {
    const detail = new ProductDetailPage(page)
    await detail.goto(PRODUCTS.inStock.id)
    await detail.addToCartButton.click()

    const cart = new CartPage(page)
    await cart.goto()
    await cart.remove(PRODUCTS.inStock.name)

    await expect(cart.emptyState).toBeVisible()
    const header = new HeaderComponent(page)
    expect(await header.cartCount()).toBe(0)
  })

  test('clear cart empties all items at once', async ({ page }) => {
    const detail = new ProductDetailPage(page)
    await detail.goto(PRODUCTS.inStock.id)
    await detail.addToCartButton.click()
    await detail.goto(PRODUCTS.secondary.id)
    await detail.addToCartButton.click()

    const cart = new CartPage(page)
    await cart.goto()
    await cart.clearCartButton.click()

    await expect(cart.emptyState).toBeVisible()
  })
})

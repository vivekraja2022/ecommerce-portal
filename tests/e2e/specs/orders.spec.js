import { test, expect } from '@playwright/test'
import { ProductDetailPage } from '../pages/ProductDetailPage.js'
import { CheckoutPage } from '../pages/CheckoutPage.js'
import { OrdersPage } from '../pages/OrdersPage.js'
import { PRODUCTS, uniqueEmail } from '../fixtures/test-data.js'
import { AUTH_STATE_PATH } from '../global-setup.js'
import { registerViaUi } from '../utils/auth-actions.js'

test.describe('Order history for an existing account', () => {
  test.use({ storageState: AUTH_STATE_PATH })

  test('a placed order shows up in order history with matching items and total', async ({ page }) => {
    const detail = new ProductDetailPage(page)
    await detail.goto(PRODUCTS.forOrderHistory.id)
    await detail.buyNowButton.click()

    const checkout = new CheckoutPage(page)
    await checkout.fillShipping({
      name: 'Sam Lee',
      email: 'sam.lee@example.test',
      address: '456 Elm St',
      city: 'Riverside',
      zip: '92501',
    })
    await checkout.submit()
    const orderId = (await checkout.orderId.innerText()).replace('Order #', '')

    const orders = new OrdersPage(page)
    await orders.goto()

    const row = orders.orderById(orderId)
    await expect(row).toBeVisible()
    await expect(row).toContainText(PRODUCTS.forOrderHistory.name)
    await expect(row).toContainText(`$${PRODUCTS.forOrderHistory.price.toFixed(2)}`)
  })
})

test.describe('Order history for a brand-new account', () => {
  test('shows the empty state when no orders have been placed', async ({ page }) => {
    await registerViaUi(page, { name: 'Fresh Shopper', email: uniqueEmail('fresh'), password: 'FreshPass123!' })

    const orders = new OrdersPage(page)
    await orders.goto()

    await expect(orders.emptyState).toHaveText("You haven't placed any orders yet.")
    await expect(page.getByRole('link', { name: 'Start shopping' })).toBeVisible()
  })
})

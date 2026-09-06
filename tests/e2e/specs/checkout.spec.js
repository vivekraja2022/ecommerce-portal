import { test, expect } from '@playwright/test'
import { ProductDetailPage } from '../pages/ProductDetailPage.js'
import { CheckoutPage } from '../pages/CheckoutPage.js'
import { HeaderComponent } from '../pages/HeaderComponent.js'
import { PRODUCTS } from '../fixtures/test-data.js'
import { AUTH_STATE_PATH } from '../global-setup.js'

test.use({ storageState: AUTH_STATE_PATH })

test.describe('Checkout', () => {
  test('rejects submission when required shipping fields are missing', async ({ page }) => {
    const detail = new ProductDetailPage(page)
    await detail.goto(PRODUCTS.ample.id)
    await detail.buyNowButton.click()

    const checkout = new CheckoutPage(page)
    await expect(page).toHaveURL('/checkout')
    // Explicitly clear every field so the test doesn't depend on session prefill timing.
    await checkout.fillShipping({ name: '', email: '', address: '', city: '', zip: '' })
    await checkout.submit()

    const errors = await checkout.fieldErrorTexts()
    expect(errors).toEqual(
      expect.arrayContaining([
        'Name is required',
        'Valid email is required',
        'Address is required',
        'City is required',
        'Valid postal code is required',
      ])
    )
    await expect(page).toHaveURL('/checkout')
  })

  test('rejects an invalid email and invalid postal code with specific messages', async ({ page }) => {
    const detail = new ProductDetailPage(page)
    await detail.goto(PRODUCTS.ample.id)
    await detail.buyNowButton.click()

    const checkout = new CheckoutPage(page)
    await checkout.fillShipping({
      name: 'Jamie Rivera',
      email: 'not-an-email',
      address: '123 Market St',
      city: 'Springfield',
      zip: 'abcde',
    })
    await checkout.submit()

    const errors = await checkout.fieldErrorTexts()
    expect(errors).toEqual(
      expect.arrayContaining(['Valid email is required', 'Valid postal code is required'])
    )
  })

  test('a fully valid checkout places the order, shows confirmation, and clears the cart', async ({ page }) => {
    const detail = new ProductDetailPage(page)
    await detail.goto(PRODUCTS.ample.id)
    await detail.buyNowButton.click()

    const checkout = new CheckoutPage(page)
    await checkout.fillShipping({
      name: 'Jamie Rivera',
      email: 'jamie.rivera@example.test',
      address: '123 Market St',
      city: 'Springfield',
      zip: '94105',
    })
    await expect(checkout.mockNote).toBeVisible()
    await checkout.submit()

    await expect(checkout.confirmationHeading).toHaveText('Thanks, Jamie!')
    await expect(checkout.orderId).toContainText('Order #')
    await expect(checkout.orderTotal).toHaveText(`Total paid: $${PRODUCTS.ample.price.toFixed(2)}`)

    await page.goto('/')
    const header = new HeaderComponent(page)
    expect(await header.cartCount()).toBe(0)
  })
})

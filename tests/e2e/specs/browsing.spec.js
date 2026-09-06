import { test, expect } from '@playwright/test'
import { HomePage } from '../pages/HomePage.js'
import { PRODUCTS } from '../fixtures/test-data.js'

test.describe('Browsing the catalog', () => {
  test('shows the seeded product catalog on load', async ({ page }) => {
    const home = new HomePage(page)
    await home.goto()

    await expect(home.productCards).toHaveCount(12)
    await expect(home.card(PRODUCTS.inStock.name)).toBeVisible()
  })

  test('search narrows results to matching products', async ({ page }) => {
    const home = new HomePage(page)
    await home.goto()

    await home.search('Headphones')

    await expect(home.productCards).toHaveCount(1)
    await expect(home.card(PRODUCTS.inStock.name)).toBeVisible()
  })

  test('search with no matches shows the empty state', async ({ page }) => {
    const home = new HomePage(page)
    await home.goto()

    await home.search('this product does not exist in the catalog')

    await expect(home.productCards).toHaveCount(0)
    await expect(home.emptyState).toHaveText('No products match your search.')
  })

  test('filtering by category shows only that category', async ({ page }) => {
    const home = new HomePage(page)
    await home.goto()

    await home.filterByCategory('Audio')

    const names = await home.productNames()
    expect(names.length).toBeGreaterThan(0)
    for (const name of names) {
      expect(['Aurora Wireless Headphones', 'Cascade Bluetooth Speaker', 'Rove Earbuds']).toContain(name)
    }
  })

  test('sorting by price (low to high) orders products ascending', async ({ page }) => {
    const home = new HomePage(page)
    await home.goto()

    await home.sortBy('Price: Low to High')

    const prices = await home.productPrices()
    const sorted = [...prices].sort((a, b) => a - b)
    expect(prices).toEqual(sorted)
  })

  test('sorting by top rated orders products by descending rating', async ({ page }) => {
    const home = new HomePage(page)
    await home.goto()

    await home.sortBy('Top Rated')

    const firstCardName = (await home.productNames())[0]
    // Ember Ceramic Mug Set has the highest seeded rating (4.8).
    expect(firstCardName).toBe('Ember Ceramic Mug Set')
  })
})

// Fixed, well-known data this suite depends on. Kept in sync with server/db/seedData.js —
// if that seed data changes, update the product references below to match.

export const TEST_USER = {
  name: 'E2E Test User',
  email: 'e2e-suite-user@example.test',
  password: 'TestPass123!',
}

export function uniqueEmail(prefix = 'e2e') {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.test`
}

// A representative slice of the seeded catalog, picked for specific stock states
// so tests can exercise normal, low-stock, and out-of-stock behavior deliberately.
export const PRODUCTS = {
  inStock: { id: 'p1', name: 'Aurora Wireless Headphones', price: 89.99, category: 'Audio' },
  ample: { id: 'p3', name: 'Ember Ceramic Mug Set', price: 34.5, category: 'Home' },
  secondary: { id: 'p6', name: 'Cascade Bluetooth Speaker', price: 54.0, category: 'Audio' },
  lowStock: { id: 'p9', name: 'Halo Smart Ring', price: 199.0, stock: 3 },
  outOfStock: { id: 'p4', name: 'Voyage Canvas Backpack', price: 64.99 },
  forOrderHistory: { id: 'p5', name: 'Solstice Sunglasses', price: 45.0 },
}

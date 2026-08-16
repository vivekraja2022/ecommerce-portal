import { pool } from './pool.js'
import { PRODUCTS } from './seedData.js'

async function seed() {
  for (const p of PRODUCTS) {
    await pool.query(
      `INSERT INTO products (id, name, category, price, rating, reviews, stock, image, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         category = EXCLUDED.category,
         price = EXCLUDED.price,
         rating = EXCLUDED.rating,
         reviews = EXCLUDED.reviews,
         stock = EXCLUDED.stock,
         image = EXCLUDED.image,
         description = EXCLUDED.description`,
      [p.id, p.name, p.category, p.price, p.rating, p.reviews, p.stock, p.image, p.description]
    )
  }
  console.log(`Seeded ${PRODUCTS.length} products.`)
  await pool.end()
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})

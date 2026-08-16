import { Router } from 'express'
import { pool } from '../db/pool.js'

const router = Router()

function toProduct(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    rating: Number(row.rating),
    reviews: row.reviews,
    stock: row.stock,
    image: row.image,
    description: row.description,
  }
}

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY name')
    res.json(rows.map(toProduct))
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.json(toProduct(rows[0]))
  } catch (err) {
    next(err)
  }
})

export default router

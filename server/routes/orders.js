import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { pool } from '../db/pool.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { logger } from '../otel/logger.js'
import { ordersPlacedCounter, orderRevenueCounter, checkoutFailedCounter } from '../otel/metrics.js'

const router = Router()

router.use(requireAuth)

function httpError(status, message) {
  return Object.assign(new Error(message), { status })
}

function validateShipping(shipping) {
  if (!shipping || typeof shipping !== 'object') throw httpError(400, 'Missing shipping details')
  const { name, email, address, city, zip } = shipping
  if (!name?.trim()) throw httpError(400, 'Name is required')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email ?? '')) throw httpError(400, 'Valid email is required')
  if (!address?.trim()) throw httpError(400, 'Address is required')
  if (!city?.trim()) throw httpError(400, 'City is required')
  if (!/^\d{4,10}$/.test(zip ?? '')) throw httpError(400, 'Valid postal code is required')
}

router.get('/', async (req, res, next) => {
  try {
    const { rows: orderRows } = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY placed_at DESC',
      [req.user.id]
    )
    const { rows: itemRows } = await pool.query(
      'SELECT * FROM order_items WHERE order_id = ANY($1)',
      [orderRows.map((o) => o.id)]
    )
    const itemsByOrder = new Map()
    for (const item of itemRows) {
      const list = itemsByOrder.get(item.order_id) ?? []
      list.push({ id: item.product_id, name: item.product_name, price: Number(item.price), qty: item.qty })
      itemsByOrder.set(item.order_id, list)
    }

    res.json(
      orderRows.map((order) => ({
        id: order.id,
        placedAt: order.placed_at,
        total: Number(order.total),
        items: itemsByOrder.get(order.id) ?? [],
      }))
    )
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  const { items, shipping } = req.body ?? {}

  const client = await pool.connect()
  try {
    if (!Array.isArray(items) || items.length === 0) {
      throw httpError(400, 'Order must include at least one item')
    }
    validateShipping(shipping)

    await client.query('BEGIN')

    const productIds = items.map((i) => i.productId)
    const { rows: products } = await client.query(
      'SELECT * FROM products WHERE id = ANY($1) FOR UPDATE',
      [productIds]
    )
    const productMap = new Map(products.map((p) => [p.id, p]))

    let total = 0
    const orderItems = []
    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product) throw httpError(400, `Unknown product ${item.productId}`)
      if (!Number.isInteger(item.qty) || item.qty < 1) throw httpError(400, 'Invalid quantity')
      if (product.stock < item.qty) throw httpError(409, `${product.name} only has ${product.stock} left in stock`)
      total += Number(product.price) * item.qty
      orderItems.push({ product, qty: item.qty })
    }

    const orderId = `ord_${randomUUID()}`
    await client.query(
      `INSERT INTO orders (id, user_id, customer_name, customer_email, address, city, zip, total)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [orderId, req.user.id, shipping.name, shipping.email, shipping.address, shipping.city, shipping.zip, total]
    )

    for (const { product, qty } of orderItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, price, qty)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, product.id, product.name, product.price, qty]
      )
      await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [qty, product.id])
    }

    await client.query('COMMIT')

    ordersPlacedCounter.add(1)
    orderRevenueCounter.add(total)
    logger.info('order_placed', { order_id: orderId, user_id: req.user.id, total, item_count: orderItems.length })

    res.status(201).json({
      id: orderId,
      placedAt: new Date().toISOString(),
      total,
      shipping,
      items: orderItems.map(({ product, qty }) => ({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        qty,
      })),
    })
  } catch (err) {
    await client.query('ROLLBACK')
    const reason = err.status === 409 ? 'insufficient_stock' : err.status === 400 ? 'validation_error' : 'server_error'
    checkoutFailedCounter.add(1, { reason })
    logger.warn('checkout_failed', { reason, user_id: req.user.id, message: err.message })
    next(err)
  } finally {
    client.release()
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const { rows: orderRows } = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id])
    if (orderRows.length === 0 || orderRows[0].user_id !== req.user.id) {
      return res.status(404).json({ error: 'Order not found' })
    }
    const order = orderRows[0]
    const { rows: itemRows } = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [req.params.id])

    res.json({
      id: order.id,
      placedAt: order.placed_at,
      total: Number(order.total),
      shipping: {
        name: order.customer_name,
        email: order.customer_email,
        address: order.address,
        city: order.city,
        zip: order.zip,
      },
      items: itemRows.map((i) => ({
        id: i.product_id,
        name: i.product_name,
        price: Number(i.price),
        qty: i.qty,
      })),
    })
  } catch (err) {
    next(err)
  }
})

export default router

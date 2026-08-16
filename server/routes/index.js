import { Router } from 'express'
import products from './products.js'
import orders from './orders.js'

const router = Router()

router.use('/products', products)
router.use('/orders', orders)

export default router

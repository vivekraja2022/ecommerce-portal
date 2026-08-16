import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import StarRating from '../components/StarRating'
import QuantityStepper from '../components/QuantityStepper'
import { useProducts } from '../context/ProductsContext'
import { useCart } from '../context/CartContext'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { getProductById, loading } = useProducts()
  const product = getProductById(id)
  const [qty, setQty] = useState(1)
  const [justAdded, setJustAdded] = useState(false)

  if (loading) {
    return (
      <div className="page">
        <p className="empty-state">Loading product…</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="page">
        <p className="empty-state">Product not found.</p>
        <Link to="/" className="btn">
          Back to shop
        </Link>
      </div>
    )
  }

  const outOfStock = product.stock === 0

  function handleAddToCart() {
    addItem(product.id, qty)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1800)
  }

  function handleBuyNow() {
    addItem(product.id, qty)
    navigate('/checkout')
  }

  return (
    <div className="page">
      <Link to="/" className="back-link">
        ← Back to shop
      </Link>
      <div className="product-detail">
        <div className="product-detail__image">
          <img src={product.image} alt={product.name} />
          {outOfStock && <span className="badge badge--out">Out of stock</span>}
        </div>
        <div className="product-detail__info">
          <span className="eyebrow">{product.category}</span>
          <h1>{product.name}</h1>
          <StarRating rating={product.rating} reviews={product.reviews} />
          <p className="price price--large">${product.price.toFixed(2)}</p>
          <p className="product-detail__description">{product.description}</p>
          <p className="stock-note">
            {outOfStock
              ? 'Currently out of stock'
              : product.stock <= 5
                ? `Only ${product.stock} left in stock`
                : 'In stock'}
          </p>

          {!outOfStock && (
            <div className="product-detail__actions">
              <QuantityStepper qty={qty} onChange={setQty} max={product.stock} />
              <button type="button" className="btn" onClick={handleAddToCart}>
                Add to cart
              </button>
              <button type="button" className="btn btn--primary" onClick={handleBuyNow}>
                Buy now
              </button>
            </div>
          )}
          {justAdded && <p className="confirm-note">Added to cart ✓</p>}
        </div>
      </div>
    </div>
  )
}

import { Link, useNavigate } from 'react-router-dom'
import QuantityStepper from '../components/QuantityStepper'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { items, subtotal, updateQty, removeItem, clearCart } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="page">
        <h1>Your cart</h1>
        <p className="empty-state">Your cart is empty.</p>
        <Link to="/" className="btn btn--primary">
          Start shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>Your cart</h1>
      <div className="cart-layout">
        <ul className="cart-list">
          {items.map(({ product, qty }) => (
            <li key={product.id} className="cart-item">
              <Link to={`/product/${product.id}`}>
                <img src={product.image} alt={product.name} />
              </Link>
              <div className="cart-item__info">
                <Link to={`/product/${product.id}`} className="cart-item__name">
                  {product.name}
                </Link>
                <span className="price">${product.price.toFixed(2)}</span>
              </div>
              <QuantityStepper
                qty={qty}
                max={product.stock}
                onChange={(next) => updateQty(product.id, next)}
              />
              <span className="cart-item__line-total">
                ${(product.price * qty).toFixed(2)}
              </span>
              <button
                type="button"
                className="link-btn"
                onClick={() => removeItem(product.id)}
                aria-label={`Remove ${product.name} from cart`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>

        <aside className="cart-summary">
          <h2>Order summary</h2>
          <div className="cart-summary__row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="cart-summary__row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="cart-summary__row cart-summary__row--total">
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <button type="button" className="btn btn--primary btn--full" onClick={() => navigate('/checkout')}>
            Checkout
          </button>
          <button type="button" className="link-btn" onClick={clearCart}>
            Clear cart
          </button>
        </aside>
      </div>
    </div>
  )
}

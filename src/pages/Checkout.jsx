import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { placeOrder } from '../api/client'
import { useSession } from '../lib/authClient'

const emptyForm = { name: '', email: '', address: '', city: '', zip: '' }

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const { data: session } = useSession()
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    name: session?.user.name ?? '',
    email: session?.user.email ?? '',
  }))
  const [errors, setErrors] = useState({})
  const [placedOrder, setPlacedOrder] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  function validate() {
    const next = {}
    if (!form.name.trim()) next.name = 'Name is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Valid email is required'
    if (!form.address.trim()) next.address = 'Address is required'
    if (!form.city.trim()) next.city = 'City is required'
    if (!/^\d{4,10}$/.test(form.zip)) next.zip = 'Valid postal code is required'
    return next
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setSubmitting(true)
    setSubmitError(null)
    try {
      const order = await placeOrder({
        items: items.map(({ product, qty }) => ({ productId: product.id, qty })),
        shipping: form,
      })
      setPlacedOrder(order)
      clearCart()
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (placedOrder) {
    return (
      <div className="page">
        <div className="order-confirmation">
          <h1>Thanks, {placedOrder.shipping.name.split(' ')[0]}!</h1>
          <p>Your order has been placed.</p>
          <p className="order-id">Order #{placedOrder.id}</p>
          <ul className="order-confirmation__items">
            {placedOrder.items.map((i) => (
              <li key={i.id}>
                {i.qty} × {i.name} — ${(i.price * i.qty).toFixed(2)}
              </li>
            ))}
          </ul>
          <p className="order-total">Total paid: ${placedOrder.total.toFixed(2)}</p>
          <Link to="/" className="btn btn--primary">
            Continue shopping
          </Link>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="page">
        <h1>Checkout</h1>
        <p className="empty-state">Your cart is empty.</p>
        <Link to="/" className="btn btn--primary">
          Start shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>Checkout</h1>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit} noValidate>
          <h2>Shipping details</h2>

          <label>
            Full name
            <input name="name" value={form.name} onChange={handleChange} />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </label>

          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={handleChange} />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </label>

          <label>
            Address
            <input name="address" value={form.address} onChange={handleChange} />
            {errors.address && <span className="field-error">{errors.address}</span>}
          </label>

          <div className="form-row">
            <label>
              City
              <input name="city" value={form.city} onChange={handleChange} />
              {errors.city && <span className="field-error">{errors.city}</span>}
            </label>
            <label>
              Postal code
              <input name="zip" value={form.zip} onChange={handleChange} />
              {errors.zip && <span className="field-error">{errors.zip}</span>}
            </label>
          </div>

          <p className="mock-note">This is a mock checkout — no payment is processed.</p>

          {submitError && <p className="field-error">{submitError}</p>}

          <button type="submit" className="btn btn--primary btn--full" disabled={submitting}>
            {submitting ? 'Placing order…' : `Place order — $${subtotal.toFixed(2)}`}
          </button>
        </form>

        <aside className="cart-summary">
          <h2>Order summary</h2>
          <ul className="checkout-summary-list">
            {items.map(({ product, qty }) => (
              <li key={product.id}>
                <span>
                  {qty} × {product.name}
                </span>
                <span>${(product.price * qty).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="cart-summary__row cart-summary__row--total">
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
        </aside>
      </div>
    </div>
  )
}

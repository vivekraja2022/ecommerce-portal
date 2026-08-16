import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchMyOrders } from '../api/client'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMyOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page">
      <h1>Your orders</h1>

      {loading && <p className="empty-state">Loading orders…</p>}
      {error && <p className="empty-state">Couldn't load orders: {error}</p>}

      {!loading && !error && orders.length === 0 && (
        <>
          <p className="empty-state">You haven't placed any orders yet.</p>
          <Link to="/" className="btn btn--primary">
            Start shopping
          </Link>
        </>
      )}

      {!loading && !error && orders.length > 0 && (
        <ul className="order-list">
          {orders.map((order) => (
            <li key={order.id} className="order-list__item">
              <div className="order-list__header">
                <span className="order-id">{order.id}</span>
                <span>{new Date(order.placedAt).toLocaleDateString()}</span>
              </div>
              <ul className="checkout-summary-list">
                {order.items.map((item) => (
                  <li key={item.id}>
                    <span>
                      {item.qty} × {item.name}
                    </span>
                    <span>${(item.price * item.qty).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="order-list__total">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

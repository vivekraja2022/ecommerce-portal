async function request(path, options) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.error || `Request failed with status ${res.status}`)
  }
  return data
}

export function fetchProducts() {
  return request('/products')
}

export function fetchProduct(id) {
  return request(`/products/${id}`)
}

export function placeOrder(order) {
  return request('/orders', {
    method: 'POST',
    body: JSON.stringify(order),
  })
}

export function fetchMyOrders() {
  return request('/orders')
}

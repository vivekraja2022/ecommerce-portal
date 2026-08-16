import { createContext, useContext, useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useProducts } from './ProductsContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useLocalStorage('cart_items', [])
  const { products, getProductById } = useProducts()

  function addItem(productId, qty = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId)
      if (existing) {
        return prev.map((i) =>
          i.productId === productId ? { ...i, qty: i.qty + qty } : i
        )
      }
      return [...prev, { productId, qty }]
    })
  }

  function removeItem(productId) {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }

  function updateQty(productId, qty) {
    if (qty <= 0) {
      removeItem(productId)
      return
    }
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, qty } : i))
    )
  }

  function clearCart() {
    setItems([])
  }

  const detailedItems = useMemo(
    () =>
      items
        .map((i) => {
          const product = getProductById(i.productId)
          return product ? { ...i, product } : null
        })
        .filter(Boolean),
    [items, products]
  )

  const totalCount = useMemo(
    () => items.reduce((sum, i) => sum + i.qty, 0),
    [items]
  )

  const subtotal = useMemo(
    () => detailedItems.reduce((sum, i) => sum + i.product.price * i.qty, 0),
    [detailedItems]
  )

  const value = {
    items: detailedItems,
    totalCount,
    subtotal,
    addItem,
    removeItem,
    updateQty,
    clearCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}

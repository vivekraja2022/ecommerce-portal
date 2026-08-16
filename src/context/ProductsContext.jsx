import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { fetchProducts } from '../api/client'

const ProductsContext = createContext(null)

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchProducts()
      .then((data) => {
        if (!cancelled) setProducts(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category))).sort()
    return ['All', ...unique]
  }, [products])

  function getProductById(id) {
    return products.find((p) => p.id === id)
  }

  const value = { products, categories, loading, error, getProductById }

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProducts must be used within a ProductsProvider')
  return ctx
}

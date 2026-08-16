import { useMemo, useState } from 'react'
import ProductCard from '../components/ProductCard'
import { useProducts } from '../context/ProductsContext'

export default function Home() {
  const { products, categories, loading, error } = useProducts()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('featured')

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      const matchesCategory = category === 'All' || p.category === category
      const matchesQuery = p.name.toLowerCase().includes(query.trim().toLowerCase())
      return matchesCategory && matchesQuery
    })

    if (sort === 'price-asc') result = [...result].sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') result = [...result].sort((a, b) => b.price - a.price)
    if (sort === 'rating') result = [...result].sort((a, b) => b.rating - a.rating)

    return result
  }, [products, query, category, sort])

  return (
    <div className="page">
      <section className="hero-banner">
        <h1>Shop everything you need</h1>
        <p>Curated picks across audio, wearables, home, and more.</p>
      </section>

      <div className="toolbar">
        <input
          type="search"
          placeholder="Search products…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
          aria-label="Search products"
        />
        <div className="toolbar__filters">
          <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products">
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {loading && <p className="empty-state">Loading products…</p>}
      {error && <p className="empty-state">Couldn't load products: {error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <p className="empty-state">No products match your search.</p>
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="product-grid">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}

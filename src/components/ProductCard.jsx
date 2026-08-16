import { Link } from 'react-router-dom'
import StarRating from './StarRating'
import { useCart } from '../context/CartContext'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const outOfStock = product.stock === 0

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-card__image-link">
        <img src={product.image} alt={product.name} loading="lazy" />
        {outOfStock && <span className="badge badge--out">Out of stock</span>}
      </Link>
      <div className="product-card__body">
        <Link to={`/product/${product.id}`} className="product-card__name">
          {product.name}
        </Link>
        <StarRating rating={product.rating} reviews={product.reviews} />
        <div className="product-card__footer">
          <span className="price">${product.price.toFixed(2)}</span>
          <button
            type="button"
            className="btn btn--small"
            disabled={outOfStock}
            onClick={() => addItem(product.id, 1)}
          >
            {outOfStock ? 'Sold out' : 'Add to cart'}
          </button>
        </div>
      </div>
    </div>
  )
}

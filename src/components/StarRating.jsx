export default function StarRating({ rating, reviews }) {
  const full = Math.round(rating)
  return (
    <div className="star-rating" aria-label={`Rated ${rating} out of 5`}>
      <span className="stars" aria-hidden="true">
        {'★'.repeat(full)}
        {'☆'.repeat(5 - full)}
      </span>
      <span className="rating-value">{rating.toFixed(1)}</span>
      {reviews != null && <span className="rating-count">({reviews})</span>}
    </div>
  )
}

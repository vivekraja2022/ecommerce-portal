export default function QuantityStepper({ qty, onChange, max = 99, min = 1 }) {
  return (
    <div className="qty-stepper">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, qty - 1))}
        disabled={qty <= min}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="qty-value">{qty}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, qty + 1))}
        disabled={qty >= max}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from '../lib/authClient'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error: signUpError } = await signUp.email({ name, email, password })
    setSubmitting(false)
    if (signUpError) {
      setError(signUpError.message || 'Could not create account')
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="page">
      <div className="auth-form-wrap">
        <h1>Create an account</h1>
        <form className="auth-form checkout-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </label>
          {error && <p className="field-error">{error}</p>}
          <button type="submit" className="btn btn--primary btn--full" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

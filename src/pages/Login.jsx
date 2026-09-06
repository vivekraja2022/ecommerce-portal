import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { signIn, useSession } from '../lib/authClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { refetch: refetchSession } = useSession()
  const from = location.state?.from?.pathname || '/'

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error: signInError } = await signIn.email({ email, password })
    if (signInError) {
      setSubmitting(false)
      setError(signInError.message || 'Could not sign in')
      return
    }
    // signIn only kicks off a background session refresh; RequireAuth reads the
    // reactive session synchronously, so wait for it to actually resolve before
    // navigating back to a protected route, or it redirects straight to /login again.
    await refetchSession()
    setSubmitting(false)
    navigate(from, { replace: true })
  }

  return (
    <div className="page">
      <div className="auth-form-wrap">
        <h1>Sign in</h1>
        <form className="auth-form checkout-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          {error && <p className="field-error">{error}</p>}
          <button type="submit" className="btn btn--primary btn--full" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  )
}

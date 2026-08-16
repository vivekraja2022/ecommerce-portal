import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useSession, signOut } from '../lib/authClient'

export default function Header() {
  const { totalCount } = useCart()
  const { data: session } = useSession()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="brand">
          Shoply
        </Link>
        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Shop
          </NavLink>
          <NavLink to="/cart" className={({ isActive }) => (isActive ? 'active' : '')}>
            Cart
            {totalCount > 0 && <span className="cart-badge">{totalCount}</span>}
          </NavLink>
          {session ? (
            <>
              <NavLink to="/orders" className={({ isActive }) => (isActive ? 'active' : '')}>
                Orders
              </NavLink>
              <span className="nav__user">{session.user.name || session.user.email}</span>
              <button type="button" className="link-btn nav__signout" onClick={handleSignOut}>
                Sign out
              </button>
            </>
          ) : (
            <NavLink to="/login" className={({ isActive }) => (isActive ? 'active' : '')}>
              Sign in
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}

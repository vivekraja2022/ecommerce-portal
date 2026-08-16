import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from '../lib/authClient'

export default function RequireAuth({ children }) {
  const { data: session, isPending } = useSession()
  const location = useLocation()

  if (isPending) {
    return (
      <div className="page">
        <p className="empty-state">Loading…</p>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

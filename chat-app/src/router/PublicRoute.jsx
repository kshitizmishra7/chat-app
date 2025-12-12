import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Loader } from '../components/ui/Loader'

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="app-loading">
        <Loader size="large" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/chat" replace />
  }

  return children
}




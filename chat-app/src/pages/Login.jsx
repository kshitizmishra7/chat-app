import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { LoginForm } from '../components/auth/LoginForm'
import './AuthPage.css'

export const Login = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  // Auto-redirect when authenticated (handled by PublicRoute, but this is a backup)
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/chat', { replace: true })
    }
  }, [isAuthenticated, navigate])

  return (
    <div className="auth-page">
      <div className="auth-page-container">
        <div className="auth-page-content">
          <h1 className="auth-page-title">💬 Chat App</h1>
          <p className="auth-page-subtitle">Connect with people in real-time</p>
          <LoginForm
            onSwitchToRegister={() => navigate('/register')}
          />
        </div>
      </div>
    </div>
  )
}


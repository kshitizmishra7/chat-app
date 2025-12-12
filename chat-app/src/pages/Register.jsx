import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { RegisterForm } from '../components/auth/RegisterForm'
import './AuthPage.css'

export const Register = () => {
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
          <p className="auth-page-subtitle">Create your account to get started</p>
          <RegisterForm
            onSwitchToLogin={() => navigate('/login')}
          />
        </div>
      </div>
    </div>
  )
}


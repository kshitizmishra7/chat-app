import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import './AuthForm.css'

export const LoginForm = ({ onSwitchToRegister }) => {
  const { login, loading, error } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [formError, setFormError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setFormError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!formData.email || !formData.password) {
      setFormError('Please fill in all fields')
      return
    }

    try {
      await login(formData)
      // Navigation will be handled automatically by PublicRoute/ProtectedRoute
    } catch (err) {
      setFormError(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Login</h2>
      <p className="auth-subtitle">Welcome back! Please login to continue.</p>

      {(formError || error) && (
        <div className="auth-error">{formError || error}</div>
      )}

      <Input
        type="email"
        name="email"
        label="Email"
        placeholder="Enter your email"
        value={formData.email}
        onChange={handleChange}
        disabled={loading}
        required
      />

      <Input
        type="password"
        name="password"
        label="Password"
        placeholder="Enter your password"
        value={formData.password}
        onChange={handleChange}
        disabled={loading}
        required
      />

      <Button type="submit" loading={loading} className="auth-submit-button">
        Login
      </Button>

      <p className="auth-switch">
        Don't have an account?{' '}
        <button type="button" onClick={onSwitchToRegister} className="auth-link">
          Register
        </button>
      </p>
    </form>
  )
}


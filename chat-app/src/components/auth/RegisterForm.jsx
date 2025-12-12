import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { isValidEmail, isStrongPassword } from '../../utils/helpers'
import './AuthForm.css'

export const RegisterForm = ({ onSwitchToLogin }) => {
  const { register, loading, error } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [formError, setFormError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setFormError('')
  }

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setFormError('Please fill in all fields')
      return false
    }

    if (!isValidEmail(formData.email)) {
      setFormError('Please enter a valid email address')
      return false
    }

    if (!isStrongPassword(formData.password)) {
      setFormError('Password must be at least 8 characters with uppercase, lowercase, and number')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!validateForm()) return

    try {
      const { confirmPassword, ...registerData } = formData
      await register(registerData)
      // Navigation will be handled automatically by PublicRoute/ProtectedRoute
    } catch (err) {
      setFormError(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Register</h2>
      <p className="auth-subtitle">Create an account to get started.</p>

      {(formError || error) && (
        <div className="auth-error">{formError || error}</div>
      )}

      <Input
        type="text"
        name="username"
        label="Username"
        placeholder="Enter your username"
        value={formData.username}
        onChange={handleChange}
        disabled={loading}
        required
      />

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

      <Input
        type="password"
        name="confirmPassword"
        label="Confirm Password"
        placeholder="Confirm your password"
        value={formData.confirmPassword}
        onChange={handleChange}
        disabled={loading}
        required
      />

      <Button type="submit" loading={loading} className="auth-submit-button">
        Register
      </Button>

      <p className="auth-switch">
        Already have an account?{' '}
        <button type="button" onClick={onSwitchToLogin} className="auth-link">
          Login
        </button>
      </p>
    </form>
  )
}


import { useState, useEffect } from 'react'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../store/useAuthStore'
import { storage } from '../utils/storage'

export const useAuth = () => {
  const { user, token, setUser, setToken, clearAuth } = useAuthStore()
  const [loading, setLoading] = useState(true) // Start with true to check initial state
  const [error, setError] = useState(null)

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = storage.getToken()
        const storedUser = storage.getUser()

        if (storedToken && storedUser) {
          setToken(storedToken)
          setUser(storedUser)
        }
      } catch (err) {
        console.error('Auth check error:', err)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [setToken, setUser])

  // Login
  const login = async (credentials) => {
    try {
      setLoading(true)
      setError(null)
      const response = await authApi.login(credentials)
      
      // Backend returns { success, message, data: { user, token, refreshToken } }
      const token = response.data?.token || response.token
      const user = response.data?.user || response.user
      
      if (token) {
        storage.setToken(token)
        setToken(token)
      }
      
      if (user) {
        storage.setUser(user)
        setUser(user)
      }

      return response
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Register
  const register = async (userData) => {
    try {
      setLoading(true)
      setError(null)
      const response = await authApi.register(userData)
      
      // Backend returns { success, message, data: { user, token, refreshToken } }
      const token = response.data?.token || response.token
      const user = response.data?.user || response.user
      
      if (token) {
        storage.setToken(token)
        setToken(token)
      }
      
      if (user) {
        storage.setUser(user)
        setUser(user)
      }

      return response
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const logout = async () => {
    try {
      setLoading(true)
      await authApi.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      storage.removeToken()
      storage.removeUser()
      clearAuth()
      setLoading(false)
    }
  }

  // Get current user
  const getCurrentUser = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await authApi.getCurrentUser()
      const user = response.data?.user || response.user
      if (user) {
        storage.setUser(user)
        setUser(user)
      }
      return response
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to get user'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true)
      setError(null)
      const response = await authApi.updateProfile(userData)
      const user = response.data?.user || response.user
      if (user) {
        storage.setUser(user)
        setUser(user)
      }
      return response
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    error,
    login,
    register,
    logout,
    getCurrentUser,
    updateProfile,
  }
}


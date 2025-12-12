import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Login } from '../pages/Login'
import { Register } from '../pages/Register'
import { ChatPage } from '../pages/ChatPage'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'
import { Loader } from '../components/ui/Loader'

export const AppRouter = () => {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="app-loading">
        <Loader size="large" />
      </div>
    )
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/chat" replace />} />

      {/* 404 Route */}
      <Route path="*" element={<Navigate to="/chat" replace />} />
    </Routes>
  )
}




import { useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { initSocket } from './socket/socket'
import { AppRouter } from './router/AppRouter'
import './App.css'

function App() {
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      // Initialize socket connection when authenticated
      initSocket()
    }
  }, [isAuthenticated])

  return <AppRouter />
}

export default App

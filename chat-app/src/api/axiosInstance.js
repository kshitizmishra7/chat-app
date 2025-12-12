import axios from 'axios'

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 30000, // Increased to 30 seconds for chat operations
  withCredentials: true, // Important for CORS with credentials
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage (or wherever you store it)
    const token = localStorage.getItem('token')
    
    // Add token to headers if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        data: config.data,
      })
    }

    return config
  },
  (error) => {
    // Handle request error
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      })
    }

    // Return response data directly (optional - you can return full response if needed)
    return response
  },
  (error) => {
    // Handle response error
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token')
          // You can add redirect logic here if needed
          console.error('❌ Unauthorized - Please login again')
          break
        case 403:
          console.error('❌ Forbidden - Access denied')
          break
        case 404:
          console.error('❌ Not Found - Resource not found')
          break
        case 500:
          console.error('❌ Server Error - Please try again later')
          break
        default:
          console.error(`❌ Error ${status}:`, data?.message || 'An error occurred')
      }

      // Log error in development
      if (import.meta.env.DEV) {
        console.error('❌ API Error Response:', {
          status,
          url: error.config?.url,
          data: data,
        })
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('❌ No response received:', error.request)
      if (error.code === 'ECONNABORTED') {
        console.error('❌ Request timeout - Server took too long to respond')
      }
    } else {
      // Error setting up the request
      console.error('❌ Request setup error:', error.message)
    }
    
    // Handle timeout specifically
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.error('❌ Request timed out after', error.config?.timeout || 'unknown', 'ms')
    }

    return Promise.reject(error)
  }
)

export default axiosInstance


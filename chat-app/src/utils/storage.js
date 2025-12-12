// LocalStorage utility functions

export const storage = {
  // Get item from localStorage
  get: (key) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error)
      return null
    }
  },

  // Set item in localStorage
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error)
      return false
    }
  },

  // Remove item from localStorage
  remove: (key) => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error)
      return false
    }
  },

  // Clear all localStorage
  clear: () => {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('Error clearing localStorage:', error)
      return false
    }
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('token')
  },

  // Set token
  setToken: (token) => {
    localStorage.setItem('token', token)
  },

  // Remove token
  removeToken: () => {
    localStorage.removeItem('token')
  },

  // Get user data
  getUser: () => {
    return storage.get('user')
  },

  // Set user data
  setUser: (user) => {
    return storage.set('user', user)
  },

  // Remove user data
  removeUser: () => {
    return storage.remove('user')
  },
}



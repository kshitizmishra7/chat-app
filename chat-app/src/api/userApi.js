import axiosInstance from './axiosInstance'

export const userApi = {
  // Get all users (for finding people to chat with)
  getUsers: async (search = '') => {
    const params = search ? { search } : {}
    const response = await axiosInstance.get('/users', { params })
    return response.data
  },

  // Get user by ID
  getUserById: async (userId) => {
    const response = await axiosInstance.get(`/users/${userId}`)
    return response.data
  },
}


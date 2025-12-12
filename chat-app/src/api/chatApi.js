import axiosInstance from './axiosInstance'

export const chatApi = {
  // Get all chats/conversations
  getChats: async () => {
    const response = await axiosInstance.get('/chats')
    return response.data
  },

  // Get single chat by ID
  getChatById: async (chatId) => {
    const response = await axiosInstance.get(`/chats/${chatId}`)
    return response.data
  },

  // Create new chat/conversation
  createChat: async (chatData) => {
    try {
      console.log('chatApi.createChat - Sending request:', chatData)
      const response = await axiosInstance.post('/chats', chatData)
      console.log('chatApi.createChat - Response received:', response)
      console.log('chatApi.createChat - Response status:', response.status)
      console.log('chatApi.createChat - Response data:', response.data)
      
      // Handle different response structures
      if (response.data) {
        return response.data
      }
      
      // Fallback if response structure is different
      return response
    } catch (error) {
      console.error('chatApi.createChat - Error:', error)
      console.error('chatApi.createChat - Error code:', error.code)
      console.error('chatApi.createChat - Error message:', error.message)
      if (error.response) {
        console.error('chatApi.createChat - Error response data:', error.response.data)
        console.error('chatApi.createChat - Error response status:', error.response.status)
      }
      throw error
    }
  },

  // Update chat
  updateChat: async (chatId, chatData) => {
    const response = await axiosInstance.put(`/chats/${chatId}`, chatData)
    return response.data
  },

  // Delete chat
  deleteChat: async (chatId) => {
    const response = await axiosInstance.delete(`/chats/${chatId}`)
    return response.data
  },

  // Search chats
  searchChats: async (query) => {
    const response = await axiosInstance.get(`/chats/search?q=${query}`)
    return response.data
  },
}


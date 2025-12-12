import axiosInstance from './axiosInstance'

export const messageApi = {
  // Get messages for a chat
  getMessages: async (chatId, params = {}) => {
    try {
      console.log('messageApi.getMessages - chatId:', chatId, 'params:', params)
      const response = await axiosInstance.get(`/chats/${chatId}/messages`, { params })
      console.log('messageApi.getMessages - Response:', response)
      console.log('messageApi.getMessages - Response data:', response.data)
      return response.data
    } catch (error) {
      console.error('messageApi.getMessages - Error:', error)
      throw error
    }
  },

  // Send a message
  sendMessage: async (chatId, messageData) => {
    const response = await axiosInstance.post(`/chats/${chatId}/messages`, messageData)
    return response.data
  },

  // Update a message
  updateMessage: async (chatId, messageId, messageData) => {
    const response = await axiosInstance.put(`/chats/${chatId}/messages/${messageId}`, messageData)
    return response.data
  },

  // Delete a message
  deleteMessage: async (chatId, messageId) => {
    const response = await axiosInstance.delete(`/chats/${chatId}/messages/${messageId}`)
    return response.data
  },

  // Mark messages as read
  markAsRead: async (chatId, messageIds) => {
    const response = await axiosInstance.post(`/chats/${chatId}/messages/read`, { messageIds })
    return response.data
  },
}


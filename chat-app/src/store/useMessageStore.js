import { create } from 'zustand'

export const useMessageStore = create((set, get) => ({
  messages: {},
  loading: false,
  error: null,
  typingUsers: {},

  // Set messages for a chat
  setMessages: (chatId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: messages,
      },
    })),

  // Add message to a chat
  addMessage: (chatId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] || []), message],
      },
    })),

  // Update message
  updateMessage: (chatId, messageId, updates) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: (state.messages[chatId] || []).map((msg) =>
          msg.id === messageId ? { ...msg, ...updates } : msg
        ),
      },
    })),

  // Remove message
  removeMessage: (chatId, messageId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: (state.messages[chatId] || []).filter((msg) => msg.id !== messageId),
      },
    })),

  // Clear messages for a chat
  clearMessages: (chatId) =>
    set((state) => {
      const newMessages = { ...state.messages }
      delete newMessages[chatId]
      return { messages: newMessages }
    }),

  // Set typing users for a chat
  setTypingUsers: (chatId, users) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [chatId]: users,
      },
    })),

  // Add typing user
  addTypingUser: (chatId, user) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [chatId]: [...(state.typingUsers[chatId] || []), user],
      },
    })),

  // Remove typing user
  removeTypingUser: (chatId, userId) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [chatId]: (state.typingUsers[chatId] || []).filter((user) => user.id !== userId),
      },
    })),

  // Clear typing users for a chat
  clearTypingUsers: (chatId) =>
    set((state) => {
      const newTypingUsers = { ...state.typingUsers }
      delete newTypingUsers[chatId]
      return { typingUsers: newTypingUsers }
    }),

  // Set loading
  setLoading: (loading) => set({ loading }),

  // Set error
  setError: (error) => set({ error }),

  // Get messages for a chat
  getMessages: (chatId) => {
    const state = get()
    return state.messages[chatId] || []
  },

  // Get typing users for a chat
  getTypingUsers: (chatId) => {
    const state = get()
    return state.typingUsers[chatId] || []
  },
}))



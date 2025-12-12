import { create } from 'zustand'

export const useChatStore = create((set, get) => ({
  chats: [],
  selectedChat: null,
  loading: false,
  error: null,

  // Set chats
  setChats: (chats) => set({ chats }),

  // Add chat
  addChat: (chat) => {
    const chatId = chat._id || chat.id
    return set((state) => {
      // Check if chat already exists
      const exists = state.chats.some(c => (c._id || c.id) === chatId)
      if (exists) {
        // Update existing chat
        return {
          chats: state.chats.map(c => 
            (c._id || c.id) === chatId ? { ...c, ...chat, id: chatId, _id: chatId } : c
          ),
        }
      }
      // Add new chat
      return {
        chats: [{ ...chat, id: chatId, _id: chatId }, ...state.chats],
      }
    })
  },

  // Update chat
  updateChat: (chatId, updates) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId ? { ...chat, ...updates } : chat
      ),
    })),

  // Remove chat
  removeChat: (chatId) =>
    set((state) => ({
      chats: state.chats.filter((chat) => chat.id !== chatId),
      selectedChat: state.selectedChat?.id === chatId ? null : state.selectedChat,
    })),

  // Select chat
  selectChat: (chat) => {
    if (!chat) {
      return set({ selectedChat: null })
    }
    // Normalize chat ID
    const chatId = chat._id || chat.id
    const normalizedChat = {
      ...chat,
      id: chatId,
      _id: chatId,
    }
    console.log('Selecting chat:', normalizedChat)
    return set({ selectedChat: normalizedChat })
  },

  // Clear selected chat
  clearSelectedChat: () => set({ selectedChat: null }),

  // Set loading
  setLoading: (loading) => set({ loading }),

  // Set error
  setError: (error) => set({ error }),

  // Get chat by ID
  getChatById: (chatId) => {
    const state = get()
    return state.chats.find((chat) => chat.id === chatId)
  },
}))


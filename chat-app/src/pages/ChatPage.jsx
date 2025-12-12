import { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useSocket } from '../hooks/useSocket'
import { useChatStore } from '../store/useChatStore'
import { useMessageStore } from '../store/useMessageStore'
import { chatApi } from '../api/chatApi'
import { messageApi } from '../api/messageApi'
import { ChatList } from '../components/chat/ChatList'
import { ChatWindow } from '../components/chat/ChatWindow'
import { NewChatModal } from '../components/chat/NewChatModal'
import { Button } from '../components/ui/Button'
import { SOCKET_EVENTS } from '../utils/constants'
import './ChatPage.css'

export const ChatPage = () => {
  const { user, logout } = useAuth()
  const { connected, emit, on, off, joinRoom, leaveRoom } = useSocket()
  const {
    chats,
    selectedChat,
    setChats,
    selectChat,
    loading: chatsLoading,
    setLoading: setChatsLoading,
  } = useChatStore()
  const {
    messages,
    setMessages,
    addMessage,
    getMessages,
    updateMessage,
    setLoading: setMessagesLoading,
  } = useMessageStore()
  const [loading, setLoading] = useState(true)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const joinedChatIdRef = useRef(null) // Track which chat we've joined

  // Extract chatId for stable reference
  const selectedChatId = selectedChat?._id || selectedChat?.id

  // Define loadMessages before useEffects that use it
  const loadMessages = useCallback(async (chatId) => {
    if (!chatId) {
      console.error('loadMessages: No chatId provided')
      return
    }
    
    try {
      setMessagesLoading(true)
      console.log('Loading messages for chat:', chatId)
      
      // Add timeout wrapper
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 25000)
      })
      
      const response = await Promise.race([
        messageApi.getMessages(chatId),
        timeoutPromise
      ])
      
      const messages = response.data?.messages || response.messages || []
      console.log('Loaded messages:', messages.length)
      
      // Normalize messages from backend format to frontend format
      // Backend sends: { sender: { _id, username, email, avatar }, message, createdAt, ... }
      // Frontend expects: { userId, username, userAvatar, message, timestamp, ... }
      const normalizedMessages = messages.map(msg => ({
        ...msg,
        id: msg._id || msg.id,
        userId: msg.sender?._id || msg.sender?.id || msg.userId,
        username: msg.sender?.username || msg.username || 'Unknown',
        userAvatar: msg.sender?.avatar || msg.userAvatar,
        timestamp: msg.createdAt || msg.timestamp || new Date().toISOString(),
      }))
      
      console.log('Normalized messages:', normalizedMessages.length)
      setMessages(chatId, normalizedMessages)
    } catch (error) {
      console.error('Failed to load messages:', error)
      if (error.message?.includes('timeout')) {
        console.error('Message loading timed out')
      }
      // Set empty messages on error to prevent UI from hanging
      setMessages(chatId, [])
    } finally {
      setMessagesLoading(false)
    }
  }, [setMessages, setMessagesLoading])

  // Load chats on mount
  useEffect(() => {
    loadChats()
  }, [])

  // Set up socket listeners
  useEffect(() => {
    if (!connected) return

    const currentChatId = selectedChatId

    const handleMessage = (data) => {
      const messageChatId = data.chatId || data.chat?._id || data.chat?.id
      if (messageChatId && currentChatId && messageChatId.toString() === currentChatId.toString()) {
        // Normalize socket message to match backend format
        // Socket sends: { chatId, message, userId, username, userAvatar, timestamp }
        // Ensure it matches the normalized format used by API messages
        const normalizedMessage = {
          ...data,
          id: data.id || data._id,
          userId: data.userId?._id || data.userId?.id || data.userId,
          username: data.username || data.sender?.username || 'Unknown',
          userAvatar: data.userAvatar || data.sender?.avatar,
          timestamp: data.timestamp || data.createdAt || new Date().toISOString(),
        }
        addMessage(currentChatId, normalizedMessage)
      }
    }

    const handleUserJoined = (data) => {
      console.log('User joined:', data)
    }

    const handleUserLeft = (data) => {
      console.log('User left:', data)
    }

    on(SOCKET_EVENTS.MESSAGE, handleMessage)
    on(SOCKET_EVENTS.USER_JOINED, handleUserJoined)
    on(SOCKET_EVENTS.USER_LEFT, handleUserLeft)

    return () => {
      off(SOCKET_EVENTS.MESSAGE, handleMessage)
      off(SOCKET_EVENTS.USER_JOINED, handleUserJoined)
      off(SOCKET_EVENTS.USER_LEFT, handleUserLeft)
    }
  }, [connected, selectedChatId, on, off, addMessage]) // Use chatId instead of whole object

  // Join room when chat is selected
  useEffect(() => {
    if (!selectedChatId || !connected) {
      // Leave previous room if chat is deselected
      if (joinedChatIdRef.current) {
        leaveRoom(joinedChatIdRef.current)
        joinedChatIdRef.current = null
      }
      return
    }

    const chatId = selectedChatId
    if (!chatId) {
      return
    }

    // Only join if we haven't already joined this chat
    if (joinedChatIdRef.current === chatId) {
      return
    }

    // Leave previous room if switching chats
    if (joinedChatIdRef.current && joinedChatIdRef.current !== chatId) {
      leaveRoom(joinedChatIdRef.current)
    }

    console.log('Joining room:', chatId)
    joinRoom(chatId)
    joinedChatIdRef.current = chatId
    loadMessages(chatId)

    return () => {
      if (joinedChatIdRef.current === chatId) {
        console.log('Leaving room:', chatId)
        leaveRoom(chatId)
        joinedChatIdRef.current = null
      }
    }
  }, [selectedChatId, connected, loadMessages, joinRoom, leaveRoom]) // Use chatId instead of whole object

  const loadChats = async () => {
    try {
      setChatsLoading(true)
      console.log('Loading chats...')
      
      // Add timeout wrapper
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 25000)
      })
      
      const response = await Promise.race([
        chatApi.getChats(),
        timeoutPromise
      ])
      
      console.log('Chats API response:', response)
      
      // Handle different response structures
      let chats = []
      if (response.data?.chats) {
        chats = response.data.chats
      } else if (response.chats) {
        chats = response.chats
      } else if (Array.isArray(response.data)) {
        chats = response.data
      }
      
      // Normalize chat IDs and derive names for private chats
      const currentUserId = user?._id || user?.id
      
      const normalizedChats = chats.map(chat => {
        let chatName = chat.name
        
        // For private chats without a name, derive from other participant
        if (!chatName && chat.type === 'private' && chat.participants && Array.isArray(chat.participants)) {
          const otherParticipant = chat.participants.find(p => {
            const participantId = typeof p === 'object' ? (p._id || p.id) : p
            return participantId && currentUserId && participantId.toString() !== currentUserId.toString()
          })
          
          if (otherParticipant) {
            if (typeof otherParticipant === 'object') {
              chatName = otherParticipant.username || otherParticipant.email || 'Unknown'
            }
          }
        }
        
        return {
          ...chat,
          id: chat._id || chat.id,
          name: chatName || chat.name || 'Unknown',
        }
      })
      
      console.log('Normalized chats:', normalizedChats.length)
      console.log('Normalized chats data:', normalizedChats)
      setChats(normalizedChats)
      console.log('Chats set in store. Total:', normalizedChats.length)
    } catch (error) {
      console.error('Failed to load chats:', error)
      if (error.message?.includes('timeout')) {
        console.error('Chat loading timed out')
      }
      // Set empty array on error to prevent UI from hanging
      setChats([])
    } finally {
      setChatsLoading(false)
      setLoading(false)
    }
  }

  const handleSelectChat = (chat) => {
    selectChat(chat)
  }

  const handleSendMessage = async (messageText) => {
    if (!selectedChat || !messageText.trim()) return

    const chatId = selectedChat._id || selectedChat.id
    if (!chatId) {
      console.error('No chat ID found')
      return
    }

    const messageData = {
      chatId: chatId,
      message: messageText,
      userId: user?._id || user?.id,
      username: user?.username,
      userAvatar: user?.avatar,
      timestamp: new Date().toISOString(),
    }

    try {
      // Send via socket for real-time
      emit(SOCKET_EVENTS.MESSAGE, messageData)

      // Also send via API for persistence
      const apiResponse = await messageApi.sendMessage(chatId, {
        message: messageText,
      })
      
      // If API returns the message, normalize and update/add it to store
      // This ensures the message from API matches the format and has correct ownership
      if (apiResponse?.data?.message) {
        const apiMessage = apiResponse.data.message
        const normalizedApiMessage = {
          ...apiMessage,
          id: apiMessage._id || apiMessage.id,
          userId: apiMessage.sender?._id || apiMessage.sender?.id || apiMessage.userId || messageData.userId,
          username: apiMessage.sender?.username || apiMessage.username || messageData.username,
          userAvatar: apiMessage.sender?.avatar || apiMessage.userAvatar || messageData.userAvatar,
          timestamp: apiMessage.createdAt || apiMessage.timestamp || messageData.timestamp,
        }
        
        // Check if message already exists (might have been added via socket)
        const existingMessages = getMessages(chatId)
        const messageIndex = existingMessages.findIndex(m => 
          (m.id || m._id) === normalizedApiMessage.id ||
          (m.message === messageText && Math.abs(new Date(m.timestamp || 0) - new Date(normalizedApiMessage.timestamp || 0)) < 5000)
        )
        
        if (messageIndex >= 0) {
          // Update existing message with normalized data from API
          updateMessage(chatId, existingMessages[messageIndex].id || existingMessages[messageIndex]._id, normalizedApiMessage)
        } else {
          // Add new message if not found
          addMessage(chatId, normalizedApiMessage)
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleTyping = (isTyping) => {
    if (!selectedChat) return
    if (isTyping) {
      emit(SOCKET_EVENTS.USER_TYPING, { chatId: selectedChat.id })
    } else {
      emit(SOCKET_EVENTS.USER_STOPPED_TYPING, { chatId: selectedChat.id })
    }
  }

  const handleLogout = async () => {
    await logout()
    window.location.href = '/login'
  }

  if (loading) {
    return <div className="chat-page-loading">Loading...</div>
  }

  return (
    <div className="chat-page">
      <div className="chat-page-sidebar">
        <div className="chat-page-header">
          <div className="chat-page-header-info">
            <div className="chat-page-user-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.username} />
              ) : (
                <div className="chat-page-user-avatar-placeholder">
                  {user?.username?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div>
              <h3 className="chat-page-username">{user?.username || 'User'}</h3>
              <span className={`chat-page-status ${connected ? 'online' : 'offline'}`}>
                {connected ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          <Button variant="outline" size="small" onClick={handleLogout}>
            Logout
          </Button>
        </div>
        <div className="chat-page-chat-list-header">
          <Button
            variant="primary"
            size="small"
            onClick={() => setShowNewChatModal(true)}
            className="new-chat-button"
          >
            + New Chat
          </Button>
        </div>
        <ChatList
          chats={chats}
          selectedChatId={selectedChat?.id}
          onSelectChat={handleSelectChat}
          loading={chatsLoading}
        />
        <NewChatModal
          isOpen={showNewChatModal}
          onClose={() => setShowNewChatModal(false)}
          onChatCreated={async (newChat) => {
            console.log('onChatCreated callback - newChat:', newChat)
            try {
              // Reload chats to get updated list with all populated data
              await loadChats()
              
              // After reloading, ensure the new chat is selected
              if (newChat) {
                const chatId = newChat._id || newChat.id
                console.log('Selecting chat with ID:', chatId)
                
                // Wait a bit for state to update
                setTimeout(() => {
                  // Find the chat in the updated list
                  const updatedChats = chats
                  const foundChat = updatedChats.find(c => {
                    const cId = c._id || c.id
                    return cId && chatId && cId.toString() === chatId.toString()
                  })
                  
                  if (foundChat) {
                    const normalizedChat = {
                      ...foundChat,
                      id: chatId,
                      _id: chatId,
                    }
                    console.log('Selecting found chat:', normalizedChat)
                    selectChat(normalizedChat)
                  } else {
                    // If not found in list, use the newChat directly
                    const normalizedChat = {
                      ...newChat,
                      id: chatId,
                      _id: chatId,
                    }
                    console.log('Selecting newChat directly:', normalizedChat)
                    selectChat(normalizedChat)
                  }
                }, 100)
              }
            } catch (error) {
              console.error('Error in onChatCreated callback:', error)
            }
          }}
        />
      </div>
      <div className="chat-page-main">
        <ChatWindow
          chat={selectedChat}
          messages={selectedChat ? getMessages(selectedChat._id || selectedChat.id) : []}
          currentUserId={user?._id || user?.id}
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          loading={false}
        />
      </div>
    </div>
  )
}


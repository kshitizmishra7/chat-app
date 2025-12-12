import { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Loader } from '../ui/Loader'
import { userApi } from '../../api/userApi'
import { chatApi } from '../../api/chatApi'
import { useChatStore } from '../../store/useChatStore'
import { debounce } from '../../utils/helpers'
import './NewChatModal.css'

export const NewChatModal = ({ isOpen, onClose, onChatCreated }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const { addChat, selectChat } = useChatStore()

  // Debounced search
  const debouncedSearch = debounce(async (query) => {
    if (!query.trim()) {
      setUsers([])
      return
    }

    try {
      setLoading(true)
      setError('')
      const response = await userApi.getUsers(query)
      setUsers(response.data?.users || [])
    } catch (err) {
      setError('Failed to search users')
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }, 300)

  useEffect(() => {
    if (isOpen && searchQuery) {
      debouncedSearch(searchQuery)
    } else if (!searchQuery) {
      setUsers([])
    }
  }, [searchQuery, isOpen])

  const handleCreateChat = async (selectedUser) => {
    // Prevent multiple clicks
    if (creating) {
      console.log('Already creating chat, ignoring click')
      return
    }
    
    try {
      setCreating(true)
      setError('')
      console.log('handleCreateChat called with user:', selectedUser)
      
      console.log('Creating chat with user:', selectedUser)
      const userId = selectedUser._id || selectedUser.id
      console.log('User ID:', userId)
      
      if (!userId) {
        throw new Error('Invalid user ID')
      }
      
      const chatData = {
        participants: [userId],
        type: 'private',
      }
      console.log('Sending chat data:', chatData)
      
      // Add timeout wrapper
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout - Server took too long to respond')), 25000)
      })
      
      const response = await Promise.race([
        chatApi.createChat(chatData),
        timeoutPromise
      ])
      
      console.log('Chat API response:', response)

      // Backend returns: { success: true, data: { chat: {...} } }
      // Handle different response structures
      let newChat = null
      
      if (response.data?.data?.chat) {
        // Structure: { data: { data: { chat: {...} } } }
        newChat = response.data.data.chat
      } else if (response.data?.chat) {
        // Structure: { data: { chat: {...} } }
        newChat = response.data.chat
      } else if (response.chat) {
        // Structure: { chat: {...} }
        newChat = response.chat
      } else if (response.data) {
        // Fallback: response.data might be the chat itself
        newChat = response.data
      }
      
      console.log('Extracted chat:', newChat)
      console.log('Full response structure:', response)
      
      if (newChat) {
        // Normalize chat object - ensure id is set (MongoDB uses _id)
        const chatId = newChat._id || newChat.id
        
        // For private chats, set name from other participant if not set
        let chatName = newChat.name
        if (!chatName && newChat.participants && Array.isArray(newChat.participants) && newChat.participants.length > 0) {
          // Find the other participant (the one we're chatting with)
          const otherParticipant = newChat.participants.find(p => {
            if (typeof p === 'object' && p !== null) {
              const participantId = p._id || p.id
              const selectedUserId = selectedUser._id || selectedUser.id
              return participantId && selectedUserId && participantId.toString() !== selectedUserId.toString()
            }
            return false
          })
          
          if (otherParticipant && typeof otherParticipant === 'object') {
            chatName = otherParticipant.username || otherParticipant.email || 'Unknown'
          } else {
            // Fallback: use selected user's name
            chatName = selectedUser.username || selectedUser.email || 'New Chat'
          }
        } else if (!chatName) {
          // Fallback: use selected user's name
          chatName = selectedUser.username || selectedUser.email || 'New Chat'
        }
        
        const normalizedChat = {
          ...newChat,
          id: chatId,
          _id: chatId, // Keep both for compatibility
          name: chatName || newChat.name || 'New Chat',
        }
        
        console.log('Created chat:', normalizedChat)
        
        // Add chat to store
        addChat(normalizedChat)
        
        // Select the chat immediately
        selectChat(normalizedChat)
        
        // Call callback to reload chats list
        onChatCreated?.(normalizedChat)
        
        // Close modal and reset
        onClose()
        setSearchQuery('')
        setUsers([])
      } else {
        const errorMsg = 'Failed to create chat - no chat returned'
        setError(errorMsg)
        console.error('No chat in response. Full response:', response)
        setCreating(false)
      }
    } catch (err) {
      console.error('Create chat error:', err)
      console.error('Error response:', err.response)
      console.error('Error message:', err.message)
      console.error('Error code:', err.code)
      
      let errorMessage = 'Failed to create chat'
      if (err.message?.includes('timeout') || err.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please check if the backend server is running and try again.'
      } else if (err.response) {
        errorMessage = err.response.data?.message || err.response.data?.error || errorMessage
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      setCreating(false)
    }
  }

  const handleClose = () => {
    setSearchQuery('')
    setUsers([])
    setError('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="New Chat" size="medium">
      <div className="new-chat-modal">
        <Input
          type="text"
          placeholder="Search by username or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="new-chat-search"
          autoFocus
        />

        {error && <div className="new-chat-error">{error}</div>}

        {loading && (
          <div className="new-chat-loading">
            <Loader size="small" />
            <span>Searching...</span>
          </div>
        )}

        {!loading && searchQuery && users.length === 0 && (
          <div className="new-chat-empty">
            <p>No users found. Try a different search term.</p>
          </div>
        )}

        {!loading && users.length > 0 && (
          <div className="new-chat-users">
            {users.map((user) => (
              <div
                key={user._id || user.id}
                className={`new-chat-user-item ${creating ? 'disabled' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (!creating) {
                    console.log('User item clicked:', user)
                    handleCreateChat(user)
                  }
                }}
                style={{ cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.6 : 1 }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !creating) {
                    e.preventDefault()
                    handleCreateChat(user)
                  }
                }}
              >
                <div className="new-chat-user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} />
                  ) : (
                    <div className="new-chat-user-avatar-placeholder">
                      {user.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  {user.isOnline && <span className="new-chat-online-indicator"></span>}
                </div>
                <div className="new-chat-user-info">
                  <h4 className="new-chat-user-name">{user.username}</h4>
                  <p className="new-chat-user-email">{user.email}</p>
                </div>
                {creating && (
                  <div className="new-chat-creating">
                    <Loader size="small" />
                    <span style={{ marginLeft: '8px', fontSize: '0.875rem', color: '#666' }}>
                      Creating...
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!searchQuery && (
          <div className="new-chat-hint">
            <p>Start typing to search for users...</p>
          </div>
        )}
      </div>
    </Modal>
  )
}


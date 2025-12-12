import { useEffect, useRef } from 'react'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { EmptyState } from './EmptyState'
import { Loader } from '../ui/Loader'
import './ChatWindow.css'

export const ChatWindow = ({
  chat,
  messages,
  currentUserId,
  onSendMessage,
  onTyping,
  loading = false,
}) => {
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (loading && (!messages || messages.length === 0)) {
    return (
      <div className="chat-window-loading">
        <Loader />
      </div>
    )
  }

  if (!chat) {
    return (
      <div className="chat-window-empty">
        <EmptyState message="Select a chat to start messaging" />
      </div>
    )
  }

  return (
    <div className="chat-window">
      <div className="chat-window-header">
        <div className="chat-window-header-info">
          {chat.avatar ? (
            <img src={chat.avatar} alt={chat.name} className="chat-window-avatar" />
          ) : (
            <div className="chat-window-avatar-placeholder">
              {chat.name?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
          <div>
            <h3 className="chat-window-name">{chat.name || 'Unknown'}</h3>
            {chat.isOnline && (
              <span className="chat-window-status">Online</span>
            )}
          </div>
        </div>
      </div>

      <div className="chat-window-messages" ref={messagesContainerRef}>
        {messages && messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageBubble
              key={message.id || index}
              message={message}
              currentUserId={currentUserId}
            />
          ))
        ) : (
          <EmptyState />
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        onSendMessage={onSendMessage}
        onTyping={onTyping}
        disabled={!chat}
      />
    </div>
  )
}




import { cn } from '../../utils/helpers'
import { formatDate, truncate } from '../../utils/helpers'
import './ChatItem.css'

export const ChatItem = ({ chat, isSelected, onClick }) => {
  const lastMessage = chat.lastMessage
  const unreadCount = chat.unreadCount || 0

  // For private chats, get name from other participant if chat name is not set
  let displayName = chat.name
  if (!displayName && chat.participants && Array.isArray(chat.participants)) {
    // Find the first participant that's not the current user (you'd need to pass currentUserId)
    const otherParticipant = chat.participants.find(p => p.username)
    if (otherParticipant) {
      displayName = otherParticipant.username
    }
  }

  // Get avatar from other participant for private chats
  let displayAvatar = chat.avatar
  if (!displayAvatar && chat.participants && Array.isArray(chat.participants)) {
    const otherParticipant = chat.participants.find(p => p.avatar)
    if (otherParticipant) {
      displayAvatar = otherParticipant.avatar
    }
  }

  // Check if other participant is online
  const isOnline = chat.participants?.some(p => p.isOnline && p.username !== chat.name)

  return (
    <div
      className={cn('chat-item', isSelected && 'chat-item-selected')}
      onClick={onClick}
    >
      <div className="chat-item-avatar">
        {displayAvatar ? (
          <img src={displayAvatar} alt={displayName} />
        ) : (
          <div className="chat-item-avatar-placeholder">
            {displayName?.charAt(0).toUpperCase() || '?'}
          </div>
        )}
        {isOnline && <span className="chat-item-online-indicator"></span>}
      </div>
      <div className="chat-item-content">
        <div className="chat-item-header">
          <h3 className="chat-item-name">{displayName || 'Unknown'}</h3>
          {lastMessage && (
            <span className="chat-item-time">{formatDate(lastMessage.timestamp || lastMessage.createdAt)}</span>
          )}
        </div>
        <div className="chat-item-footer">
          <p className="chat-item-preview">
            {lastMessage ? truncate(lastMessage.message, 50) : 'No messages yet'}
          </p>
          {unreadCount > 0 && (
            <span className="chat-item-unread">{unreadCount}</span>
          )}
        </div>
      </div>
    </div>
  )
}


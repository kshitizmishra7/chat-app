import { cn } from '../../utils/helpers'
import { formatTime } from '../../utils/helpers'
import './MessageBubble.css'

export const MessageBubble = ({ message, isOwn, currentUserId }) => {
  // Normalize message userId for comparison (handle both _id and id formats)
  const messageUserId = message.userId?._id || message.userId?.id || message.userId
  const normalizedCurrentUserId = currentUserId?._id || currentUserId?.id || currentUserId
  
  // Compare as strings to handle ObjectId vs string comparisons
  const isOwnMessage = isOwn || (messageUserId && normalizedCurrentUserId && 
    messageUserId.toString() === normalizedCurrentUserId.toString())

  return (
    <div className={cn('message-bubble', isOwnMessage && 'message-bubble-own')}>
      {!isOwnMessage && (
        <div className="message-bubble-avatar">
          {message.userAvatar ? (
            <img src={message.userAvatar} alt={message.username} />
          ) : (
            <div className="message-bubble-avatar-placeholder">
              {message.username?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
        </div>
      )}
      <div className="message-bubble-content">
        {!isOwnMessage && (
          <div className="message-bubble-header">
            <span className="message-bubble-username">{message.username}</span>
          </div>
        )}
        <div className="message-bubble-text">{message.message}</div>
        <div className="message-bubble-footer">
          <span className="message-bubble-time">
            {formatTime(message.timestamp)}
          </span>
          {isOwnMessage && message.read && (
            <span className="message-bubble-read">✓✓</span>
          )}
        </div>
      </div>
    </div>
  )
}


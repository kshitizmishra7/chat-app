import './EmptyState.css'

export const EmptyState = ({ message = 'No messages yet. Start the conversation!' }) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">💬</div>
      <p className="empty-state-message">{message}</p>
    </div>
  )
}




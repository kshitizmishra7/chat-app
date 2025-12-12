import { ChatItem } from './ChatItem'
import { Loader } from '../ui/Loader'
import './ChatList.css'

export const ChatList = ({ chats, selectedChatId, onSelectChat, loading }) => {
  // Debug logging
  console.log('ChatList render - loading:', loading, 'chats:', chats?.length, 'chats data:', chats)

  if (loading) {
    return (
      <div className="chat-list-loading">
        <Loader />
      </div>
    )
  }

  if (!chats || chats.length === 0) {
    return (
      <div className="chat-list-empty">
        <p>No chats yet. Start a conversation!</p>
      </div>
    )
  }

  return (
    <div className="chat-list">
      {chats.map((chat) => {
        const chatId = chat._id || chat.id
        return (
          <ChatItem
            key={chatId}
            chat={chat}
            isSelected={chatId === (selectedChatId?._id || selectedChatId?.id || selectedChatId)}
            onClick={() => onSelectChat(chat)}
          />
        )
      })}
    </div>
  )
}


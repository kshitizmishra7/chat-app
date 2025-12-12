import { useState, useRef, useEffect } from 'react'
import { Button } from '../ui/Button'
import './MessageInput.css'

export const MessageInput = ({ onSendMessage, onTyping, disabled = false }) => {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const inputRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  const handleChange = (e) => {
    setMessage(e.target.value)

    if (!isTyping && onTyping) {
      setIsTyping(true)
      onTyping(true)
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      if (onTyping) onTyping(false)
    }, 1000)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!message.trim() || disabled) return

    onSendMessage(message.trim())
    setMessage('')
    inputRef.current?.focus()

    if (isTyping && onTyping) {
      setIsTyping(false)
      onTyping(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form className="message-input-form" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="text"
        className="message-input-field"
        placeholder="Type your message..."
        value={message}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        disabled={disabled}
      />
      <Button
        type="submit"
        disabled={!message.trim() || disabled}
        className="message-input-send"
      >
        Send
      </Button>
    </form>
  )
}




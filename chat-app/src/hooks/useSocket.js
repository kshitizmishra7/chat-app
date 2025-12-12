import { useEffect, useRef, useState, useCallback } from 'react'
import { initSocket, getSocket, disconnectSocket, emit, on, off, isConnected } from '../socket/socket'
import { SOCKET_EVENTS } from '../utils/constants'

export const useSocket = () => {
  const [connected, setConnected] = useState(false)
  const socketRef = useRef(null)

  useEffect(() => {
    // Initialize socket
    const socket = initSocket()
    socketRef.current = socket

    // Connection status handlers
    const handleConnect = () => {
      setConnected(true)
    }

    const handleDisconnect = () => {
      setConnected(false)
    }

    // Set up event listeners
    socket.on(SOCKET_EVENTS.CONNECT, handleConnect)
    socket.on(SOCKET_EVENTS.DISCONNECT, handleDisconnect)

    // Check initial connection status
    setConnected(socket.connected)

    // Cleanup
    return () => {
      socket.off(SOCKET_EVENTS.CONNECT, handleConnect)
      socket.off(SOCKET_EVENTS.DISCONNECT, handleDisconnect)
    }
  }, [])

  // Emit event
  const emitEvent = useCallback((event, data) => {
    emit(event, data)
  }, [])

  // Listen to event
  const listenToEvent = useCallback((event, callback) => {
    if (socketRef.current) {
      on(event, callback)
    }
  }, [on])

  // Remove event listener
  const removeListener = useCallback((event, callback) => {
    if (socketRef.current) {
      off(event, callback)
    }
  }, [off])

  // Join room/chat
  const joinRoom = useCallback((roomId) => {
    emitEvent(SOCKET_EVENTS.JOIN, { roomId })
  }, [emitEvent])

  // Leave room/chat
  const leaveRoom = useCallback((roomId) => {
    emitEvent('leave', { roomId })
  }, [emitEvent])

  // Send message
  const sendMessage = useCallback((messageData) => {
    emitEvent(SOCKET_EVENTS.MESSAGE, messageData)
  }, [emitEvent])

  // Typing indicator
  const startTyping = useCallback((chatId) => {
    emitEvent(SOCKET_EVENTS.USER_TYPING, { chatId })
  }, [emitEvent])

  const stopTyping = useCallback((chatId) => {
    emitEvent(SOCKET_EVENTS.USER_STOPPED_TYPING, { chatId })
  }, [emitEvent])

  return {
    socket: socketRef.current,
    connected,
    isConnected: isConnected(),
    emit: emitEvent,
    on: listenToEvent,
    off: removeListener,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
    disconnect: disconnectSocket,
  }
}


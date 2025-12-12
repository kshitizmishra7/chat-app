import { io } from 'socket.io-client'
import { SOCKET_URL } from '../utils/constants'
import { storage } from '../utils/storage'

let socket = null

/**
 * Initialize socket connection
 */
export const initSocket = () => {
  if (socket?.connected) {
    return socket
  }

  const token = storage.getToken()

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    auth: {
      token: token,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  })

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id)
  })

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason)
  })

  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error)
  })

  return socket
}

/**
 * Get socket instance
 */
export const getSocket = () => {
  if (!socket) {
    return initSocket()
  }
  return socket
}

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

/**
 * Emit event
 */
export const emit = (event, data) => {
  if (socket?.connected) {
    socket.emit(event, data)
  } else {
    console.warn('Socket not connected. Event not sent:', event)
  }
}

/**
 * Listen to event
 */
export const on = (event, callback) => {
  if (socket) {
    socket.on(event, callback)
  }
}

/**
 * Remove event listener
 */
export const off = (event, callback) => {
  if (socket) {
    socket.off(event, callback)
  }
}

/**
 * Check if socket is connected
 */
export const isConnected = () => {
  return socket?.connected || false
}

export default {
  initSocket,
  getSocket,
  disconnectSocket,
  emit,
  on,
  off,
  isConnected,
}



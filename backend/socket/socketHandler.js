import { verifyToken } from '../utils/generateTokens.js'
import User from '../models/User.js'
import Chat from '../models/Chat.js'
import Message from '../models/Message.js'

export const initializeSocket = (io) => {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1]

      if (!token) {
        return next(new Error('Authentication error: No token provided'))
      }

      const decoded = verifyToken(token)

      if (!decoded) {
        return next(new Error('Authentication error: Invalid token'))
      }

      const user = await User.findById(decoded.userId)

      if (!user) {
        return next(new Error('Authentication error: User not found'))
      }

      socket.userId = user._id.toString()
      socket.user = user
      next()
    } catch (error) {
      next(new Error('Authentication error'))
    }
  })

  io.on('connection', async (socket) => {
    console.log(`✅ User connected: ${socket.user.username} (${socket.userId})`)

    // Update user online status
    await User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      lastSeen: new Date(),
    })

    // Join user's personal room
    socket.join(`user:${socket.userId}`)

    // Get user's chats and join their rooms
    const chats = await Chat.find({
      participants: socket.userId,
    })

    chats.forEach((chat) => {
      socket.join(`chat:${chat._id}`)
    })

    // Handle join chat room
    socket.on('join', async ({ roomId, username }) => {
      if (roomId) {
        // Verify user is participant in chat
        const chat = await Chat.findOne({
          _id: roomId,
          participants: socket.userId,
        })

        if (chat) {
          socket.join(`chat:${roomId}`)
          socket.to(`chat:${roomId}`).emit('userJoined', {
            userId: socket.userId,
            username: socket.user.username,
            chatId: roomId,
          })
        }
      } else if (username) {
        // Legacy support for username-based joining
        socket.broadcast.emit('userJoined', {
          username: socket.user.username,
        })
      }
    })

    // Handle leave chat room
    socket.on('leave', ({ roomId }) => {
      if (roomId) {
        socket.leave(`chat:${roomId}`)
        socket.to(`chat:${roomId}`).emit('userLeft', {
          userId: socket.userId,
          username: socket.user.username,
          chatId: roomId,
        })
      }
    })

    // Handle sending message
    socket.on('message', async (data) => {
      try {
        const { chatId, message, type = 'text' } = data

        if (!chatId || !message) {
          return socket.emit('error', { message: 'Chat ID and message are required' })
        }

        // Verify user is participant in chat
        const chat = await Chat.findOne({
          _id: chatId,
          participants: socket.userId,
        })

        if (!chat) {
          return socket.emit('error', { message: 'Chat not found' })
        }

        // Create message in database
        const newMessage = await Message.create({
          chat: chatId,
          sender: socket.userId,
          message,
          type,
        })

        await newMessage.populate('sender', 'username email avatar')

        // Update chat's last message
        chat.lastMessage = newMessage._id
        chat.lastMessageAt = new Date()
        await chat.save()

        // Emit to all users in the chat room
        io.to(`chat:${chatId}`).emit('message', {
          id: newMessage._id,
          chatId,
          sender: {
            id: socket.userId,
            username: socket.user.username,
            avatar: socket.user.avatar,
          },
          message: newMessage.message,
          type: newMessage.type,
          timestamp: newMessage.createdAt,
          userId: socket.userId,
          username: socket.user.username,
          userAvatar: socket.user.avatar,
        })
      } catch (error) {
        console.error('Error handling message:', error)
        socket.emit('error', { message: 'Failed to send message' })
      }
    })

    // Handle typing indicator
    socket.on('userTyping', ({ chatId }) => {
      if (chatId) {
        socket.to(`chat:${chatId}`).emit('userTyping', {
          userId: socket.userId,
          username: socket.user.username,
          chatId,
        })
      }
    })

    socket.on('userStoppedTyping', ({ chatId }) => {
      if (chatId) {
        socket.to(`chat:${chatId}`).emit('userStoppedTyping', {
          userId: socket.userId,
          username: socket.user.username,
          chatId,
        })
      }
    })

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${socket.user.username} (${socket.userId})`)

      // Update user online status
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date(),
      })

      // Notify all chats user is in
      const chats = await Chat.find({
        participants: socket.userId,
      })

      chats.forEach((chat) => {
        socket.to(`chat:${chat._id}`).emit('userLeft', {
          userId: socket.userId,
          username: socket.user.username,
          chatId: chat._id,
        })
      })
    })
  })

  return io
}




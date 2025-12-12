import Message from '../models/Message.js'
import Chat from '../models/Chat.js'

// @desc    Get messages for a chat
// @route   GET /api/chats/:chatId/messages
// @access  Private
export const getMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params
    const userId = req.user._id
    const { page = 1, limit = 50 } = req.query

    // Verify user is participant in chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
    })

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      })
    }

    const skip = (page - 1) * limit

    const messages = await Message.find({
      chat: chatId,
      isDeleted: false,
    })
      .populate('sender', 'username email avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)

    // Mark messages as read
    const unreadMessages = messages.filter(
      (msg) => !msg.isReadBy(userId)
    )

    if (unreadMessages.length > 0) {
      await Promise.all(
        unreadMessages.map((msg) => msg.markAsRead(userId))
      )
    }

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: await Message.countDocuments({ chat: chatId, isDeleted: false }),
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Send a message
// @route   POST /api/chats/:chatId/messages
// @access  Private
export const sendMessage = async (req, res, next) => {
  try {
    const { chatId } = req.params
    const { message, type = 'text' } = req.body
    const userId = req.user._id

    // Verify user is participant in chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
    })

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      })
    }

    // Create message
    const newMessage = await Message.create({
      chat: chatId,
      sender: userId,
      message,
      type,
    })

    await newMessage.populate('sender', 'username email avatar')

    // Update chat's last message
    chat.lastMessage = newMessage._id
    chat.lastMessageAt = new Date()
    await chat.save()

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message: newMessage,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update a message
// @route   PUT /api/chats/:chatId/messages/:messageId
// @access  Private
export const updateMessage = async (req, res, next) => {
  try {
    const { chatId, messageId } = req.params
    const { message } = req.body
    const userId = req.user._id

    // Find message
    const messageDoc = await Message.findOne({
      _id: messageId,
      chat: chatId,
      sender: userId,
      isDeleted: false,
    })

    if (!messageDoc) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      })
    }

    messageDoc.message = message
    await messageDoc.save()
    await messageDoc.populate('sender', 'username email avatar')

    res.json({
      success: true,
      message: 'Message updated successfully',
      data: {
        message: messageDoc,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete a message
// @route   DELETE /api/chats/:chatId/messages/:messageId
// @access  Private
export const deleteMessage = async (req, res, next) => {
  try {
    const { chatId, messageId } = req.params
    const userId = req.user._id

    // Find message
    const messageDoc = await Message.findOne({
      _id: messageId,
      chat: chatId,
      sender: userId,
      isDeleted: false,
    })

    if (!messageDoc) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      })
    }

    // Soft delete
    messageDoc.isDeleted = true
    messageDoc.deletedAt = new Date()
    await messageDoc.save()

    res.json({
      success: true,
      message: 'Message deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Mark messages as read
// @route   POST /api/chats/:chatId/messages/read
// @access  Private
export const markAsRead = async (req, res, next) => {
  try {
    const { chatId } = req.params
    const { messageIds } = req.body
    const userId = req.user._id

    // Verify user is participant in chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
    })

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      })
    }

    if (messageIds && messageIds.length > 0) {
      // Mark specific messages as read
      const messages = await Message.find({
        _id: { $in: messageIds },
        chat: chatId,
      })

      await Promise.all(
        messages.map((msg) => msg.markAsRead(userId))
      )
    } else {
      // Mark all unread messages in chat as read
      const messages = await Message.find({
        chat: chatId,
        isDeleted: false,
      })

      await Promise.all(
        messages
          .filter((msg) => !msg.isReadBy(userId))
          .map((msg) => msg.markAsRead(userId))
      )
    }

    res.json({
      success: true,
      message: 'Messages marked as read',
    })
  } catch (error) {
    next(error)
  }
}




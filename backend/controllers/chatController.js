import Chat from '../models/Chat.js'
import Message from '../models/Message.js'
import User from '../models/User.js'

// @desc    Get all chats for current user
// @route   GET /api/chats
// @access  Private
export const getChats = async (req, res, next) => {
  try {
    const userId = req.user._id

    const chats = await Chat.find({
      participants: userId,
    })
      .populate('participants', 'username email avatar isOnline')
      .populate('lastMessage')
      .populate('createdBy', 'username avatar')
      .sort({ lastMessageAt: -1 })

    res.json({
      success: true,
      data: {
        chats,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single chat by ID
// @route   GET /api/chats/:id
// @access  Private
export const getChatById = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const chat = await Chat.findOne({
      _id: id,
      participants: userId,
    })
      .populate('participants', 'username email avatar isOnline')
      .populate('lastMessage')
      .populate('createdBy', 'username avatar')

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      })
    }

    res.json({
      success: true,
      data: {
        chat,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Create new chat
// @route   POST /api/chats
// @access  Private
export const createChat = async (req, res, next) => {
  try {
    const { participants, name, type = 'private' } = req.body
    const userId = req.user._id

    // For private chat, ensure exactly 2 participants
    if (type === 'private') {
      if (!participants || participants.length !== 1) {
        return res.status(400).json({
          success: false,
          message: 'Private chat must have exactly one other participant',
        })
      }

      // Check if chat already exists between these two users
      const existingChat = await Chat.findOne({
        type: 'private',
        participants: { $all: [userId, participants[0]] },
      })

      if (existingChat) {
        return res.json({
          success: true,
          data: {
            chat: existingChat,
          },
        })
      }
    }

    // Validate participants exist
    const participantIds = type === 'private' ? [userId, ...participants] : participants
    const users = await User.find({ _id: { $in: participantIds } })

    if (users.length !== participantIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more participants not found',
      })
    }

    const chat = await Chat.create({
      name,
      type,
      participants: participantIds,
      createdBy: userId,
    })

    await chat.populate('participants', 'username email avatar isOnline')
    await chat.populate('createdBy', 'username avatar')

    res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      data: {
        chat,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update chat
// @route   PUT /api/chats/:id
// @access  Private
export const updateChat = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user._id
    const { name, avatar } = req.body

    const chat = await Chat.findOne({
      _id: id,
      participants: userId,
    })

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      })
    }

    if (name) chat.name = name
    if (avatar) chat.avatar = avatar

    await chat.save()
    await chat.populate('participants', 'username email avatar isOnline')

    res.json({
      success: true,
      message: 'Chat updated successfully',
      data: {
        chat,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete chat
// @route   DELETE /api/chats/:id
// @access  Private
export const deleteChat = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const chat = await Chat.findOne({
      _id: id,
      participants: userId,
    })

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      })
    }

    // Delete all messages in the chat
    await Message.deleteMany({ chat: id })

    // Delete the chat
    await Chat.findByIdAndDelete(id)

    res.json({
      success: true,
      message: 'Chat deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Search chats
// @route   GET /api/chats/search
// @access  Private
export const searchChats = async (req, res, next) => {
  try {
    const { q } = req.query
    const userId = req.user._id

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      })
    }

    const chats = await Chat.find({
      participants: userId,
      $or: [
        { name: { $regex: q, $options: 'i' } },
      ],
    })
      .populate('participants', 'username email avatar isOnline')
      .populate('lastMessage')
      .limit(20)

    res.json({
      success: true,
      data: {
        chats,
      },
    })
  } catch (error) {
    next(error)
  }
}




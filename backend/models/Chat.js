import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['private', 'group'],
      default: 'private',
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    avatar: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// Index for faster queries
chatSchema.index({ participants: 1 })
chatSchema.index({ lastMessageAt: -1 })

// Virtual for unread count (can be calculated on the fly)
chatSchema.virtual('unreadCount', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'chat',
  count: true,
})

const Chat = mongoose.model('Chat', chatSchema)

export default Chat




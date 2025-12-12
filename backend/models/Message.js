import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: [true, 'Message must belong to a chat'],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Message must have a sender'],
    },
    message: {
      type: String,
      required: [true, 'Message cannot be empty'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text',
    },
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// Index for faster queries
messageSchema.index({ chat: 1, createdAt: -1 })
messageSchema.index({ sender: 1 })

// Mark message as read
messageSchema.methods.markAsRead = function (userId) {
  const existingRead = this.readBy.find(
    (read) => read.user.toString() === userId.toString()
  )

  if (!existingRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date(),
    })
    return this.save()
  }
  return Promise.resolve(this)
}

// Check if message is read by user
messageSchema.methods.isReadBy = function (userId) {
  return this.readBy.some(
    (read) => read.user.toString() === userId.toString()
  )
}

const Message = mongoose.model('Message', messageSchema)

export default Message




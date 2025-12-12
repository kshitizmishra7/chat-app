import express from 'express'
import {
  getMessages,
  sendMessage,
  updateMessage,
  deleteMessage,
  markAsRead,
} from '../controllers/messageController.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

// All routes require authentication
router.use(protect)

router.get('/:chatId/messages', getMessages)
router.post('/:chatId/messages', sendMessage)
router.post('/:chatId/messages/read', markAsRead)
router.put('/:chatId/messages/:messageId', updateMessage)
router.delete('/:chatId/messages/:messageId', deleteMessage)

export default router




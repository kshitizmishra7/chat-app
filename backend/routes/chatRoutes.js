import express from 'express'
import {
  getChats,
  getChatById,
  createChat,
  updateChat,
  deleteChat,
  searchChats,
} from '../controllers/chatController.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

// All routes require authentication
router.use(protect)

router.get('/', getChats)
router.get('/search', searchChats)
router.get('/:id', getChatById)
router.post('/', createChat)
router.put('/:id', updateChat)
router.delete('/:id', deleteChat)

export default router




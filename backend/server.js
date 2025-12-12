import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import { errorHandler, notFound } from './middlewares/errorMiddleware.js'
import { initializeSocket } from './socket/socketHandler.js'

// Import routes
import authRoutes from './routes/authRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import messageRoutes from './routes/messageRoutes.js'
import userRoutes from './routes/userRoutes.js'

// Load environment variables
dotenv.config()

// Connect to database
connectDB()

// Initialize Express app
const app = express()

// Create HTTP server
const httpServer = createServer(app)

// Helper function to parse CORS origins
const getCorsOrigins = () => {
  const envOrigin = process.env.SOCKET_CORS_ORIGIN || process.env.CORS_ORIGIN
  if (envOrigin) {
    // If comma-separated, split into array
    if (envOrigin.includes(',')) {
      return envOrigin.split(',').map(origin => origin.trim())
    }
    return envOrigin
  }
  // Default: allow both common Vite ports
  return ['http://localhost:5173', 'http://localhost:5174']
}

// Initialize Socket.IO
const socketCorsOrigins = getCorsOrigins()
const io = new Server(httpServer, {
  cors: {
    origin: socketCorsOrigins,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  },
})

// Initialize socket handler
initializeSocket(io)

// Middleware - CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getCorsOrigins()
    
    // Allow requests with no origin (like mobile apps, Postman, or curl requests)
    if (!origin) {
      return callback(null, true)
    }
    
    // Normalize origin (remove trailing slash)
    const normalizedOrigin = origin.replace(/\/$/, '')
    
    if (Array.isArray(allowedOrigins)) {
      // Check if origin matches any allowed origin (case-insensitive, handle trailing slashes)
      const isAllowed = allowedOrigins.some(allowed => {
        const normalizedAllowed = allowed.replace(/\/$/, '')
        return normalizedAllowed.toLowerCase() === normalizedOrigin.toLowerCase()
      })
      
      if (isAllowed) {
        return callback(null, true)
      }
    } else if (allowedOrigins === '*' || allowedOrigins === normalizedOrigin) {
      return callback(null, true)
    }
    
    console.log(`❌ CORS blocked origin: ${origin}`)
    console.log(`✅ Allowed origins:`, allowedOrigins)
    callback(new Error(`Not allowed by CORS. Origin: ${origin}`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200, // Some legacy browsers (IE11) choke on 204
  preflightContinue: false,
}

// Handle preflight OPTIONS requests FIRST (before CORS middleware)
app.options('*', (req, res) => {
  const origin = req.headers.origin
  const allowedOrigins = getCorsOrigins()
  
  console.log('🔍 OPTIONS preflight request from origin:', origin)
  console.log('✅ Allowed origins:', allowedOrigins)
  
  if (origin) {
    const normalizedOrigin = origin.replace(/\/$/, '')
    let isAllowed = false
    
    if (Array.isArray(allowedOrigins)) {
      isAllowed = allowedOrigins.some(allowed => {
        const normalizedAllowed = allowed.replace(/\/$/, '')
        return normalizedAllowed.toLowerCase() === normalizedOrigin.toLowerCase()
      })
    } else if (allowedOrigins === '*' || allowedOrigins === normalizedOrigin) {
      isAllowed = true
    }
    
    if (isAllowed) {
      res.header('Access-Control-Allow-Origin', origin)
      res.header('Access-Control-Allow-Credentials', 'true')
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept')
      res.header('Access-Control-Max-Age', '86400') // 24 hours
      console.log('✅ OPTIONS request allowed for origin:', origin)
      return res.sendStatus(200)
    } else {
      console.log('❌ OPTIONS request blocked for origin:', origin)
    }
  }
  
  res.sendStatus(403)
})

// Apply CORS middleware - MUST be before routes
app.use(cors(corsOptions))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/chats', chatRoutes)
app.use('/api/chats', messageRoutes)
app.use('/api/users', userRoutes)

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  })
})

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

// Start server
const PORT = process.env.PORT || 3000

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📡 Socket.IO server initialized`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔓 CORS enabled for origins:`, getCorsOrigins())
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err)
  httpServer.close(() => process.exit(1))
})

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err)
  process.exit(1)
})

export { io }


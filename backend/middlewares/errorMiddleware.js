export const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message

  // Log error
  console.error(err)

  // CORS errors
  if (err.message && err.message.includes('CORS')) {
    const origin = req.headers.origin
    const allowedOrigins = process.env.CORS_ORIGIN || ['http://localhost:5173', 'http://localhost:5174']
    
    // Set CORS headers even on error
    if (origin) {
      res.header('Access-Control-Allow-Origin', origin)
      res.header('Access-Control-Allow-Credentials', 'true')
    }
    
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation',
      origin: origin,
    })
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found'
    error = { message, statusCode: 404 }
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0]
    const message = `${field} already exists`
    error = { message, statusCode: 400 }
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ')
    error = { message, statusCode: 400 }
  }

  // Set CORS headers on error response
  const origin = req.headers.origin
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Credentials', 'true')
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  res.status(404)
  next(error)
}


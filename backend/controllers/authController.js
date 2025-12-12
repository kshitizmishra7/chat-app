import User from '../models/User.js'
import { generateAccessToken, generateRefreshToken } from '../utils/generateTokens.js'

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body

    // Check if user exists
    const userExists = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or username',
      })
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
    })

    // Generate tokens
    const accessToken = generateAccessToken(user._id)
    const refreshToken = generateRefreshToken(user._id)

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token: accessToken,
        refreshToken,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      })
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      })
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      })
    }

    // Update online status
    user.isOnline = true
    user.lastSeen = new Date()
    await user.save()

    // Generate tokens
    const accessToken = generateAccessToken(user._id)
    const refreshToken = generateRefreshToken(user._id)

    // Remove password from response
    const userObj = user.toObject()
    delete userObj.password

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userObj,
        token: accessToken,
        refreshToken,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)

    res.json({
      success: true,
      data: {
        user,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    // Update user online status
    await User.findByIdAndUpdate(req.user._id, {
      isOnline: false,
      lastSeen: new Date(),
    })

    res.json({
      success: true,
      message: 'Logout successful',
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      })
    }

    const { verifyToken } = await import('../utils/generateTokens.js')
    const decoded = verifyToken(refreshToken, true)

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      })
    }

    const newAccessToken = generateAccessToken(decoded.userId)

    res.json({
      success: true,
      data: {
        token: newAccessToken,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { username, avatar } = req.body
    const updateData = {}

    if (username) updateData.username = username
    if (avatar) updateData.avatar = avatar

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user,
      },
    })
  } catch (error) {
    next(error)
  }
}




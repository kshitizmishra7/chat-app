import User from '../models/User.js'

// @desc    Get all users (for finding people to chat with)
// @route   GET /api/users
// @access  Private
export const getUsers = async (req, res, next) => {
  try {
    const userId = req.user._id
    const { search } = req.query

    let query = { _id: { $ne: userId } } // Exclude current user

    // If search query provided, search by username or email
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }

    const users = await User.find(query)
      .select('username email avatar isOnline lastSeen')
      .limit(50)
      .sort({ username: 1 })

    res.json({
      success: true,
      data: {
        users,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params

    const user = await User.findById(id).select('username email avatar isOnline lastSeen')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

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


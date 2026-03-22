const jwt = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
  let token

  // Check for token in Authorization header
  // Format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized — no token' })
  }

  try {
    // Verify the token is valid and not expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Attach the user to the request object
    req.user = await User.findById(decoded.id)

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' })
    }

    next()
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized — invalid token' })
  }
}

module.exports = { protect }

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler } = require('./errorMiddleware');

/**
 * Protects routes using a JWT sent as:  Authorization: Bearer <token>
 * On success, attaches the authenticated user's ID to req.user.id
 */
const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('Not authorized: missing or malformed Authorization header');
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    res.status(401);
    throw new Error('Not authorized: token missing');
  }

  // Throws JsonWebTokenError / TokenExpiredError (handled -> 401)
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Make sure the user still exists
  const userExists = await User.exists({ _id: decoded.id });
  if (!userExists) {
    res.status(401);
    throw new Error('Not authorized: user no longer exists');
  }

  req.user = { id: decoded.id };
  next();
});

module.exports = { protect };

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorMiddleware');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body || {};
  const errors = [];

  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 50) {
    errors.push('Name must be between 2 and 50 characters');
  }
  if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push('A valid email is required');
  }
  if (typeof password !== 'string' || password.length < 6 || password.length > 72) {
    errors.push('Password must be between 6 and 72 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return res.status(409).json({ success: false, message: 'Email is already registered' });
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token: generateToken(user._id),
    user: formatUser(user),
  });
});

/**
 * @desc    Login user and return JWT
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};

  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    return res
      .status(400)
      .json({ success: false, message: 'Email and password are required' });
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token: generateToken(user._id),
    user: formatUser(user),
  });
});

/**
 * @desc    Get current logged-in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.status(200).json({
    success: true,
    user: formatUser(user),
  });
});

module.exports = { registerUser, loginUser, getMe };

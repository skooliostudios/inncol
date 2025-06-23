const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { adminIPRestriction } = require('../middleware/ipRestriction');

const router = express.Router();

// Enhanced rate limiting for admin login attempts
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 requests per windowMs for admin login
  message: {
    message: 'Too many login attempts from this IP, please try again later.',
    retryAfter: 15 * 60 // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// In-memory store for failed login attempts (in production, use Redis)
const failedAttempts = new Map();

// Helper function to track failed login attempts
const trackFailedAttempt = (ip) => {
  const attempts = failedAttempts.get(ip) || { count: 0, lastAttempt: Date.now() };
  attempts.count += 1;
  attempts.lastAttempt = Date.now();
  failedAttempts.set(ip, attempts);
  
  // Clean up old entries after 1 hour
  setTimeout(() => {
    const current = failedAttempts.get(ip);
    if (current && Date.now() - current.lastAttempt > 60 * 60 * 1000) {
      failedAttempts.delete(ip);
    }
  }, 60 * 60 * 1000);
};

// @route   POST /api/auth/login
// @desc    Login user with enhanced security
// @access  Public (but IP restricted for admin)
router.post('/login', [
  adminLoginLimiter,
  adminIPRestriction,
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Invalid input',
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;
    const clientIP = req.ip;

    // Check for too many failed attempts from this IP
    const attempts = failedAttempts.get(clientIP);
    if (attempts && attempts.count >= 5) {
      const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
      if (timeSinceLastAttempt < 30 * 60 * 1000) { // 30 minutes
        return res.status(429).json({ 
          message: 'Too many failed login attempts. Please try again later.',
          retryAfter: Math.ceil((30 * 60 * 1000 - timeSinceLastAttempt) / 1000)
        });
      }
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      trackFailedAttempt(clientIP);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      trackFailedAttempt(clientIP);
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      trackFailedAttempt(clientIP);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Successful login - clear failed attempts and update user
    failedAttempts.delete(clientIP);
    user.lastLogin = new Date();
    user.loginIP = clientIP;
    await user.save();

    // Generate JWT token with enhanced payload
    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role,
      loginTime: Date.now(),
      loginIP: clientIP
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    // Log successful admin login
    console.log(`Admin login successful for ${email} from IP: ${clientIP} at ${new Date().toISOString()}`);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh', auth, async (req, res) => {
  try {
    const payload = {
      userId: req.user._id,
      email: req.user.email,
      role: req.user.role
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
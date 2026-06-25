const express = require('express');
const router = express.Router();

const { register, login, refresh, logout, getMe, updatePreferences } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiters');

// Only login/register are realistic brute-force targets. refresh fires
// automatically on every page load and logout/me/preferences need a valid
// token already — none of those should share this budget.
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.patch('/preferences', protect, updatePreferences);

module.exports = router;

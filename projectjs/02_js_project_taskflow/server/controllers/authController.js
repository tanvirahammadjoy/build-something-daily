const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');
const parseDuration = require('../utils/parseDuration');

const REFRESH_COOKIE_NAME = 'taskflow_refresh_token';
const REFRESH_COOKIE_PATH = '/api/auth';

const setRefreshCookie = (res, token) => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: parseDuration(process.env.JWT_REFRESH_EXPIRES || '7d'),
    path: REFRESH_COOKIE_PATH, // only ever sent back on /api/auth/* requests
  });
};

const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
};

// @route POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are all required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with that email already exists' });
    }

    const user = await User.create({ name, email, password });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshTokens.push(refreshToken);
    await user.save();

    setRefreshCookie(res, refreshToken);
    res.status(201).json({ success: true, user, accessToken });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password +refreshTokens');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshTokens.push(refreshToken);
    await user.save();

    setRefreshCookie(res, refreshToken);
    res.json({ success: true, user, accessToken });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/refresh
// Rotates the refresh token on every use: the old one is invalidated and a
// new one issued. If a token that's signed correctly but no longer appears
// in the user's active list shows up, that means it was already rotated out
// and is now being replayed (e.g. stolen + reused) — every session for that
// user gets revoked as a precaution.
const refresh = async (req, res, next) => {
  try {
    const token = req.cookies[REFRESH_COOKIE_NAME];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      clearRefreshCookie(res);
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(decoded.sub).select('+refreshTokens');
    if (!user) {
      clearRefreshCookie(res);
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }

    if (!user.refreshTokens.includes(token)) {
      user.refreshTokens = [];
      await user.save();
      clearRefreshCookie(res);
      return res.status(401).json({
        success: false,
        message: 'Refresh token reuse detected — all sessions have been logged out for safety. Please log in again.',
      });
    }

    // Rotate
    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    setRefreshCookie(res, newRefreshToken);
    res.json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    const token = req.cookies[REFRESH_COOKIE_NAME];
    clearRefreshCookie(res);

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.sub).select('+refreshTokens');
        if (user) {
          user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
          await user.save();
        }
      } catch {
        // Token already invalid/expired — nothing server-side left to clean up
      }
    }

    res.json({ success: true, message: 'Logged out' });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// @route PATCH /api/auth/preferences
const updatePreferences = async (req, res, next) => {
  try {
    const { theme, emailRemindersEnabled, inAppNotificationsEnabled } = req.body;
    const updates = {};

    if (theme !== undefined) {
      if (!['light', 'dark'].includes(theme)) {
        return res.status(400).json({ success: false, message: 'theme must be "light" or "dark"' });
      }
      updates['preferences.theme'] = theme;
    }
    if (emailRemindersEnabled !== undefined) {
      updates['preferences.emailRemindersEnabled'] = !!emailRemindersEnabled;
    }
    if (inAppNotificationsEnabled !== undefined) {
      updates['preferences.inAppNotificationsEnabled'] = !!inAppNotificationsEnabled;
    }

    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refresh, logout, getMe, updatePreferences };

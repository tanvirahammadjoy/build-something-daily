const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Socket.io's handshake is a raw HTTP request that never passes through our
// Express middleware stack (so cookie-parser doesn't run here) - we need to
// pull the 'token' cookie out of the raw Cookie header ourselves.
const getTokenFromCookieHeader = (cookieHeader) => {
  if (!cookieHeader) return null;
  const match = cookieHeader.split('; ').find((row) => row.startsWith('token='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
};

/**
 * The Socket.io equivalent of the REST `protect` middleware. Reads the same
 * httpOnly JWT cookie the REST API uses (the client must connect with
 * `withCredentials: true` for the browser to attach it), falling back to
 * `auth.token` for non-browser clients/testing tools that can't carry cookies.
 */
const socketAuthMiddleware = async (socket, next) => {
  try {
    const cookieToken = getTokenFromCookieHeader(socket.handshake.headers.cookie);
    const token = cookieToken || socket.handshake.auth?.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new Error('User no longer exists'));
    }

    socket.user = user; // available in every event handler as socket.user
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
};

module.exports = socketAuthMiddleware;

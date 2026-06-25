const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifies the access token from the Authorization header and attaches the
// matching user to req.user. Does NOT touch refresh tokens or cookies —
// that's all handled separately in authController's refresh/logout flows.
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      const message =
        err.name === 'TokenExpiredError'
          ? 'Access token expired'
          : 'Not authorized, invalid token';
      return res.status(401).json({ success: false, message });
    }

    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { protect };

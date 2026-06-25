const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Short-lived token sent in the response body. The client keeps it in memory
// (not localStorage) and attaches it as `Authorization: Bearer <token>`.
const generateAccessToken = (userId) => {
  return jwt.sign(
    { sub: userId.toString(), jti: crypto.randomUUID() },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
  );
};

// Long-lived token, never exposed to JS — only ever set as an httpOnly cookie.
// jti guarantees uniqueness even if two tokens are minted for the same user
// within the same second (JWTs are otherwise deterministic per payload+iat,
// which would silently break rotation/reuse-detection in that edge case).
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { sub: userId.toString(), jti: crypto.randomUUID() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }
  );
};

module.exports = { generateAccessToken, generateRefreshToken };

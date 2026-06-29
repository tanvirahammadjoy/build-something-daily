const jwt = require('jsonwebtoken');

/**
 * Signs a JWT containing the user's id and sets it as an httpOnly cookie.
 * httpOnly means client-side JS can't read it, which protects against
 * XSS-based token theft (a meaningful step up from storing JWTs in localStorage).
 */
const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};

module.exports = generateTokenAndSetCookie;

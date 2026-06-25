const rateLimit = require('express-rate-limit');

// Login/register are the classic brute-force targets. 20 attempts per 15
// minutes per IP is generous for normal use (mistyped passwords, retries)
// while still meaningfully slowing down automated guessing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  // Rate limiting guards against real attackers, not local development.
  // Without this, repeatedly reloading the page during testing (which fires
  // /auth/refresh on every load) burns through the budget in minutes and
  // locks you out of your own app for no security benefit.
  skip: () => process.env.NODE_ENV !== 'production',
  message: { success: false, message: 'Too many attempts — please try again in a few minutes.' },
});

module.exports = { authLimiter };

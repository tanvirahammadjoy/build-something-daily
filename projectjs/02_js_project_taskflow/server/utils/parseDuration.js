// Parses simple duration strings like '15m', '7d', '1h', '30s' into milliseconds.
// Only needed for cookie maxAge — jsonwebtoken's expiresIn accepts these
// strings natively, so this is purely for the cookie side of things.
const UNIT_TO_MS = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

const parseDuration = (input, fallbackMs = 7 * 24 * 60 * 60 * 1000) => {
  const match = /^(\d+)(s|m|h|d)$/.exec(String(input).trim());
  if (!match) return fallbackMs;
  const [, value, unit] = match;
  return parseInt(value, 10) * UNIT_TO_MS[unit];
};

module.exports = parseDuration;

const rateLimit = require("express-rate-limit");


// ==========================================
// FOOD SEARCH RATE LIMITER
// ==========================================

const foodSearchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes

  // Maximum number of food searches from one IP
  limit: 30,

  // Return standard RateLimit headers
  standardHeaders: "draft-8",

  // Don't send older X-RateLimit-* headers
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many food searches. Please try again later.",
  },
});


// ==========================================
// LOGIN RATE LIMITER
// Protects against brute-force attacks
// ==========================================

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes

  // Maximum login attempts from one IP
  limit: 5,

  // Return standard RateLimit headers
  standardHeaders: "draft-8",

  // Don't send older X-RateLimit-* headers
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});


module.exports = {
  foodSearchLimiter,
  loginLimiter,
};
const { rateLimit } = require("express-rate-limit");

const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit:100, // Maximum 100 requests per IP
  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

module.exports = rateLimitMiddleware;
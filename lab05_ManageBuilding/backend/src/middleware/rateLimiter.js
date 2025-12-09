const rateLimit = require('express-rate-limit');

// Create different rate limiters for different endpoints

// Check if we're in development mode to bypass rate limiting
const isDevelopment = process.env.NODE_ENV === 'development';

// Skip function for development mode
const skipForDev = () => isDevelopment;

// General API rate limiter - Relaxed for development
const generalLimiter = rateLimit({
    skip: skipForDev,
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // limit each IP to 500 requests per windowMs (increased for dev)
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiter for sensitive operations
const strictLimiter = rateLimit({
    skip: skipForDev,
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs for sensitive operations
    message: {
        success: false,
        message: 'Too many attempts from this IP, please try again after 15 minutes.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Authentication rate limiter - Relaxed for development
const authLimiter = rateLimit({
    skip: skipForDev,
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // limit each IP to 30 login attempts per windowMs (increased for dev)
    message: {
        success: false,
        message: 'Too many login attempts from this IP, please try again after 15 minutes.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip successful requests
    skipSuccessfulRequests: true,
});
// Registration rate limiter
const registerLimiter = rateLimit({
    skip: skipForDev,
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each IP to 3 registration attempts per hour
    message: {
        success: false,
        message: 'Too many registration attempts from this IP, please try again after 1 hour.',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Password reset rate limiter
const passwordResetLimiter = rateLimit({
    skip: skipForDev,
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each IP to 3 password reset attempts per hour
    message: {
        success: false,
        message: 'Too many password reset attempts from this IP, please try again after 1 hour.',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Admin operations rate limiter - Relaxed for development
const adminLimiter = rateLimit({
    skip: skipForDev,
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 200 admin requests per windowMs (increased for dev)
    message: {
        success: false,
        message: 'Too many admin requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    generalLimiter,
    strictLimiter,
    authLimiter,
    registerLimiter,
    passwordResetLimiter,
    adminLimiter
};
/**
 * Custom error class for API errors
 */
class ApiError extends Error {
    constructor(statusCode, message, isOperational = true, stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

/**
 * Catch async function wrapper
 * Automatically catches any thrown errors and passes them to the next middleware
 */
const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

/**
 * Send success response
 */
const sendResponse = (res, statusCode = 200, message = 'Success', data = null, pagination = null) => {
    const response = {
        success: true,
        message,
        ...(data && { data }),
        ...(pagination && { pagination })
    };

    return res.status(statusCode).json(response);
};

/**
 * Send error response
 */
const sendError = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
    const response = {
        success: false,
        message,
        ...(errors && { errors })
    };

    return res.status(statusCode).json(response);
};

/**
 * Generate random string
 */
const generateRandomString = (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

/**
 * Check if object is empty
 */
const isEmpty = (obj) => {
    return obj === null || obj === undefined ||
        (typeof obj === 'object' && Object.keys(obj).length === 0) ||
        (typeof obj === 'string' && obj.trim().length === 0);
};

/**
 * Sanitize object by removing undefined and null values
 */
const sanitizeObject = (obj) => {
    const sanitized = {};
    for (const key in obj) {
        if (obj[key] !== undefined && obj[key] !== null) {
            sanitized[key] = obj[key];
        }
    }
    return sanitized;
};

/**
 * Format validation errors from express-validator
 */
const formatValidationErrors = (errors) => {
    return errors.reduce((acc, error) => {
        const field = error.path || error.param;
        if (!acc[field]) {
            acc[field] = [];
        }
        acc[field].push(error.msg);
        return acc;
    }, {});
};

/**
 * Calculate pagination offset
 */
const calculateOffset = (page, limit) => {
    return (page - 1) * limit;
};

/**
 * Create pagination metadata
 */
const createPaginationMeta = (count, page, limit) => {
    const totalPages = Math.ceil(count / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
        hasNext,
        hasPrev,
        nextPage: hasNext ? page + 1 : null,
        prevPage: hasPrev ? page - 1 : null
    };
};

module.exports = {
    ApiError,
    catchAsync,
    sendResponse,
    sendError,
    generateRandomString,
    isEmpty,
    sanitizeObject,
    formatValidationErrors,
    calculateOffset,
    createPaginationMeta
};
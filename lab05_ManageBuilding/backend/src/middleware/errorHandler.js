/**
 * Enhanced Error Handler with structured logging and error codes
 */
const errorHandler = (err, req, res, next) => {
    // Structured error logging
    const errorLog = {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userId: req.user?.id || 'guest',
        errorName: err.name,
        errorMessage: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    };

    console.error('❌ Error occurred:', JSON.stringify(errorLog, null, 2));

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let errorCode = err.code || 'INTERNAL_ERROR';
    let details = null;

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        statusCode = 404;
        message = 'Resource not found';
        errorCode = 'RESOURCE_NOT_FOUND';
    }

    // Sequelize validation error
    if (err.name === 'SequelizeValidationError') {
        statusCode = 400;
        message = 'Validation error';
        errorCode = 'VALIDATION_ERROR';
        details = err.errors.map(e => ({
            field: e.path,
            message: e.message,
            value: e.value
        }));
    }

    // Sequelize duplicate key error
    if (err.name === 'SequelizeUniqueConstraintError') {
        statusCode = 400;
        message = 'Duplicate entry detected';
        errorCode = 'DUPLICATE_ENTRY';
        details = err.errors.map(e => ({
            field: e.path,
            message: e.message
        }));
    }

    // Sequelize foreign key constraint error
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        statusCode = 400;
        message = 'Invalid reference to related resource';
        errorCode = 'FOREIGN_KEY_ERROR';
    }

    // Sequelize database connection error
    if (err.name === 'SequelizeConnectionError' || err.name === 'SequelizeConnectionRefusedError') {
        statusCode = 503;
        message = 'Database connection failed';
        errorCode = 'DB_CONNECTION_ERROR';
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid authentication token';
        errorCode = 'INVALID_TOKEN';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Authentication token has expired';
        errorCode = 'TOKEN_EXPIRED';
    }

    // Custom application errors
    if (err.isOperational) {
        statusCode = err.statusCode || 400;
        message = err.message;
        errorCode = err.code || 'OPERATIONAL_ERROR';
    }

    // Send structured error response
    const errorResponse = {
        success: false,
        error: {
            code: errorCode,
            message: message,
            ...(details && { details }),
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl
    };

    res.status(statusCode).json(errorResponse);
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Custom Application Error class
 */
class AppError extends Error {
    constructor(message, statusCode, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = { errorHandler, asyncHandler, AppError };
const express = require('express');
const {
    register,
    login,
    refreshTokenEndpoint,
    logout,
    forgotPassword,
    resetPassword,
    getProfile,
    updateProfile,
    changePassword,
    registerResident,
    registerStaff
} = require('../controllers/auth.controller');
const { authMiddleware, requireRole } = require('../middleware/auth');
const {
    validateResidentRegistration,
    validateStaffRegistration,
    validateLogin,
    validateForgotPassword,
    validateResetPassword,
    validateProfileUpdate,
    validateChangePassword,
    handleValidationErrors,
    sanitizeInput
} = require('../middleware/validation');
const {
    authLimiter,
    registerLimiter,
    passwordResetLimiter,
    generalLimiter
} = require('../middleware/rateLimiter');

const router = express.Router();

// Validation middleware
const validateRegistration = [
    body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
    body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
];

const validateLogin = [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
];

const validateForgotPassword = [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
];

const validateResetPassword = [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

const validateProfileUpdate = [
    body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
    body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
    body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
];

const validateChangePassword = [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
];

// Validation error handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation errors',
            errors: errors.array()
        });
    }
    next();
};

// Routes
router.post('/register', validateRegistration, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);
router.post('/refresh-token', refreshTokenEndpoint);
router.post('/logout', logout);
router.post('/forgot-password', validateForgotPassword, handleValidationErrors, forgotPassword);
router.post('/reset-password', validateResetPassword, handleValidationErrors, resetPassword);

// Protected routes
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, validateProfileUpdate, handleValidationErrors, updateProfile);
router.put('/change-password', authMiddleware, validateChangePassword, handleValidationErrors, changePassword);

module.exports = router;
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

// Apply sanitization to all routes
router.use(sanitizeInput);

// Public routes with rate limiting
router.post('/login',
    authLimiter,
    validateLogin,
    handleValidationErrors,
    login
);

router.post('/register/resident',
    registerLimiter,
    validateResidentRegistration,
    handleValidationErrors,
    registerResident
);

router.post('/register/staff',
    registerLimiter,
    authMiddleware,
    requireRole(['admin', 'building_manager']), // Only admin/manager can register staff
    validateStaffRegistration,
    handleValidationErrors,
    registerStaff
);

router.post('/refresh-token',
    generalLimiter,
    refreshTokenEndpoint
);

router.post('/logout',
    generalLimiter,
    logout
);

router.post('/forgot-password',
    passwordResetLimiter,
    validateForgotPassword,
    handleValidationErrors,
    forgotPassword
);

router.post('/reset-password',
    passwordResetLimiter,
    validateResetPassword,
    handleValidationErrors,
    resetPassword
);

// Protected routes
router.get('/profile',
    generalLimiter,
    authMiddleware,
    getProfile
);

router.put('/profile',
    generalLimiter,
    authMiddleware,
    validateProfileUpdate,
    handleValidationErrors,
    updateProfile
);

router.put('/change-password',
    authLimiter,
    authMiddleware,
    validateChangePassword,
    handleValidationErrors,
    changePassword
);

module.exports = router;
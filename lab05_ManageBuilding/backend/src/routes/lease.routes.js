const express = require('express');
const { body, query } = require('express-validator');
const {
    createLeaseRequest,
    listLeaseRequests,
    decideLeaseRequest,
    cancelLeaseRequest,
    ownerDecision
} = require('../controllers/lease.controller');
const { authMiddleware, optionalAuth, requireRole } = require('../middleware/auth');
const { generalLimiter, adminLimiter } = require('../middleware/rateLimiter');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

const validateCreate = [
    body('apartmentId').isInt().withMessage('apartmentId is required'),
    body('type').optional().isIn(['rent', 'buy']).withMessage('type must be rent or buy'),
    body('startDate').optional().isISO8601().withMessage('startDate must be a valid date'),
    body('endDate').optional().isISO8601().withMessage('endDate must be a valid date'),
    body('monthlyRent').optional().isFloat({ min: 0 }).withMessage('monthlyRent must be positive'),
    body('totalPrice').optional().isFloat({ min: 0 }).withMessage('totalPrice must be positive'),
    body('note').optional().isLength({ max: 500 }).withMessage('Note too long'),
    // Guest contact info validation
    body('contactName')
        .if((value, { req }) => !req.user || !req.user.id)
        .trim()
        .notEmpty().withMessage('Contact name is required for guest requests')
        .isLength({ min: 2, max: 100 }).withMessage('Contact name must be between 2 and 100 characters'),
    body('contactEmail')
        .if((value, { req }) => !req.user || !req.user.id)
        .trim()
        .notEmpty().withMessage('Contact email is required for guest requests')
        .isEmail().withMessage('Contact email must be a valid email address')
        .normalizeEmail(),
    body('contactPhone')
        .if((value, { req }) => !req.user || !req.user.id)
        .trim()
        .notEmpty().withMessage('Contact phone is required for guest requests')
        .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
        .withMessage('Contact phone must be a valid phone number'),
    handleValidationErrors
];

const validateList = [
    query('status').optional().isIn(['pending', 'approved', 'rejected', 'cancelled']),
    query('type').optional().isIn(['rent', 'buy']),
    query('apartmentId').optional().isInt(),
    query('requesterId').optional().isInt(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    handleValidationErrors
];

router.get('/',
    generalLimiter,
    authMiddleware,
    validateList,
    listLeaseRequests
);

router.post('/',
    generalLimiter,
    optionalAuth,
    validateCreate,
    createLeaseRequest
);

router.patch('/:id/decision',
    adminLimiter,
    authMiddleware,
    requireRole(['admin', 'building_manager']),
    body('decision').isIn(['approve', 'reject']).withMessage('decision must be approve or reject'),
    handleValidationErrors,
    decideLeaseRequest
);

router.patch('/:id/owner-decision',
    generalLimiter,
    authMiddleware,
    body('decision').isIn(['approve', 'reject']).withMessage('decision must be approve or reject'),
    handleValidationErrors,
    ownerDecision
);

router.patch('/:id/cancel',
    generalLimiter,
    authMiddleware,
    cancelLeaseRequest
);

module.exports = router;

const express = require('express');
const { body, query } = require('express-validator');
const {
    createLeaseRequest,
    listLeaseRequests,
    decideLeaseRequest,
    cancelLeaseRequest,
    ownerDecision
} = require('../controllers/lease.controller');
const { authMiddleware, requireRole } = require('../middleware/auth');
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
    authMiddleware,
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

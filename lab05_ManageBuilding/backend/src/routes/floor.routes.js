const express = require('express');
const { body } = require('express-validator');
const {
    getFloorsByBuilding,
    getFloorById,
    createFloor,
    updateFloor,
    deleteFloor
} = require('../controllers/floor.controller');
const {
    authMiddleware,
    optionalAuth,
    requireRole,
    managerMiddleware
} = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { generalLimiter, adminLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Floor validation
const validateFloor = [
    body('buildingId')
        .isInt()
        .withMessage('Building ID must be a valid integer'),
    body('floorNumber')
        .isInt({ min: 1, max: 100 })
        .withMessage('Floor number must be between 1 and 100'),
    body('totalApartments')
        .optional()
        .isInt({ min: 0, max: 50 })
        .withMessage('Total apartments must be between 0 and 50'),
    body('floorPlan')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Floor plan description must not exceed 500 characters'),
    handleValidationErrors
];

// Routes

/**
 * @route   GET /api/floors/:id
 * @desc    Get floor by ID
 * @access  Protected
 */
router.get('/:id',
    generalLimiter,
    optionalAuth,
    getFloorById
);

/**
 * @route   POST /api/floors
 * @desc    Create a new floor
 * @access  Protected - Admin or Building Manager
 */
router.post('/',
    adminLimiter,
    authMiddleware,
    requireRole(['admin', 'building_manager']),
    validateFloor,
    createFloor
);

/**
 * @route   PUT /api/floors/:id
 * @desc    Update a floor
 * @access  Protected - Admin or Building Manager
 */
router.put('/:id',
    adminLimiter,
    authMiddleware,
    requireRole(['admin', 'building_manager']),
    validateFloor,
    updateFloor
);

/**
 * @route   DELETE /api/floors/:id
 * @desc    Delete a floor
 * @access  Protected - Admin only
 */
router.delete('/:id',
    adminLimiter,
    authMiddleware,
    requireRole(['admin']),
    deleteFloor
);

module.exports = router;

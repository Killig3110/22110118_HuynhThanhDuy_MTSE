const express = require('express');
const { body } = require('express-validator');
const {
    getBlocks,
    getBlockById,
    getBuildingsByBlock,
    createBlock,
    updateBlock,
    deleteBlock
} = require('../controllers/block.controller');
const {
    authMiddleware,
    optionalAuth,
    requireRole,
    managerMiddleware
} = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { generalLimiter, adminLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Block validation
const validateBlock = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Block name must be between 2 and 100 characters'),
    body('blockCode')
        .trim()
        .matches(/^[A-Z]$/)
        .withMessage('Block code must be a single uppercase letter (e.g., S)'),
    body('location')
        .trim()
        .isLength({ min: 10, max: 200 })
        .withMessage('Location must be between 10 and 200 characters'),
    body('totalBuildings')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Total buildings must be between 1 and 50'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters'),
    handleValidationErrors
];

// Routes

/**
 * @route   GET /api/blocks
 * @desc    Get all blocks with pagination and filtering
 * @access  Protected
 */
router.get('/',
    generalLimiter,
    optionalAuth,
    getBlocks
);

/**
 * @route   GET /api/blocks/:id
 * @desc    Get block by ID
 * @access  Protected
 */
router.get('/:id',
    generalLimiter,
    optionalAuth,
    getBlockById
);

/**
 * @route   GET /api/blocks/:id/buildings
 * @desc    Get all buildings in a specific block
 * @access  Protected
 */
router.get('/:id/buildings',
    generalLimiter,
    optionalAuth,
    getBuildingsByBlock
);

/**
 * @route   POST /api/blocks
 * @desc    Create a new block
 * @access  Protected - Admin only
 */
router.post('/',
    adminLimiter,
    authMiddleware,
    requireRole(['admin']),
    validateBlock,
    createBlock
);

/**
 * @route   PUT /api/blocks/:id
 * @desc    Update a block
 * @access  Protected - Admin or Block Manager
 */
router.put('/:id',
    adminLimiter,
    authMiddleware,
    requireRole(['admin', 'building_manager']),
    validateBlock,
    updateBlock
);

/**
 * @route   DELETE /api/blocks/:id
 * @desc    Delete a block
 * @access  Protected - Admin only
 */
router.delete('/:id',
    adminLimiter,
    authMiddleware,
    requireRole(['admin']),
    deleteBlock
);

module.exports = router;

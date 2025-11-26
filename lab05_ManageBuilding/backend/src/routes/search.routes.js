const express = require('express');
const { query } = require('express-validator');
const { searchAll } = require('../controllers/search.controller');
const { authMiddleware } = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiter');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

const validateSearch = [
    query('q').optional().trim().isLength({ max: 200 }).withMessage('Search text is too long'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('types').optional().matches(/^[a-z,]+$/i).withMessage('Types must be a comma separated list'),
    query('blockId').optional().isInt().withMessage('blockId must be a number'),
    query('buildingId').optional().isInt().withMessage('buildingId must be a number'),
    query('floorId').optional().isInt().withMessage('floorId must be a number'),
    handleValidationErrors
];

/**
 * @route   GET /api/search
 * @desc    Search across blocks/buildings/floors/apartments/residents
 * @access  Protected
 */
router.get('/',
    generalLimiter,
    authMiddleware,
    validateSearch,
    searchAll
);

module.exports = router;

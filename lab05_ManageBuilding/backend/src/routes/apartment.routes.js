const express = require('express');
const { body, query } = require('express-validator');
const {
    searchApartments,
    getApartmentsByFloor,
    getApartmentById,
    createApartment,
    updateApartment,
    deleteApartment,
    getApartmentsByBuilding,
    getMyApartments,
    updateListing,
    updateStatus
} = require('../controllers/apartment.controller');
const {
    authMiddleware,
    optionalAuth,
    requireRole,
    managerMiddleware
} = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { generalLimiter, adminLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Apartment validation
const validateApartment = [
    body('floorId')
        .isInt()
        .withMessage('Floor ID must be a valid integer'),
    body('apartmentNumber')
        .trim()
        .matches(/^[0-9]{4}$/)
        .withMessage('Apartment number must be 4 digits (e.g., 0101)'),
    body('type')
        .isIn(['1bhk', '2bhk', '3bhk', '4bhk', 'studio', 'penthouse'])
        .withMessage('Type must be one of: 1bhk, 2bhk, 3bhk, 4bhk, studio, penthouse'),
    body('area')
        .isFloat({ min: 20, max: 500 })
        .withMessage('Area must be between 20 and 500 square meters'),
    body('bedrooms')
        .isInt({ min: 0, max: 10 })
        .withMessage('Bedrooms must be between 0 and 10'),
    body('bathrooms')
        .isInt({ min: 1, max: 5 })
        .withMessage('Bathrooms must be between 1 and 5'),
    body('balconies')
        .optional()
        .isInt({ min: 0, max: 5 })
        .withMessage('Balconies must be between 0 and 5'),
    body('parkingSlots')
        .optional()
        .isInt({ min: 0, max: 3 })
        .withMessage('Parking slots must be between 0 and 3'),
    body('monthlyRent')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Monthly rent must be a positive number'),
    body('maintenanceFee')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Maintenance fee must be a positive number'),
    body('status')
        .optional()
        .isIn(['vacant', 'occupied', 'maintenance', 'reserved'])
        .withMessage('Status must be one of: vacant, occupied, maintenance, reserved'),
    handleValidationErrors
];

// Search filters validation
const validateSearchFilters = [
    query('q').optional().trim().isLength({ max: 100 }).withMessage('Search term is too long'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be >= 1'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('buildingId').optional().isInt().withMessage('Building ID must be a number'),
    query('blockId').optional().isInt().withMessage('Block ID must be a number'),
    query('floorId').optional().isInt().withMessage('Floor ID must be a number'),
    query('minArea').optional().isFloat({ min: 0 }).withMessage('Min area must be positive'),
    query('maxArea').optional().isFloat({ min: 0 }).withMessage('Max area must be positive'),
    query('minRent').optional().isFloat({ min: 0 }).withMessage('Min rent must be positive'),
    query('maxRent').optional().isFloat({ min: 0 }).withMessage('Max rent must be positive'),
    query('bedrooms').optional().isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer'),
    query('bathrooms').optional().isInt({ min: 0 }).withMessage('Bathrooms must be a non-negative integer'),
    query('hasParking').optional().isIn(['true', 'false']).withMessage('hasParking must be true or false'),
    query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be positive'),
    query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be positive'),
    query('isListedForRent').optional().isIn(['true', 'false']).withMessage('isListedForRent must be boolean'),
    query('isListedForSale').optional().isIn(['true', 'false']).withMessage('isListedForSale must be boolean'),
    query('sortBy').optional().isIn(['apartmentNumber', 'monthlyRent', 'area', 'bedrooms', 'bathrooms', 'createdAt', 'updatedAt'])
        .withMessage('Invalid sortBy value'),
    query('sortOrder').optional().isIn(['ASC', 'DESC', 'asc', 'desc'])
        .withMessage('Invalid sortOrder value'),
    handleValidationErrors
];

// Routes

/**
 * @route   GET /api/apartments/search
 * @desc    Fuzzy search + filter apartments
 * @access  Protected
 */
router.get('/search',
    generalLimiter,
    optionalAuth,
    validateSearchFilters,
    searchApartments
);

/**
 * @route   GET /api/apartments/my-apartments
 * @desc    Get apartments owned or rented by current user
 * @access  Protected
 */
router.get('/my-apartments',
    generalLimiter,
    authMiddleware,
    getMyApartments
);

/**
 * @route   GET /api/apartments/:id
 * @desc    Get apartment by ID
 * @access  Public (optional auth)
 */
router.get('/:id',
    generalLimiter,
    optionalAuth,
    getApartmentById
);

/**
 * @route   POST /api/apartments
 * @desc    Create a new apartment
 * @access  Protected - Admin or Building Manager
 */
router.post('/',
    adminLimiter,
    authMiddleware,
    requireRole(['admin', 'building_manager']),
    validateApartment,
    createApartment
);

/**
 * @route   PUT /api/apartments/:id
 * @desc    Update an apartment
 * @access  Protected - Admin or Building Manager
 */
router.put('/:id',
    adminLimiter,
    authMiddleware,
    requireRole(['admin', 'building_manager']),
    validateApartment,
    updateApartment
);

/**
 * @route   DELETE /api/apartments/:id
 * @desc    Delete an apartment
 * @access  Protected - Admin only
 */
router.delete('/:id',
    adminLimiter,
    authMiddleware,
    requireRole(['admin']),
    deleteApartment
);

/**
 * @route   PATCH /api/apartments/:id/listing
 * @desc    Update listing status (owner only)
 * @access  Protected - Owner
 */
router.patch('/:id/listing',
    generalLimiter,
    authMiddleware,
    [
        body('isListedForRent').optional().isBoolean(),
        body('isListedForSale').optional().isBoolean(),
        handleValidationErrors
    ],
    updateListing
);

/**
 * @route   PATCH /api/apartments/:id/status
 * @desc    Update apartment status (owner only)
 * @access  Protected - Owner
 */
router.patch('/:id/status',
    generalLimiter,
    authMiddleware,
    [
        body('status').isIn(['vacant', 'occupied', 'under_renovation']),
        handleValidationErrors
    ],
    updateStatus
);

module.exports = router;

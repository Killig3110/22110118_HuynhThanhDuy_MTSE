const express = require('express');
const { body } = require('express-validator');
const {
    getApartmentsByFloor,
    getApartmentById,
    createApartment,
    updateApartment,
    deleteApartment,
    getApartmentsByBuilding
} = require('../controllers/apartment.controller');
const {
    authMiddleware,
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

// Routes

/**
 * @route   GET /api/apartments/:id
 * @desc    Get apartment by ID
 * @access  Protected
 */
router.get('/:id',
    generalLimiter,
    authMiddleware,
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

module.exports = router;
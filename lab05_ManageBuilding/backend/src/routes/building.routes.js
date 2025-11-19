const express = require('express');
const { body } = require('express-validator');
const {
    getBuildings,
    getBuildingById,
    getFloorsByBuilding,
    getApartmentsByFloor,
    createBuilding,
    updateBuilding,
    deleteBuilding
} = require('../controllers/building.controller');
const { 
    authMiddleware, 
    requireRole, 
    managerMiddleware,
    requireBuildingAccess 
} = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { generalLimiter, adminLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Building validation
const validateBuilding = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Building name must be between 2 and 100 characters'),
    body('buildingCode')
        .trim()
        .matches(/^[A-Z]\.[0-9]{2}$/)
        .withMessage('Building code must be in format X.XX (e.g., S.01)'),
    body('blockId')
        .isInt()
        .withMessage('Block ID must be a valid integer'),
    body('address')
        .trim()
        .isLength({ min: 10, max: 200 })
        .withMessage('Address must be between 10 and 200 characters'),
    body('city')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('City must be between 2 and 50 characters'),
    body('totalFloors')
        .isInt({ min: 1, max: 100 })
        .withMessage('Total floors must be between 1 and 100'),
    body('constructionYear')
        .optional()
        .isInt({ min: 1900, max: new Date().getFullYear() + 10 })
        .withMessage('Construction year must be valid'),
    body('managerId')
        .optional()
        .isInt()
        .withMessage('Manager ID must be a valid integer'),
];

const validateBuildingUpdate = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Building name must be between 2 and 100 characters'),
    body('buildingCode')
        .optional()
        .trim()
        .matches(/^[A-Z]\.[0-9]{2}$/)
        .withMessage('Building code must be in format X.XX (e.g., S.01)'),
    body('address')
        .optional()
        .trim()
        .isLength({ min: 10, max: 200 })
        .withMessage('Address must be between 10 and 200 characters'),
    body('totalFloors')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Total floors must be between 1 and 100'),
];

// Public routes (with authentication)
router.get('/', 
    generalLimiter,
    authMiddleware,
    getBuildings
);

router.get('/:id', 
    generalLimiter,
    authMiddleware,
    requireBuildingAccess,
    getBuildingById
);

router.get('/:buildingId/floors', 
    generalLimiter,
    authMiddleware,
    requireBuildingAccess,
    getFloorsByBuilding
);

router.get('/floors/:floorId/apartments', 
    generalLimiter,
    authMiddleware,
    getApartmentsByFloor
);

// Admin/Manager only routes
router.post('/', 
    adminLimiter,
    authMiddleware,
    managerMiddleware,
    validateBuilding,
    handleValidationErrors,
    createBuilding
);

router.put('/:id', 
    adminLimiter,
    authMiddleware,
    managerMiddleware,
    validateBuildingUpdate,
    handleValidationErrors,
    updateBuilding
);

router.delete('/:id', 
    adminLimiter,
    authMiddleware,
    requireRole(['admin']), // Only admin can delete buildings
    deleteBuilding
);

module.exports = router;
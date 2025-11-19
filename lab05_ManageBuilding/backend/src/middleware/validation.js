const { body, validationResult } = require('express-validator');
const { User, Role, Position } = require('../models');

// Common validation rules
const validateEmail = body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
    .custom(async (email, { req }) => {
        // Check if email exists for registration only
        if (req.route.path === '/register') {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                throw new Error('Email already in use');
            }
        }
        return true;
    });

const validatePassword = body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number and one special character');

const validatePhone = body('phone')
    .optional()
    .isMobilePhone('vi-VN')
    .withMessage('Please provide a valid Vietnamese phone number');

const validateName = (field) => body(field)
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage(`${field.charAt(0).toUpperCase() + field.slice(1)} must be between 2 and 50 characters`)
    .matches(/^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u)
    .withMessage(`${field.charAt(0).toUpperCase() + field.slice(1)} can only contain letters, spaces, and common punctuation`);

// Building Management specific validation
const validateApartmentNumber = body('apartmentNumber')
    .optional()
    .matches(/^\d{4}$/)
    .withMessage('Apartment number must be 4 digits (e.g., 0101)');

const validateRole = body('roleId')
    .optional()
    .isInt()
    .withMessage('Role ID must be a valid integer')
    .custom(async (roleId) => {
        if (roleId) {
            const role = await Role.findByPk(roleId);
            if (!role || !role.isActive) {
                throw new Error('Invalid role selected');
            }
        }
        return true;
    });

const validatePosition = body('positionId')
    .optional()
    .isInt()
    .withMessage('Position ID must be a valid integer')
    .custom(async (positionId) => {
        if (positionId) {
            const position = await Position.findByPk(positionId);
            if (!position || !position.isActive) {
                throw new Error('Invalid position selected');
            }
        }
        return true;
    });

const validateDateOfBirth = body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date')
    .custom((value) => {
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();

        if (age < 18 || age > 120) {
            throw new Error('Age must be between 18 and 120 years');
        }
        return true;
    });

const validateGender = body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other');

const validateEmergencyContact = body('emergencyContact')
    .optional()
    .isMobilePhone('vi-VN')
    .withMessage('Emergency contact must be a valid Vietnamese phone number');

// Validation groups for different registration types
const validateResidentRegistration = [
    validateName('firstName'),
    validateName('lastName'),
    validateEmail,
    validatePassword,
    validatePhone,
    validateDateOfBirth,
    validateGender,
    validateEmergencyContact,
    body('idProofType')
        .optional()
        .isIn(['national_id', 'passport', 'driver_license'])
        .withMessage('ID proof type must be national_id, passport, or driver_license'),
    body('idProofNumber')
        .optional()
        .trim()
        .isLength({ min: 8, max: 20 })
        .withMessage('ID proof number must be between 8 and 20 characters'),
    body('occupation')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Occupation must be between 2 and 100 characters'),
];

const validateStaffRegistration = [
    validateName('firstName'),
    validateName('lastName'),
    validateEmail,
    validatePassword,
    validatePhone,
    validateRole,
    validatePosition,
    validateDateOfBirth,
    body('employeeId')
        .optional()
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage('Employee ID must be between 3 and 20 characters'),
    body('department')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Department must be between 2 and 50 characters'),
    body('hireDate')
        .optional()
        .isISO8601()
        .withMessage('Hire date must be a valid date'),
];

// Standard validations
const validateLogin = [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
];

const validateForgotPassword = [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
];

const validateResetPassword = [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number and one special character'),
];

const validateProfileUpdate = [
    validateName('firstName'),
    validateName('lastName'),
    validatePhone,
    validateDateOfBirth,
    validateGender,
    validateEmergencyContact,
    body('address')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Address must not exceed 200 characters'),
];

const validateChangePassword = [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('New password must contain at least one lowercase letter, one uppercase letter, one number and one special character'),
];

// Error handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation errors',
            errors: errors.array().map(error => ({
                field: error.param || error.path,
                message: error.msg,
                value: error.value
            }))
        });
    }
    next();
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
    // Recursively sanitize all string inputs
    const sanitizeObject = (obj) => {
        if (typeof obj !== 'object' || obj === null) return obj;

        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                // Remove potential XSS attacks
                obj[key] = obj[key]
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/javascript:/gi, '')
                    .replace(/vbscript:/gi, '')
                    .replace(/onload|onerror|onclick|onmouseover/gi, '');
            } else if (typeof obj[key] === 'object') {
                sanitizeObject(obj[key]);
            }
        }
    };

    sanitizeObject(req.body);
    sanitizeObject(req.query);
    sanitizeObject(req.params);

    next();
};

module.exports = {
    validateResidentRegistration,
    validateStaffRegistration,
    validateLogin,
    validateForgotPassword,
    validateResetPassword,
    validateProfileUpdate,
    validateChangePassword,
    handleValidationErrors,
    sanitizeInput
};
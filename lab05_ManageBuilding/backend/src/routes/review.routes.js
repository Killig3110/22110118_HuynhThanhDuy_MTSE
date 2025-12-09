const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const reviewController = require('../controllers/review.controller');

// Validation middleware for review creation/update
const reviewValidation = [
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
    body('comment')
        .optional()
        .isLength({ min: 0, max: 2000 })
        .withMessage('Comment must not exceed 2000 characters')
];

// Create review for an apartment (authenticated, tenant/owner only)
router.post(
    '/apartments/:apartmentId/reviews',
    authMiddleware,
    reviewValidation,
    reviewController.createReview
);

// Update own review
router.put(
    '/reviews/:reviewId',
    authMiddleware,
    reviewValidation,
    reviewController.updateReview
);

// Delete own review
router.delete(
    '/reviews/:reviewId',
    authMiddleware,
    reviewController.deleteReview
);

// Get reviews for an apartment (public)
router.get(
    '/apartments/:apartmentId/reviews',
    reviewController.getApartmentReviews
);

// Get current user's reviews
router.get(
    '/my-reviews',
    authMiddleware,
    reviewController.getUserReviews
);

module.exports = router;

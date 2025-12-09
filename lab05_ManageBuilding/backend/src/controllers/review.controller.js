const { ApartmentReview, Apartment, User, HouseholdMember } = require('../models');
const { validationResult } = require('express-validator');

// Create review (only for tenants/owners)
const createReview = async (req, res) => {
    try {
        // Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const userId = req.user.id;
        const apartmentId = parseInt(req.params.apartmentId);
        const { rating, comment } = req.body;

        // Check if apartment exists
        const apartment = await Apartment.findByPk(apartmentId);
        if (!apartment) {
            return res.status(404).json({
                success: false,
                message: 'Apartment not found'
            });
        }

        // Check if user is tenant or owner of this apartment
        const householdMember = await HouseholdMember.findOne({
            where: {
                apartmentId,
                email: req.user.email,
                isActive: true
            }
        });

        if (!householdMember) {
            return res.status(403).json({
                success: false,
                message: 'Only tenants or owners can review this apartment'
            });
        }

        // Check if user already reviewed
        const existingReview = await ApartmentReview.findOne({
            where: { userId, apartmentId }
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this apartment. Use update instead.'
            });
        }

        // Create review
        const review = await ApartmentReview.create({
            userId,
            apartmentId,
            rating,
            comment
        });

        res.status(201).json({
            success: true,
            message: 'Review created successfully',
            data: review
        });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create review',
            error: error.message
        });
    }
};

// Update own review
const updateReview = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const userId = req.user.id;
        const reviewId = parseInt(req.params.reviewId);
        const { rating, comment } = req.body;

        const review = await ApartmentReview.findByPk(reviewId);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check ownership
        if (review.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own reviews'
            });
        }

        // Update review
        await review.update({ rating, comment });

        res.status(200).json({
            success: true,
            message: 'Review updated successfully',
            data: review
        });
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update review',
            error: error.message
        });
    }
};

// Delete own review
const deleteReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const reviewId = parseInt(req.params.reviewId);

        const review = await ApartmentReview.findByPk(reviewId);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check ownership
        if (review.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own reviews'
            });
        }

        await review.destroy();

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete review',
            error: error.message
        });
    }
};

// Get reviews for an apartment (public)
const getApartmentReviews = async (req, res) => {
    try {
        const apartmentId = parseInt(req.params.apartmentId);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows: reviews } = await ApartmentReview.findAndCountAll({
            where: { apartmentId },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'avatar']
                }
            ],
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        // Calculate average rating
        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        res.status(200).json({
            success: true,
            data: {
                reviews,
                avgRating: parseFloat(avgRating.toFixed(1)),
                totalReviews: count
            },
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        console.error('Error getting apartment reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get reviews',
            error: error.message
        });
    }
};

// Get user's own reviews
const getUserReviews = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows: reviews } = await ApartmentReview.findAndCountAll({
            where: { userId },
            include: [
                {
                    model: Apartment,
                    as: 'apartment',
                    attributes: ['id', 'apartmentNumber', 'type', 'images']
                }
            ],
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: reviews,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        console.error('Error getting user reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get your reviews',
            error: error.message
        });
    }
};

module.exports = {
    createReview,
    updateReview,
    deleteReview,
    getApartmentReviews,
    getUserReviews
};

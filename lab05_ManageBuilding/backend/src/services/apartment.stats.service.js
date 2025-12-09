const { HouseholdMember, ApartmentReview, ApartmentView, ApartmentFavorite } = require('../models');
const { fn, col } = require('sequelize');

/**
 * Get comprehensive statistics for an apartment
 * @param {number} apartmentId - Apartment ID
 * @returns {Promise<Object>} Statistics object with counts and ratings
 */
const getApartmentStats = async (apartmentId) => {
    try {
        // Count buyers (household members who are tenants or owners)
        const buyerCount = await HouseholdMember.count({
            where: {
                apartmentId,
                isActive: true
            }
        });

        // Get review statistics
        const reviewStats = await ApartmentReview.findOne({
            where: { apartmentId },
            attributes: [
                [fn('COUNT', col('id')), 'reviewCount'],
                [fn('AVG', col('rating')), 'avgRating']
            ],
            raw: true
        });

        const reviewCount = parseInt(reviewStats?.reviewCount || 0);
        const avgRating = reviewStats?.avgRating ? parseFloat(reviewStats.avgRating).toFixed(1) : 0;

        // Count total views
        const viewCount = await ApartmentView.count({
            where: { apartmentId }
        });

        // Count favorites
        const favoriteCount = await ApartmentFavorite.count({
            where: { apartmentId }
        });

        return {
            apartmentId,
            buyerCount,
            reviewCount,
            avgRating: parseFloat(avgRating),
            viewCount,
            favoriteCount
        };
    } catch (error) {
        console.error('Error getting apartment stats:', error);
        throw error;
    }
};

/**
 * Get statistics for multiple apartments (batch)
 * @param {Array<number>} apartmentIds - Array of apartment IDs
 * @returns {Promise<Object>} Map of apartmentId to stats
 */
const getBatchApartmentStats = async (apartmentIds) => {
    try {
        const statsMap = {};

        // Get buyer counts
        const buyerCounts = await HouseholdMember.findAll({
            where: {
                apartmentId: apartmentIds,
                isActive: true
            },
            attributes: [
                'apartmentId',
                [fn('COUNT', col('id')), 'count']
            ],
            group: ['apartmentId'],
            raw: true
        });

        // Get review stats
        const reviewStats = await ApartmentReview.findAll({
            where: { apartmentId: apartmentIds },
            attributes: [
                'apartmentId',
                [fn('COUNT', col('id')), 'reviewCount'],
                [fn('AVG', col('rating')), 'avgRating']
            ],
            group: ['apartmentId'],
            raw: true
        });

        // Get view counts
        const viewCounts = await ApartmentView.findAll({
            where: { apartmentId: apartmentIds },
            attributes: [
                'apartmentId',
                [fn('COUNT', col('id')), 'count']
            ],
            group: ['apartmentId'],
            raw: true
        });

        // Get favorite counts
        const favoriteCounts = await ApartmentFavorite.findAll({
            where: { apartmentId: apartmentIds },
            attributes: [
                'apartmentId',
                [fn('COUNT', col('id')), 'count']
            ],
            group: ['apartmentId'],
            raw: true
        });

        // Initialize stats for all apartments
        apartmentIds.forEach(id => {
            statsMap[id] = {
                apartmentId: id,
                buyerCount: 0,
                reviewCount: 0,
                avgRating: 0,
                viewCount: 0,
                favoriteCount: 0
            };
        });

        // Populate stats
        buyerCounts.forEach(item => {
            statsMap[item.apartmentId].buyerCount = parseInt(item.count);
        });

        reviewStats.forEach(item => {
            statsMap[item.apartmentId].reviewCount = parseInt(item.reviewCount);
            statsMap[item.apartmentId].avgRating = parseFloat(item.avgRating).toFixed(1);
        });

        viewCounts.forEach(item => {
            statsMap[item.apartmentId].viewCount = parseInt(item.count);
        });

        favoriteCounts.forEach(item => {
            statsMap[item.apartmentId].favoriteCount = parseInt(item.count);
        });

        return statsMap;
    } catch (error) {
        console.error('Error getting batch apartment stats:', error);
        throw error;
    }
};

module.exports = {
    getApartmentStats,
    getBatchApartmentStats
};

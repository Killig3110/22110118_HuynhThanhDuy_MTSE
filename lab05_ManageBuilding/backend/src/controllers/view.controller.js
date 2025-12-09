const { ApartmentView, Apartment, Floor, Building, Block, User } = require('../models');
const { Op } = require('sequelize');

// Track apartment view
const trackView = async (req, res) => {
    try {
        const apartmentId = parseInt(req.params.apartmentId);
        const userId = req.user?.id || null;
        const ipAddress = req.ip || req.connection.remoteAddress;

        // Check if apartment exists
        const apartment = await Apartment.findByPk(apartmentId);
        if (!apartment) {
            return res.status(404).json({
                success: false,
                message: 'Apartment not found'
            });
        }

        // Deduplicate views within 1 hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        const existingView = await ApartmentView.findOne({
            where: {
                apartmentId,
                ...(userId ? { userId } : { ipAddress, userId: null }),
                viewedAt: {
                    [Op.gte]: oneHourAgo
                }
            }
        });

        if (existingView) {
            // Update viewedAt to current time
            await existingView.update({ viewedAt: new Date() });
            return res.status(200).json({
                success: true,
                message: 'View updated',
                viewId: existingView.id
            });
        }

        // Create new view record
        const view = await ApartmentView.create({
            userId,
            apartmentId,
            ipAddress: userId ? null : ipAddress,
            viewedAt: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'View tracked',
            viewId: view.id
        });
    } catch (error) {
        console.error('Error tracking view:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track view',
            error: error.message
        });
    }
};

// Get recently viewed apartments for user
const getRecentlyViewed = async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 20;

        const views = await ApartmentView.findAll({
            where: { userId },
            include: [
                {
                    model: Apartment,
                    as: 'apartment',
                    include: [
                        {
                            model: Floor,
                            as: 'floor',
                            attributes: ['id', 'floorNumber'],
                            include: [
                                {
                                    model: Building,
                                    as: 'building',
                                    attributes: ['id', 'name', 'address'],
                                    include: [
                                        {
                                            model: Block,
                                            as: 'block',
                                            attributes: ['id', 'name']
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            limit,
            order: [['viewedAt', 'DESC']],
            distinct: true
        });

        // Format response
        const formattedViews = views.map(view => ({
            viewedAt: view.viewedAt,
            apartment: view.apartment ? {
                id: view.apartment.id,
                code: view.apartment.apartmentNumber,
                type: view.apartment.type,
                area: parseFloat(view.apartment.area),
                bedrooms: view.apartment.bedrooms,
                bathrooms: view.apartment.bathrooms,
                price: view.apartment.isListedForSale ? parseFloat(view.apartment.salePrice) : parseFloat(view.apartment.monthlyRent),
                mode: view.apartment.isListedForSale ? 'buy' : 'rent',
                status: view.apartment.status,
                images: view.apartment.images || [],
                block: view.apartment.floor?.building?.block?.name || 'N/A',
                building: view.apartment.floor?.building?.name || 'N/A',
                floor: view.apartment.floor?.floorNumber || 'N/A'
            } : null
        }));

        res.status(200).json({
            success: true,
            data: formattedViews
        });
    } catch (error) {
        console.error('Error getting recently viewed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get recently viewed apartments',
            error: error.message
        });
    }
};

// Get view count for an apartment
const getViewStats = async (req, res) => {
    try {
        const apartmentId = parseInt(req.params.apartmentId);

        const count = await ApartmentView.count({
            where: { apartmentId }
        });

        res.status(200).json({
            success: true,
            apartmentId,
            viewCount: count
        });
    } catch (error) {
        console.error('Error getting view stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get view statistics',
            error: error.message
        });
    }
};

module.exports = {
    trackView,
    getRecentlyViewed,
    getViewStats
};

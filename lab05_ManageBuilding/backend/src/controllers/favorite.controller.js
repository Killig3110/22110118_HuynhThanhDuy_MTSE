const { ApartmentFavorite, Apartment, Floor, Building, Block } = require('../models');

// Add apartment to favorites
const addFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const apartmentId = parseInt(req.params.apartmentId);

        // Check if apartment exists
        const apartment = await Apartment.findByPk(apartmentId);
        if (!apartment) {
            return res.status(404).json({
                success: false,
                message: 'Apartment not found'
            });
        }

        // Check if already favorited
        const existing = await ApartmentFavorite.findOne({
            where: { userId, apartmentId }
        });

        if (existing) {
            return res.status(200).json({
                success: true,
                message: 'Apartment already in favorites',
                isFavorite: true
            });
        }

        // Create favorite
        await ApartmentFavorite.create({ userId, apartmentId });

        res.status(201).json({
            success: true,
            message: 'Added to favorites',
            isFavorite: true
        });
    } catch (error) {
        console.error('Error adding favorite:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add favorite',
            error: error.message
        });
    }
};

// Remove apartment from favorites
const removeFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const apartmentId = parseInt(req.params.apartmentId);

        const deleted = await ApartmentFavorite.destroy({
            where: { userId, apartmentId }
        });

        if (deleted === 0) {
            return res.status(404).json({
                success: false,
                message: 'Favorite not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Removed from favorites',
            isFavorite: false
        });
    } catch (error) {
        console.error('Error removing favorite:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove favorite',
            error: error.message
        });
    }
};

// Get all favorites for current user
const getFavorites = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const { count, rows: favorites } = await ApartmentFavorite.findAndCountAll({
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
            offset,
            order: [['createdAt', 'DESC']]
        });

        // Format response
        const formattedFavorites = favorites.map(fav => ({
            id: fav.id,
            apartmentId: fav.apartmentId,
            addedAt: fav.createdAt,
            apartment: fav.apartment ? {
                id: fav.apartment.id,
                code: fav.apartment.apartmentNumber,
                type: fav.apartment.type,
                area: parseFloat(fav.apartment.area),
                bedrooms: fav.apartment.bedrooms,
                bathrooms: fav.apartment.bathrooms,
                price: fav.apartment.isListedForSale ? parseFloat(fav.apartment.salePrice) : parseFloat(fav.apartment.monthlyRent),
                mode: fav.apartment.isListedForSale ? 'buy' : 'rent',
                status: fav.apartment.status,
                images: fav.apartment.images || [],
                block: fav.apartment.floor?.building?.block?.name || 'N/A',
                building: fav.apartment.floor?.building?.name || 'N/A',
                floor: fav.apartment.floor?.floorNumber || 'N/A'
            } : null
        }));

        res.status(200).json({
            success: true,
            data: formattedFavorites,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        console.error('Error getting favorites:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get favorites',
            error: error.message
        });
    }
};

// Check if apartment is favorited
const checkFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const apartmentId = parseInt(req.params.apartmentId);

        const favorite = await ApartmentFavorite.findOne({
            where: { userId, apartmentId }
        });

        res.status(200).json({
            success: true,
            isFavorite: !!favorite
        });
    } catch (error) {
        console.error('Error checking favorite:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check favorite status',
            error: error.message
        });
    }
};

module.exports = {
    addFavorite,
    removeFavorite,
    getFavorites,
    checkFavorite
};

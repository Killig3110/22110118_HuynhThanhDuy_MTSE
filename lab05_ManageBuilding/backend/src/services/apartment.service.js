const { Apartment, Floor, Building, Block } = require('../models');
const { Op } = require('sequelize');

/**
 * Find similar apartments based on type, bedrooms, area, and price
 * @param {number} apartmentId - Current apartment ID to exclude
 * @param {number} limit - Maximum number of results (default: 6)
 * @returns {Promise<Array>} Array of similar apartments
 */
const getSimilarApartments = async (apartmentId, limit = 6) => {
    try {
        // Get the current apartment details
        const currentApartment = await Apartment.findByPk(apartmentId);
        if (!currentApartment) {
            throw new Error('Apartment not found');
        }

        const area = parseFloat(currentApartment.area);
        const areaMin = area * 0.8;  // -20%
        const areaMax = area * 1.2;  // +20%

        // Determine price and calculate range
        const price = currentApartment.isListedForSale
            ? parseFloat(currentApartment.salePrice)
            : parseFloat(currentApartment.monthlyRent);

        const priceMin = price * 0.7;  // -30%
        const priceMax = price * 1.3;  // +30%

        // Build where conditions for similar apartments
        const whereConditions = {
            id: { [Op.ne]: apartmentId },  // Exclude current apartment
            status: { [Op.in]: ['for_rent', 'for_sale'] },  // Only available apartments
            [Op.or]: [
                { type: currentApartment.type },  // Same type
                { bedrooms: currentApartment.bedrooms }  // OR same bedrooms
            ],
            area: {
                [Op.between]: [areaMin, areaMax]
            }
        };

        // Add price condition based on listing type
        if (currentApartment.isListedForSale) {
            whereConditions.isListedForSale = true;
            whereConditions.salePrice = {
                [Op.between]: [priceMin, priceMax]
            };
        } else {
            whereConditions.isListedForRent = true;
            whereConditions.monthlyRent = {
                [Op.between]: [priceMin, priceMax]
            };
        }

        // Find similar apartments
        const similarApartments = await Apartment.findAll({
            where: whereConditions,
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
            ],
            limit: limit * 2,  // Get more to allow filtering
            order: [
                // Prioritize same building
                [
                    {
                        model: Floor,
                        as: 'floor'
                    },
                    {
                        model: Building,
                        as: 'building'
                    },
                    'id',
                    currentApartment.floor?.buildingId ? 'DESC' : 'ASC'
                ],
                ['createdAt', 'DESC']
            ]
        });

        // Format and limit results
        const formattedApartments = similarApartments.slice(0, limit).map(apt => ({
            id: apt.id,
            code: apt.apartmentNumber,
            type: apt.type,
            area: parseFloat(apt.area),
            bedrooms: apt.bedrooms,
            bathrooms: apt.bathrooms,
            price: apt.isListedForSale ? parseFloat(apt.salePrice) : parseFloat(apt.monthlyRent),
            mode: apt.isListedForSale ? 'buy' : 'rent',
            status: apt.status,
            images: apt.images || [],
            block: apt.floor?.building?.block?.name || 'N/A',
            building: apt.floor?.building?.name || 'N/A',
            floor: apt.floor?.floorNumber || 'N/A'
        }));

        return formattedApartments;
    } catch (error) {
        console.error('Error getting similar apartments:', error);
        throw error;
    }
};

module.exports = {
    getSimilarApartments
};

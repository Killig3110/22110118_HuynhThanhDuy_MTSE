const { Op } = require('sequelize');
const { Apartment, Floor, Building, HouseholdMember } = require('../models');

/**
 * Get apartments by floor ID
 */
const getApartmentsByFloor = async (req, res) => {
    try {
        const { floorId } = req.params;
        const {
            page = 1,
            limit = 50,
            sortBy = 'apartmentNumber',
            sortOrder = 'ASC',
            status
        } = req.query;

        // Validate floor exists
        const floor = await Floor.findByPk(floorId);
        if (!floor) {
            return res.status(404).json({
                success: false,
                message: 'Floor not found'
            });
        }

        // Validate sort parameters
        const allowedSortFields = ['apartmentNumber', 'type', 'area', 'bedrooms', 'bathrooms', 'monthlyRent', 'status'];
        const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'apartmentNumber';
        const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase())
            ? sortOrder.toUpperCase()
            : 'ASC';

        const offset = (page - 1) * limit;

        // Build where clause
        let whereClause = {
            floorId,
            isActive: true
        };

        if (status) {
            whereClause.status = status;
        }

        const { count, rows: apartments } = await Apartment.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Floor,
                    as: 'floor',
                    attributes: ['id', 'floorNumber'],
                    include: [{
                        model: Building,
                        as: 'building',
                        attributes: ['id', 'name', 'buildingCode']
                    }]
                }
            ],
            order: [[validSortBy, validSortOrder]],
            limit: parseInt(limit),
            offset,
            distinct: true
        });

        const totalPages = Math.ceil(count / limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        res.status(200).json({
            success: true,
            message: 'Apartments retrieved successfully',
            data: apartments,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems: count,
                itemsPerPage: parseInt(limit),
                hasNext,
                hasPrev
            }
        });
    } catch (error) {
        console.error('Error fetching apartments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch apartments',
            error: error.message
        });
    }
};

/**
 * Get apartment by ID
 */
const getApartmentById = async (req, res) => {
    try {
        const { id } = req.params;

        const apartment = await Apartment.findOne({
            where: {
                id,
                isActive: true
            },
            include: [
                {
                    model: Floor,
                    as: 'floor',
                    attributes: ['id', 'floorNumber'],
                    include: [{
                        model: Building,
                        as: 'building',
                        attributes: ['id', 'name', 'buildingCode']
                    }]
                }
            ]
        });

        if (!apartment) {
            return res.status(404).json({
                success: false,
                message: 'Apartment not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Apartment retrieved successfully',
            data: apartment
        });
    } catch (error) {
        console.error('Error fetching apartment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch apartment',
            error: error.message
        });
    }
};

/**
 * Get apartments by building ID (for overview)
 */
const getApartmentsByBuilding = async (req, res) => {
    try {
        const { buildingId } = req.params;
        const {
            page = 1,
            limit = 100,
            status,
            type,
            sortBy = 'apartmentNumber',
            sortOrder = 'ASC'
        } = req.query;

        // Validate building exists
        const building = await Building.findByPk(buildingId);
        if (!building) {
            return res.status(404).json({
                success: false,
                message: 'Building not found'
            });
        }

        const offset = (page - 1) * limit;

        // Build where clause
        let whereClause = { isActive: true };
        if (status) whereClause.status = status;
        if (type) whereClause.type = type;

        const { count, rows: apartments } = await Apartment.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Floor,
                    as: 'floor',
                    where: { buildingId },
                    attributes: ['id', 'floorNumber']
                }
            ],
            order: [[{ model: Floor, as: 'floor' }, 'floorNumber', 'ASC'], [sortBy, sortOrder]],
            limit: parseInt(limit),
            offset,
            distinct: true
        });

        const totalPages = Math.ceil(count / limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        res.status(200).json({
            success: true,
            message: 'Apartments retrieved successfully',
            data: apartments,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems: count,
                itemsPerPage: parseInt(limit),
                hasNext,
                hasPrev
            }
        });
    } catch (error) {
        console.error('Error fetching apartments by building:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch apartments',
            error: error.message
        });
    }
};

/**
 * Create a new apartment
 */
const createApartment = async (req, res) => {
    try {
        const {
            floorId,
            apartmentNumber,
            type,
            area,
            bedrooms,
            bathrooms,
            balconies,
            parkingSlots,
            monthlyRent,
            maintenanceFee,
            status
        } = req.body;

        // Validate floor exists
        const floor = await Floor.findByPk(floorId);
        if (!floor) {
            return res.status(404).json({
                success: false,
                message: 'Floor not found'
            });
        }

        // Check if apartment number already exists on this floor
        const existingApartment = await Apartment.findOne({
            where: {
                floorId,
                apartmentNumber
            }
        });

        if (existingApartment) {
            return res.status(400).json({
                success: false,
                message: 'Apartment number already exists on this floor'
            });
        }

        const apartment = await Apartment.create({
            floorId,
            apartmentNumber,
            type,
            area,
            bedrooms,
            bathrooms,
            balconies: balconies || 0,
            parkingSlots: parkingSlots || 0,
            monthlyRent: monthlyRent || 0,
            maintenanceFee: maintenanceFee || 0,
            status: status || 'vacant',
            isActive: true
        });

        // Fetch the created apartment with associations
        const createdApartment = await Apartment.findByPk(apartment.id, {
            include: [
                {
                    model: Floor,
                    as: 'floor',
                    attributes: ['id', 'floorNumber'],
                    include: [{
                        model: Building,
                        as: 'building',
                        attributes: ['id', 'name', 'buildingCode']
                    }]
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Apartment created successfully',
            data: createdApartment
        });
    } catch (error) {
        console.error('Error creating apartment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create apartment',
            error: error.message
        });
    }
};

/**
 * Update an apartment
 */
const updateApartment = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            apartmentNumber,
            type,
            area,
            bedrooms,
            bathrooms,
            balconies,
            parkingSlots,
            monthlyRent,
            maintenanceFee,
            status
        } = req.body;

        const apartment = await Apartment.findByPk(id);
        if (!apartment) {
            return res.status(404).json({
                success: false,
                message: 'Apartment not found'
            });
        }

        // Check if new apartment number conflicts with existing ones on the same floor
        if (apartmentNumber && apartmentNumber !== apartment.apartmentNumber) {
            const existingApartment = await Apartment.findOne({
                where: {
                    floorId: apartment.floorId,
                    apartmentNumber,
                    id: { [Op.ne]: id }
                }
            });

            if (existingApartment) {
                return res.status(400).json({
                    success: false,
                    message: 'Apartment number already exists on this floor'
                });
            }
        }

        // Update apartment
        await apartment.update({
            apartmentNumber: apartmentNumber !== undefined ? apartmentNumber : apartment.apartmentNumber,
            type: type !== undefined ? type : apartment.type,
            area: area !== undefined ? area : apartment.area,
            bedrooms: bedrooms !== undefined ? bedrooms : apartment.bedrooms,
            bathrooms: bathrooms !== undefined ? bathrooms : apartment.bathrooms,
            balconies: balconies !== undefined ? balconies : apartment.balconies,
            parkingSlots: parkingSlots !== undefined ? parkingSlots : apartment.parkingSlots,
            monthlyRent: monthlyRent !== undefined ? monthlyRent : apartment.monthlyRent,
            maintenanceFee: maintenanceFee !== undefined ? maintenanceFee : apartment.maintenanceFee,
            status: status !== undefined ? status : apartment.status
        });

        // Fetch updated apartment with associations
        const updatedApartment = await Apartment.findByPk(id, {
            include: [
                {
                    model: Floor,
                    as: 'floor',
                    attributes: ['id', 'floorNumber'],
                    include: [{
                        model: Building,
                        as: 'building',
                        attributes: ['id', 'name', 'buildingCode']
                    }]
                }
            ]
        });

        res.status(200).json({
            success: true,
            message: 'Apartment updated successfully',
            data: updatedApartment
        });
    } catch (error) {
        console.error('Error updating apartment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update apartment',
            error: error.message
        });
    }
};

/**
 * Delete an apartment (soft delete)
 */
const deleteApartment = async (req, res) => {
    try {
        const { id } = req.params;

        const apartment = await Apartment.findByPk(id);
        if (!apartment) {
            return res.status(404).json({
                success: false,
                message: 'Apartment not found'
            });
        }

        // Soft delete
        await apartment.update({ isActive: false });

        res.status(200).json({
            success: true,
            message: 'Apartment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting apartment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete apartment',
            error: error.message
        });
    }
};

module.exports = {
    getApartmentsByFloor,
    getApartmentById,
    createApartment,
    updateApartment,
    deleteApartment,
    getApartmentsByBuilding
};
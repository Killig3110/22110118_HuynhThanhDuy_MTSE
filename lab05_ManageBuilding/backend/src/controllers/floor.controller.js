const { Op } = require('sequelize');
const { Floor, Building, Apartment } = require('../models');

/**
 * Get floors by building ID
 */
const getFloorsByBuilding = async (req, res) => {
    try {
        const { buildingId } = req.params;
        const {
            page = 1,
            limit = 50,
            sortBy = 'floorNumber',
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

        // Validate sort parameters
        const allowedSortFields = ['floorNumber', 'totalApartments', 'createdAt'];
        const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'floorNumber';
        const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase())
            ? sortOrder.toUpperCase()
            : 'ASC';

        const offset = (page - 1) * limit;

        const { count, rows: floors } = await Floor.findAndCountAll({
            where: {
                buildingId,
                isActive: true
            },
            include: [
                {
                    model: Building,
                    as: 'building',
                    attributes: ['id', 'name', 'buildingCode']
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
            message: 'Floors retrieved successfully',
            data: floors,
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
        console.error('Error fetching floors:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch floors',
            error: error.message
        });
    }
};

/**
 * Get floor by ID
 */
const getFloorById = async (req, res) => {
    try {
        const { id } = req.params;

        const floor = await Floor.findOne({
            where: {
                id,
                isActive: true
            },
            include: [
                {
                    model: Building,
                    as: 'building',
                    attributes: ['id', 'name', 'buildingCode']
                },
                {
                    model: Apartment,
                    as: 'apartments',
                    attributes: ['id', 'apartmentNumber', 'type', 'area', 'bedrooms', 'bathrooms', 'status'],
                    where: { isActive: true },
                    required: false
                }
            ]
        });

        if (!floor) {
            return res.status(404).json({
                success: false,
                message: 'Floor not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Floor retrieved successfully',
            data: floor
        });
    } catch (error) {
        console.error('Error fetching floor:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch floor',
            error: error.message
        });
    }
};

/**
 * Create a new floor
 */
const createFloor = async (req, res) => {
    try {
        const {
            buildingId,
            floorNumber,
            totalApartments,
            floorPlan
        } = req.body;

        // Validate building exists
        const building = await Building.findByPk(buildingId);
        if (!building) {
            return res.status(404).json({
                success: false,
                message: 'Building not found'
            });
        }

        // Check if floor number already exists in this building
        const existingFloor = await Floor.findOne({
            where: {
                buildingId,
                floorNumber
            }
        });

        if (existingFloor) {
            return res.status(400).json({
                success: false,
                message: 'Floor number already exists in this building'
            });
        }

        const floor = await Floor.create({
            buildingId,
            floorNumber,
            totalApartments: totalApartments || 0,
            floorPlan,
            isActive: true
        });

        // Fetch the created floor with associations
        const createdFloor = await Floor.findByPk(floor.id, {
            include: [
                {
                    model: Building,
                    as: 'building',
                    attributes: ['id', 'name', 'buildingCode']
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Floor created successfully',
            data: createdFloor
        });
    } catch (error) {
        console.error('Error creating floor:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create floor',
            error: error.message
        });
    }
};

/**
 * Update a floor
 */
const updateFloor = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            floorNumber,
            totalApartments,
            floorPlan
        } = req.body;

        const floor = await Floor.findByPk(id);
        if (!floor) {
            return res.status(404).json({
                success: false,
                message: 'Floor not found'
            });
        }

        // Check if new floor number conflicts with existing ones in the same building
        if (floorNumber && floorNumber !== floor.floorNumber) {
            const existingFloor = await Floor.findOne({
                where: {
                    buildingId: floor.buildingId,
                    floorNumber,
                    id: { [Op.ne]: id }
                }
            });

            if (existingFloor) {
                return res.status(400).json({
                    success: false,
                    message: 'Floor number already exists in this building'
                });
            }
        }

        // Update floor
        await floor.update({
            floorNumber: floorNumber !== undefined ? floorNumber : floor.floorNumber,
            totalApartments: totalApartments !== undefined ? totalApartments : floor.totalApartments,
            floorPlan: floorPlan !== undefined ? floorPlan : floor.floorPlan
        });

        // Fetch updated floor with associations
        const updatedFloor = await Floor.findByPk(id, {
            include: [
                {
                    model: Building,
                    as: 'building',
                    attributes: ['id', 'name', 'buildingCode']
                }
            ]
        });

        res.status(200).json({
            success: true,
            message: 'Floor updated successfully',
            data: updatedFloor
        });
    } catch (error) {
        console.error('Error updating floor:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update floor',
            error: error.message
        });
    }
};

/**
 * Delete a floor (soft delete)
 */
const deleteFloor = async (req, res) => {
    try {
        const { id } = req.params;

        const floor = await Floor.findByPk(id);
        if (!floor) {
            return res.status(404).json({
                success: false,
                message: 'Floor not found'
            });
        }

        // Check if floor has any active apartments
        const activeApartments = await Apartment.count({
            where: {
                floorId: id,
                isActive: true
            }
        });

        if (activeApartments > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete floor with active apartments. Please deactivate all apartments first.'
            });
        }

        // Soft delete
        await floor.update({ isActive: false });

        res.status(200).json({
            success: true,
            message: 'Floor deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting floor:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete floor',
            error: error.message
        });
    }
};

module.exports = {
    getFloorsByBuilding,
    getFloorById,
    createFloor,
    updateFloor,
    deleteFloor
};
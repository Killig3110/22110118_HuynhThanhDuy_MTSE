const { Building, Block, Floor, Apartment, User, HouseholdMember } = require('../models');
const { Op } = require('sequelize');

// Get all buildings with pagination and lazy loading
const getBuildings = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sortBy = 'buildingCode',
            sortOrder = 'ASC',
            search = '',
            blockId,
            status,
            managerId
        } = req.query;

        const offset = (page - 1) * limit;

        // Build where clause
        const whereClause = {};
        
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { buildingCode: { [Op.like]: `%${search}%` } },
                { address: { [Op.like]: `%${search}%` } }
            ];
        }

        if (blockId) {
            whereClause.blockId = blockId;
        }

        if (status) {
            whereClause.status = status;
        }

        if (managerId) {
            whereClause.managerId = managerId;
        }

        // Only show active buildings by default unless specified
        if (!status) {
            whereClause.isActive = true;
        }

        const { count, rows: buildings } = await Building.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Block,
                    as: 'block',
                    attributes: ['id', 'name', 'blockCode', 'location']
                },
                {
                    model: User,
                    as: 'manager',
                    attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
                }
            ],
            order: [[sortBy, sortOrder]],
            limit: parseInt(limit),
            offset: offset,
            distinct: true
        });

        // Calculate pagination info
        const totalPages = Math.ceil(count / limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        res.json({
            success: true,
            data: {
                buildings,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems: count,
                    itemsPerPage: parseInt(limit),
                    hasNext,
                    hasPrev
                }
            }
        });
    } catch (error) {
        console.error('Get buildings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch buildings',
            error: error.message
        });
    }
};

// Get building by ID with detailed info
const getBuildingById = async (req, res) => {
    try {
        const { id } = req.params;

        const building = await Building.findByPk(id, {
            include: [
                {
                    model: Block,
                    as: 'block',
                    attributes: ['id', 'name', 'blockCode', 'location', 'description']
                },
                {
                    model: User,
                    as: 'manager',
                    attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
                },
                {
                    model: Floor,
                    as: 'floors',
                    attributes: ['id', 'floorNumber', 'totalApartments'],
                    include: [
                        {
                            model: Apartment,
                            as: 'apartments',
                            attributes: ['id', 'apartmentNumber', 'type', 'status'],
                            limit: 5 // Limit apartments for performance
                        }
                    ]
                }
            ]
        });

        if (!building) {
            return res.status(404).json({
                success: false,
                message: 'Building not found'
            });
        }

        res.json({
            success: true,
            data: { building }
        });
    } catch (error) {
        console.error('Get building by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch building details',
            error: error.message
        });
    }
};

// Get floors by building ID with lazy loading
const getFloorsByBuilding = async (req, res) => {
    try {
        const { buildingId } = req.params;
        const {
            page = 1,
            limit = 10,
            loadApartments = 'false'
        } = req.query;

        const offset = (page - 1) * limit;

        // Check if building exists
        const building = await Building.findByPk(buildingId);
        if (!building) {
            return res.status(404).json({
                success: false,
                message: 'Building not found'
            });
        }

        const includeOptions = [];
        if (loadApartments === 'true') {
            includeOptions.push({
                model: Apartment,
                as: 'apartments',
                attributes: ['id', 'apartmentNumber', 'type', 'status', 'area', 'monthlyRent']
            });
        }

        const { count, rows: floors } = await Floor.findAndCountAll({
            where: { buildingId },
            include: includeOptions,
            order: [['floorNumber', 'ASC']],
            limit: parseInt(limit),
            offset: offset,
            distinct: true
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            success: true,
            data: {
                floors,
                building: {
                    id: building.id,
                    name: building.name,
                    buildingCode: building.buildingCode
                },
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems: count,
                    itemsPerPage: parseInt(limit),
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Get floors error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch floors',
            error: error.message
        });
    }
};

// Get apartments by floor with lazy loading
const getApartmentsByFloor = async (req, res) => {
    try {
        const { floorId } = req.params;
        const {
            page = 1,
            limit = 20,
            loadHouseholds = 'false',
            status
        } = req.query;

        const offset = (page - 1) * limit;

        // Check if floor exists
        const floor = await Floor.findByPk(floorId, {
            include: {
                model: Building,
                as: 'building',
                attributes: ['id', 'name', 'buildingCode']
            }
        });

        if (!floor) {
            return res.status(404).json({
                success: false,
                message: 'Floor not found'
            });
        }

        const whereClause = { floorId };
        if (status) {
            whereClause.status = status;
        }

        const includeOptions = [];
        if (loadHouseholds === 'true') {
            includeOptions.push({
                model: HouseholdMember,
                as: 'householdMembers',
                attributes: ['id', 'firstName', 'lastName', 'relationship', 'phone', 'isActive']
            });
        }

        const { count, rows: apartments } = await Apartment.findAndCountAll({
            where: whereClause,
            include: includeOptions,
            order: [['apartmentNumber', 'ASC']],
            limit: parseInt(limit),
            offset: offset,
            distinct: true
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            success: true,
            data: {
                apartments,
                floor: {
                    id: floor.id,
                    floorNumber: floor.floorNumber,
                    building: floor.building
                },
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems: count,
                    itemsPerPage: parseInt(limit),
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Get apartments error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch apartments',
            error: error.message
        });
    }
};

// Create new building (admin/manager only)
const createBuilding = async (req, res) => {
    try {
        const {
            name,
            blockId,
            buildingCode,
            address,
            city,
            state,
            zipCode,
            totalFloors,
            constructionYear,
            managerId,
            description,
            amenities
        } = req.body;

        // Check if building code already exists
        const existingBuilding = await Building.findOne({
            where: { buildingCode }
        });

        if (existingBuilding) {
            return res.status(400).json({
                success: false,
                message: 'Building code already exists'
            });
        }

        // Validate block exists
        const block = await Block.findByPk(blockId);
        if (!block) {
            return res.status(400).json({
                success: false,
                message: 'Block not found'
            });
        }

        // Validate manager if provided
        if (managerId) {
            const manager = await User.findByPk(managerId);
            if (!manager || manager.roleId !== 'building_manager') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid manager selected'
                });
            }
        }

        const building = await Building.create({
            name,
            blockId,
            buildingCode,
            address,
            city,
            state,
            zipCode,
            totalFloors,
            constructionYear,
            managerId,
            description,
            amenities: amenities || [],
            status: 'active',
            isActive: true
        });

        // Get building with associations
        const buildingWithDetails = await Building.findByPk(building.id, {
            include: [
                {
                    model: Block,
                    as: 'block',
                    attributes: ['id', 'name', 'blockCode']
                },
                {
                    model: User,
                    as: 'manager',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Building created successfully',
            data: { building: buildingWithDetails }
        });
    } catch (error) {
        console.error('Create building error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create building',
            error: error.message
        });
    }
};

// Update building
const updateBuilding = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const building = await Building.findByPk(id);
        if (!building) {
            return res.status(404).json({
                success: false,
                message: 'Building not found'
            });
        }

        // If updating building code, check uniqueness
        if (updateData.buildingCode && updateData.buildingCode !== building.buildingCode) {
            const existingBuilding = await Building.findOne({
                where: { 
                    buildingCode: updateData.buildingCode,
                    id: { [Op.ne]: id }
                }
            });

            if (existingBuilding) {
                return res.status(400).json({
                    success: false,
                    message: 'Building code already exists'
                });
            }
        }

        await building.update(updateData);

        // Get updated building with associations
        const updatedBuilding = await Building.findByPk(id, {
            include: [
                {
                    model: Block,
                    as: 'block',
                    attributes: ['id', 'name', 'blockCode']
                },
                {
                    model: User,
                    as: 'manager',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                }
            ]
        });

        res.json({
            success: true,
            message: 'Building updated successfully',
            data: { building: updatedBuilding }
        });
    } catch (error) {
        console.error('Update building error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update building',
            error: error.message
        });
    }
};

// Delete building (soft delete)
const deleteBuilding = async (req, res) => {
    try {
        const { id } = req.params;

        const building = await Building.findByPk(id);
        if (!building) {
            return res.status(404).json({
                success: false,
                message: 'Building not found'
            });
        }

        // Soft delete
        await building.update({ 
            isActive: false,
            status: 'inactive' 
        });

        res.json({
            success: true,
            message: 'Building deleted successfully'
        });
    } catch (error) {
        console.error('Delete building error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete building',
            error: error.message
        });
    }
};

module.exports = {
    getBuildings,
    getBuildingById,
    getFloorsByBuilding,
    getApartmentsByFloor,
    createBuilding,
    updateBuilding,
    deleteBuilding
};
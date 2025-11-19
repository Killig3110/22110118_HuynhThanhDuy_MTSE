const { Op } = require('sequelize');
const { Block, Building, User, Role } = require('../models');

/**
 * Get all blocks with pagination and filtering
 */
const getBlocks = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            sortBy = 'name',
            sortOrder = 'ASC'
        } = req.query;

        // Validate sort parameters
        const allowedSortFields = ['name', 'blockCode', 'location', 'totalBuildings', 'createdAt'];
        const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'name';
        const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase())
            ? sortOrder.toUpperCase()
            : 'ASC';

        const offset = (page - 1) * limit;

        // Build where clause for search
        let whereClause = { isActive: true };
        if (search.trim()) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { blockCode: { [Op.like]: `%${search}%` } },
                { location: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows: blocks } = await Block.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'manager',
                    attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
                    include: [{
                        model: Role,
                        as: 'role',
                        attributes: ['name']
                    }],
                    required: false
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
            message: 'Blocks retrieved successfully',
            data: blocks,
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
        console.error('Error fetching blocks:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch blocks',
            error: error.message
        });
    }
};

/**
 * Get block by ID
 */
const getBlockById = async (req, res) => {
    try {
        const { id } = req.params;

        const block = await Block.findOne({
            where: {
                id,
                isActive: true
            },
            include: [
                {
                    model: User,
                    as: 'manager',
                    attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
                    required: false
                }
            ]
        });

        if (!block) {
            return res.status(404).json({
                success: false,
                message: 'Block not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Block retrieved successfully',
            data: block
        });
    } catch (error) {
        console.error('Error fetching block:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch block',
            error: error.message
        });
    }
};

/**
 * Get all buildings in a specific block
 */
const getBuildingsByBlock = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            page = 1,
            limit = 20,
            search = '',
            sortBy = 'buildingCode',
            sortOrder = 'ASC'
        } = req.query;

        // Validate block exists
        const block = await Block.findByPk(id);
        if (!block) {
            return res.status(404).json({
                success: false,
                message: 'Block not found'
            });
        }

        const offset = (page - 1) * limit;

        // Build where clause for search
        let whereClause = {
            blockId: id,
            isActive: true
        };

        if (search.trim()) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { buildingCode: { [Op.like]: `%${search}%` } },
                { address: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows: buildings } = await Building.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'manager',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    required: false
                },
                {
                    model: Block,
                    as: 'block',
                    attributes: ['id', 'name', 'blockCode']
                }
            ],
            order: [[sortBy, sortOrder]],
            limit: parseInt(limit),
            offset,
            distinct: true
        });

        const totalPages = Math.ceil(count / limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        res.status(200).json({
            success: true,
            message: 'Buildings retrieved successfully',
            data: buildings,
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
        console.error('Error fetching buildings by block:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch buildings',
            error: error.message
        });
    }
};

const createBlock = async (req, res) => {
    try {
        const { name, blockCode, location, totalBuildings, description, managerId } = req.body;

        const block = await Block.create({
            name,
            blockCode,
            location,
            totalBuildings: totalBuildings || 0,
            description,
            managerId,
            isActive: true
        });

        res.status(201).json({
            success: true,
            message: 'Block created successfully',
            data: block
        });
    } catch (error) {
        console.error('Error creating block:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create block',
            error: error.message
        });
    }
};

const updateBlock = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const [updated] = await Block.update(updateData, {
            where: { id }
        });

        if (updated) {
            const updatedBlock = await Block.findByPk(id);
            res.status(200).json({
                success: true,
                message: 'Block updated successfully',
                data: updatedBlock
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Block not found'
            });
        }
    } catch (error) {
        console.error('Error updating block:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update block',
            error: error.message
        });
    }
};

const deleteBlock = async (req, res) => {
    try {
        const { id } = req.params;

        const block = await Block.findByPk(id);
        if (!block) {
            return res.status(404).json({
                success: false,
                message: 'Block not found'
            });
        }

        // Soft delete
        await block.update({ isActive: false });

        res.status(200).json({
            success: true,
            message: 'Block deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting block:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete block',
            error: error.message
        });
    }
};

module.exports = {
    getBlocks,
    getBlockById,
    getBuildingsByBlock,
    createBlock,
    updateBlock,
    deleteBlock
};
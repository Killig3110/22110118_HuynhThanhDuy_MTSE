const { Op } = require('sequelize');
const { Block, Building, Floor, Apartment, User, Role } = require('../models');

// Helper: build LIKE-based token filters across fields
const buildTokenFilter = (tokens, fields) => {
    if (!tokens.length) return {};

    return {
        [Op.and]: tokens.map((token) => {
            const pattern = `%${token}%`;
            return {
                [Op.or]: fields.map((field) => ({
                    [field]: { [Op.like]: pattern }
                }))
            };
        })
    };
};

/**
 * Unified fuzzy search across blocks, buildings, floors, apartments, residents.
 * Query params:
 *   q: text to search
 *   types: comma list of blocks,buildings,floors,apartments,residents
 *   limit: items per entity (default 5, max 20)
 *   blockId/buildingId/floorId: optional scoping filters
 */
const searchAll = async (req, res) => {
    try {
        const {
            q = '',
            types = '',
            limit = 5,
            blockId,
            buildingId,
            floorId
        } = req.query;

        const tokens = q.trim().split(/\s+/).filter(Boolean);
        const limitPerEntity = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 50);

        const availableTypes = ['blocks', 'buildings', 'floors', 'apartments', 'residents'];
        const requestedTypes = types
            ? types.split(',').map((t) => t.trim().toLowerCase()).filter((t) => availableTypes.includes(t))
            : availableTypes;

        // Base filters
        const blockFilter = { isActive: true, ...buildTokenFilter(tokens, ['name', 'blockCode', 'location', 'description']) };

        const buildingFilter = {
            isActive: true,
            ...(blockId ? { blockId } : {}),
            ...buildTokenFilter(tokens, ['name', 'buildingCode', 'address', 'city', 'state'])
        };

        const floorFilter = {
            isActive: true,
            ...(buildingId ? { buildingId } : {}),
            ...buildTokenFilter(tokens, ['floorNumber'])
        };

        const apartmentFilter = {
            isActive: true,
            ...(floorId ? { floorId } : {}),
            ...buildTokenFilter(tokens, ['apartmentNumber', 'type', 'description'])
        };

        const residentFilter = {
            ...buildTokenFilter(tokens, ['firstName', 'lastName', 'email', 'phone'])
        };

        const searchPromises = [];
        const result = {};

        if (requestedTypes.includes('blocks')) {
            searchPromises.push(
                Block.findAll({
                    where: blockFilter,
                    limit: limitPerEntity,
                    order: [['updatedAt', 'DESC']]
                }).then((blocks) => {
                    result.blocks = blocks;
                })
            );
        }

        if (requestedTypes.includes('buildings')) {
            searchPromises.push(
                Building.findAll({
                    where: buildingFilter,
                    include: [
                        { model: Block, as: 'block', attributes: ['id', 'name', 'blockCode'] }
                    ],
                    limit: limitPerEntity,
                    order: [['updatedAt', 'DESC']]
                }).then((buildings) => {
                    result.buildings = buildings;
                })
            );
        }

        if (requestedTypes.includes('floors')) {
            searchPromises.push(
                Floor.findAll({
                    where: floorFilter,
                    include: [
                        {
                            model: Building,
                            as: 'building',
                            attributes: ['id', 'name', 'buildingCode', 'blockId'],
                            include: [{ model: Block, as: 'block', attributes: ['id', 'blockCode'] }]
                        }
                    ],
                    limit: limitPerEntity,
                    order: [['floorNumber', 'ASC']]
                }).then((floors) => {
                    result.floors = floors;
                })
            );
        }

        if (requestedTypes.includes('apartments')) {
            searchPromises.push(
                Apartment.findAll({
                    where: apartmentFilter,
                    include: [
                        {
                            model: Floor,
                            as: 'floor',
                            attributes: ['id', 'floorNumber', 'buildingId'],
                            include: [{
                                model: Building,
                                as: 'building',
                                attributes: ['id', 'name', 'buildingCode', 'blockId']
                            }]
                        }
                    ],
                    limit: limitPerEntity,
                    order: [['apartmentNumber', 'ASC']]
                }).then((apartments) => {
                    result.apartments = apartments;
                })
            );
        }

        if (requestedTypes.includes('residents')) {
            searchPromises.push(
                User.findAll({
                    where: residentFilter,
                    include: [
                        {
                            model: Role,
                            as: 'role',
                            where: { name: 'resident' },
                            attributes: ['id', 'name']
                        }
                    ],
                    limit: limitPerEntity,
                    order: [['updatedAt', 'DESC']]
                }).then((residents) => {
                    result.residents = residents;
                })
            );
        }

        await Promise.all(searchPromises);

        res.status(200).json({
            success: true,
            message: 'Search completed',
            query: q,
            tokens,
            requestedTypes,
            limitPerEntity,
            data: result
        });
    } catch (error) {
        console.error('Error searching entities:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search entities',
            error: error.message
        });
    }
};

module.exports = { searchAll };

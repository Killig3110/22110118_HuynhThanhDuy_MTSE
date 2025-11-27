const Fuse = require('fuse.js');
const { Block, Building, Floor, Apartment, User, Role } = require('../models');

const normalize = (text = '') =>
    text
        .toString()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .trim();

const toPlain = (model) => (model?.toJSON ? model.toJSON() : model);

const buildHaystack = (item, fields) =>
    normalize(
        fields
            .map((field) => {
                const value = field.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), item);
                return value ?? '';
            })
            .join(' ')
    );

const fuzzySearch = (items, query, options = {}) => {
    const { limit = 20, fields = [] } = options;
    if (!items?.length) return [];
    const plainItems = items.map(toPlain);

    // Precompute normalized haystack to improve fuzzy quality (accent-insensitive)
    const prepared = plainItems.map((item) => ({
        ...item,
        _haystack: buildHaystack(item, fields)
    }));

    if (!query?.trim()) {
        return prepared.slice(0, limit);
    }

    const fuse = new Fuse(prepared, {
        includeScore: true,
        threshold: 0.38,
        distance: 120,
        minMatchCharLength: 2,
        ignoreLocation: true,
        keys: ['_haystack']
    });

    const needle = normalize(query);
    return fuse.search(needle).slice(0, limit).map(({ item, score }) => ({
        ...item,
        _score: score
    }));
};

/**
 * Unified fuzzy search across blocks, buildings, floors, apartments, residents.
 * Query params:
 *   q: text to search
 *   types: comma list of blocks,buildings,floors,apartments,residents
 *   limit: items per entity (default 10, max 50)
 *   blockId/buildingId/floorId: optional scoping filters
 */
const searchAll = async (req, res) => {
    try {
        const {
            q = '',
            types = '',
            limit = 10,
            blockId,
            buildingId,
            floorId
        } = req.query;

        const limitPerEntity = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

        const availableTypes = ['blocks', 'buildings', 'floors', 'apartments', 'residents'];
        const requestedTypes = types
            ? types.split(',').map((t) => t.trim().toLowerCase()).filter((t) => availableTypes.includes(t))
            : availableTypes;

        // Base filters (only scopes + active flags). Text matching handled by Fuse.js.
        const blockFilter = { isActive: true };

        const buildingFilter = {
            isActive: true,
            ...(blockId ? { blockId } : {})
        };

        const floorFilter = {
            isActive: true,
            ...(buildingId ? { buildingId } : {})
        };

        const apartmentFilter = {
            isActive: true,
            ...(floorId ? { floorId } : {})
        };

        const residentFilter = {};

        const fetchLimit = 200; // fetch a broader set then fuzzy cut down
        const searchPromises = [];
        const result = {};

        if (requestedTypes.includes('blocks')) {
            searchPromises.push(
                Block.findAll({
                    where: blockFilter,
                    limit: fetchLimit,
                    order: [['updatedAt', 'DESC']]
                }).then((blocks) => {
                    result.blocks = fuzzySearch(blocks, q, {
                        limit: limitPerEntity,
                        fields: ['name', 'blockCode', 'location', 'description']
                    });
                })
            );
        }

        if (requestedTypes.includes('buildings')) {
            searchPromises.push(
                Building.findAll({
                    where: buildingFilter,
                    include: [{ model: Block, as: 'block', attributes: ['id', 'name', 'blockCode'] }],
                    limit: fetchLimit,
                    order: [['updatedAt', 'DESC']]
                }).then((buildings) => {
                    result.buildings = fuzzySearch(buildings, q, {
                        limit: limitPerEntity,
                        fields: ['name', 'buildingCode', 'address', 'city', 'state', 'block.name', 'block.blockCode']
                    });
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
                            include: [{ model: Block, as: 'block', attributes: ['id', 'blockCode', 'name'] }]
                        }
                    ],
                    limit: fetchLimit,
                    order: [['floorNumber', 'ASC']]
                }).then((floors) => {
                    result.floors = fuzzySearch(floors, q, {
                        limit: limitPerEntity,
                        fields: ['floorNumber', 'building.name', 'building.buildingCode', 'building.block.blockCode']
                    });
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
                    limit: fetchLimit,
                    order: [['apartmentNumber', 'ASC']]
                }).then((apartments) => {
                    result.apartments = fuzzySearch(apartments, q, {
                        limit: limitPerEntity,
                        fields: ['apartmentNumber', 'type', 'description', 'floor.floorNumber', 'floor.building.name', 'floor.building.buildingCode']
                    });
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
                    limit: fetchLimit,
                    order: [['updatedAt', 'DESC']]
                }).then((residents) => {
                    result.residents = fuzzySearch(residents, q, {
                        limit: limitPerEntity,
                        fields: ['firstName', 'lastName', 'email', 'phone']
                    });
                })
            );
        }

        await Promise.all(searchPromises);

        const stripInternal = (list = []) => list.map(({ _haystack, ...rest }) => rest);

        res.status(200).json({
            success: true,
            message: 'Search completed',
            query: q,
            requestedTypes,
            limitPerEntity,
            data: {
                blocks: stripInternal(result.blocks),
                buildings: stripInternal(result.buildings),
                floors: stripInternal(result.floors),
                apartments: stripInternal(result.apartments),
                residents: stripInternal(result.residents)
            }
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

const { Op } = require('sequelize');
const { Apartment, Floor, Building, HouseholdMember } = require('../models');

/**
 * Fuzzy search and filter apartments across blocks/buildings/floors
 */
const searchApartments = async (req, res) => {
    try {
        const {
            q = '',
            page = 1,
            limit = 20,
            sortBy = 'apartmentNumber',
            sortOrder = 'ASC',
            buildingId,
            blockId,
            floorId,
            type,
            status,
            minArea,
            maxArea,
            minRent,
            maxRent,
            minPrice,
            maxPrice,
            bedrooms,
            bathrooms,
            hasParking,
            isListedForRent,
            isListedForSale
        } = req.query;

        const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
        const parsedLimit = Math.min(parseInt(limit, 10) || 20, 100);
        const offset = (parsedPage - 1) * parsedLimit;

        // Base filters
        const whereClause = { isActive: true };

        // CRITICAL: Only show apartments available for rent or sale in marketplace
        // Exclude occupied and under_renovation apartments
        if (!status) {
            whereClause.status = { [Op.in]: ['for_rent', 'for_sale'] };
        } else {
            whereClause.status = status;
        }

        if (floorId) whereClause.floorId = parseInt(floorId, 10);
        if (type) whereClause.type = type;
        if (bedrooms !== undefined) whereClause.bedrooms = parseInt(bedrooms, 10);
        if (bathrooms !== undefined) whereClause.bathrooms = parseInt(bathrooms, 10);
        if (hasParking === 'true') whereClause.parkingSlots = { [Op.gt]: 0 };

        // Numeric ranges
        if (minArea || maxArea) {
            whereClause.area = {};
            if (minArea) whereClause.area[Op.gte] = parseFloat(minArea);
            if (maxArea) whereClause.area[Op.lte] = parseFloat(maxArea);
        }

        if (minRent || maxRent) {
            whereClause.monthlyRent = {};
            if (minRent) whereClause.monthlyRent[Op.gte] = parseFloat(minRent);
            if (maxRent) whereClause.monthlyRent[Op.lte] = parseFloat(maxRent);
        }

        if (minPrice || maxPrice) {
            whereClause.salePrice = {};
            if (minPrice) whereClause.salePrice[Op.gte] = parseFloat(minPrice);
            if (maxPrice) whereClause.salePrice[Op.lte] = parseFloat(maxPrice);
        }

        if (isListedForRent !== undefined) {
            whereClause.isListedForRent = isListedForRent === 'true';
        }
        if (isListedForSale !== undefined) {
            whereClause.isListedForSale = isListedForSale === 'true';
        }

        // Tokenized fuzzy search on multiple fields
        const tokens = q.trim().split(/\s+/).filter(Boolean);
        if (tokens.length) {
            whereClause[Op.and] = tokens.map(token => {
                const pattern = `%${token}%`;
                return {
                    [Op.or]: [
                        { apartmentNumber: { [Op.like]: pattern } },
                        { type: { [Op.like]: pattern } },
                        { description: { [Op.like]: pattern } },
                        { '$floor.building.name$': { [Op.like]: pattern } },
                        { '$floor.building.buildingCode$': { [Op.like]: pattern } }
                    ]
                };
            });
        }

        // Include tree so we can filter by building/block and return context
        const include = [
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
        ];

        if (buildingId) {
            include[0].where = { ...(include[0].where || {}), buildingId: parseInt(buildingId, 10) };
        }

        if (blockId) {
            include[0].include[0].where = { ...(include[0].include[0].where || {}), blockId: parseInt(blockId, 10) };
            include[0].include[0].required = true;
        }

        // Sorting
        const allowedSortFields = ['apartmentNumber', 'monthlyRent', 'area', 'bedrooms', 'bathrooms', 'createdAt', 'updatedAt'];
        const normalizedSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'apartmentNumber';
        const normalizedSortOrder = ['ASC', 'DESC'].includes(String(sortOrder).toUpperCase())
            ? String(sortOrder).toUpperCase()
            : 'ASC';

        const order = [];
        if (normalizedSortBy === 'area' || normalizedSortBy === 'monthlyRent' || normalizedSortBy === 'bedrooms' || normalizedSortBy === 'bathrooms') {
            order.push([normalizedSortBy, normalizedSortOrder]);
        } else {
            order.push([normalizedSortBy, normalizedSortOrder]);
        }
        // Stable secondary ordering
        order.push([{ model: Floor, as: 'floor' }, 'floorNumber', 'ASC']);
        order.push(['apartmentNumber', 'ASC']);

        const { count, rows: apartments } = await Apartment.findAndCountAll({
            where: whereClause,
            include,
            order,
            limit: parsedLimit,
            offset,
            distinct: true
        });

        const totalPages = Math.ceil(count / parsedLimit);

        res.status(200).json({
            success: true,
            message: tokens.length ? 'Fuzzy search completed' : 'Apartments retrieved',
            data: apartments,
            filters: {
                q,
                buildingId,
                blockId,
                floorId,
                type,
                status,
                minArea,
                maxArea,
                minRent,
                maxRent,
                bedrooms,
                bathrooms,
                hasParking
            },
            pagination: {
                currentPage: parsedPage,
                totalPages,
                totalItems: count,
                itemsPerPage: parsedLimit,
                hasNext: parsedPage < totalPages,
                hasPrev: parsedPage > 1
            }
        });
    } catch (error) {
        console.error('Error searching apartments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search apartments',
            error: error.message
        });
    }
};

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
            status,
            isListedForRent,
            isListedForSale,
            salePrice
        } = req.body;

        const apartment = await Apartment.findByPk(id);
        if (!apartment) {
            return res.status(404).json({
                success: false,
                message: 'Apartment not found'
            });
        }

        const role = req.user?.role?.name;
        const isAdmin = ['admin', 'building_manager'].includes(role);
        const isOwner = req.user?.id && apartment.ownerId === req.user.id;
        const canManagePrice = apartment.ownerId ? isOwner : isAdmin;

        // Permission gate: pricing/listing/status changes only by owner (if exists) or admin when no owner
        const wantsPricingChange = [monthlyRent, salePrice, isListedForRent, isListedForSale, status].some(v => v !== undefined);
        if (wantsPricingChange && !canManagePrice) {
            return res.status(403).json({
                success: false,
                message: 'Only the apartment owner or admin (when no owner) can update pricing, listing, or status'
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

        // Status normalization: allow only specific statuses
        const allowedStatuses = ['vacant', 'occupied', 'maintenance', 'reserved', 'for_rent', 'for_sale', 'under_renovation'];
        const nextStatus = status !== undefined ? status : apartment.status;
        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value' });
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
            status: nextStatus,
            isListedForRent: isListedForRent !== undefined ? isListedForRent : apartment.isListedForRent,
            isListedForSale: isListedForSale !== undefined ? isListedForSale : apartment.isListedForSale,
            salePrice: salePrice !== undefined ? salePrice : apartment.salePrice
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

/**
 * Get apartments owned or rented by current user
 */
const getMyApartments = async (req, res) => {
    try {
        const userId = req.user.id;
        const userEmail = req.user.email;

        const apartments = await Apartment.findAll({
            where: {
                [Op.or]: [
                    { ownerId: userId },
                    { '$householdMembers.email$': userEmail }
                ],
                isActive: true
            },
            include: [
                {
                    model: Floor,
                    as: 'floor',
                    attributes: ['id', 'floorNumber', 'buildingId'],
                    include: [
                        {
                            model: Building,
                            as: 'building',
                            attributes: ['id', 'name', 'buildingCode']
                        }
                    ]
                },
                {
                    model: HouseholdMember,
                    as: 'householdMembers',
                    attributes: ['id', 'firstName', 'lastName', 'email', 'relationship'],
                    required: false
                }
            ],
            order: [['apartmentNumber', 'ASC']]
        });

        res.status(200).json({
            success: true,
            data: apartments
        });
    } catch (error) {
        console.error('Error fetching my apartments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch your apartments',
            error: error.message
        });
    }
};

/**
 * Update listing status (owner or manager can modify)
 */
const updateListing = async (req, res) => {
    try {
        const { id } = req.params;
        const { isListedForRent, isListedForSale } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role?.name;

        const apartment = await Apartment.findByPk(id);

        if (!apartment) {
            return res.status(404).json({
                success: false,
                message: 'Apartment not found'
            });
        }

        // Owner or building manager can update listing
        const isOwner = apartment.ownerId === userId;
        const isManager = ['admin', 'building_manager'].includes(userRole);

        if (!isOwner && !isManager) {
            return res.status(403).json({
                success: false,
                message: 'Only the owner or building manager can update listing status'
            });
        }

        // Only vacant apartments can be listed
        if (apartment.status !== 'vacant') {
            return res.status(400).json({
                success: false,
                message: 'Only vacant apartments can be listed for rent or sale'
            });
        }

        const updates = {};
        if (isListedForRent !== undefined) updates.isListedForRent = isListedForRent;
        if (isListedForSale !== undefined) updates.isListedForSale = isListedForSale;

        await apartment.update(updates);

        res.status(200).json({
            success: true,
            data: apartment,
            message: 'Listing status updated successfully'
        });
    } catch (error) {
        console.error('Error updating listing:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update listing status',
            error: error.message
        });
    }
};

/**
 * Update apartment status (owner or manager can modify)
 */
const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role?.name;

        const apartment = await Apartment.findByPk(id);

        if (!apartment) {
            return res.status(404).json({
                success: false,
                message: 'Apartment not found'
            });
        }

        // Owner or building manager can update status
        const isOwner = apartment.ownerId === userId;
        const isManager = ['admin', 'building_manager'].includes(userRole);

        if (!isOwner && !isManager) {
            return res.status(403).json({
                success: false,
                message: 'Only the owner or building manager can update apartment status'
            });
        }

        // Validate status
        const validStatuses = ['vacant', 'occupied', 'under_renovation'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be: vacant, occupied, or under_renovation'
            });
        }

        // If changing to non-vacant, disable listings
        const updates = { status };
        if (status !== 'vacant') {
            updates.isListedForRent = false;
            updates.isListedForSale = false;
        }

        await apartment.update(updates);

        res.status(200).json({
            success: true,
            data: apartment,
            message: `Status updated to ${status}${status !== 'vacant' ? ' (listings disabled)' : ''}`
        });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update status',
            error: error.message
        });
    }
};

module.exports = {
    searchApartments,
    getApartmentsByFloor,
    getApartmentById,
    createApartment,
    updateApartment,
    deleteApartment,
    getApartmentsByBuilding,
    getMyApartments,
    updateListing,
    updateStatus
};

const { Op } = require('sequelize');
const { LeaseRequest, Apartment, Floor, Building, User } = require('../models');

// Create a new lease/purchase request (resident)
const createLeaseRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user?.role?.name;
        if (userRole && userRole !== 'resident') {
            return res.status(403).json({ success: false, message: 'Only residents can request rent/buy' });
        }
        const {
            apartmentId,
            type = 'rent',
            startDate,
            endDate,
            monthlyRent,
            totalPrice,
            note
        } = req.body;

        const apartment = await Apartment.findByPk(apartmentId, {
            include: [
                {
                    model: Floor,
                    as: 'floor',
                    include: [{ model: Building, as: 'building' }]
                }
            ]
        });
        if (!apartment || !apartment.isActive) {
            return res.status(404).json({ success: false, message: 'Apartment not found' });
        }

        // Basic availability check
        if (apartment.status === 'occupied') {
            return res.status(400).json({ success: false, message: 'Apartment already occupied' });
        }
        if (type === 'rent') {
            if (!apartment.isListedForRent) {
                return res.status(400).json({ success: false, message: 'Apartment is not listed for rent' });
            }
        }
        if (type === 'buy') {
            if (!apartment.isListedForSale) {
                return res.status(400).json({ success: false, message: 'Apartment is not listed for sale' });
            }
        }

        // Determine next status: owner must approve first if there is an owner and requester is not owner
        let nextStatus = 'pending_manager';
        if (apartment.ownerId && apartment.ownerId !== userId) {
            nextStatus = 'pending_owner';
        }

        const lease = await LeaseRequest.create({
            apartmentId,
            userId,
            type,
            startDate,
            endDate,
            monthlyRent,
            totalPrice,
            note,
            status: nextStatus
        });

        res.status(201).json({
            success: true,
            message: 'Lease request created',
            data: lease
        });
    } catch (error) {
        console.error('Error creating lease request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create lease request',
            error: error.message
        });
    }
};

// List lease requests (manager/admin see all, others only their own)
const listLeaseRequests = async (req, res) => {
    try {
        const { status, type, apartmentId, requesterId, q = '', page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (status) whereClause.status = status;
        if (type) whereClause.type = type;
        if (apartmentId) whereClause.apartmentId = apartmentId;
        if (requesterId) whereClause.userId = requesterId;

        // Restrict for non-admin/manager
        if (!['admin', 'building_manager'].includes(req.user.role?.name)) {
            whereClause.userId = req.user.id;
        }

        const tokens = q.trim().split(/\s+/).filter(Boolean);
        if (tokens.length) {
            whereClause[Op.and] = tokens.map((t) => ({
                [Op.or]: [
                    { note: { [Op.like]: `%${t}%` } }
                ]
            }));
        }

        const { count, rows } = await LeaseRequest.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Apartment,
                    as: 'apartment',
                    attributes: ['id', 'apartmentNumber', 'status'],
                    include: [
                        {
                            model: Floor,
                            as: 'floor',
                            attributes: ['id', 'floorNumber'],
                            include: [{ model: Building, as: 'building', attributes: ['id', 'name', 'buildingCode'] }]
                        }
                    ]
                },
                { model: User, as: 'requester', attributes: ['id', 'firstName', 'lastName', 'email'] },
                { model: User, as: 'approver', attributes: ['id', 'firstName', 'lastName', 'email'] }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit, 10),
            offset,
            distinct: true
        });

        res.status(200).json({
            success: true,
            data: rows,
            pagination: {
                currentPage: parseInt(page, 10),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit, 10)
            }
        });
    } catch (error) {
        console.error('Error listing lease requests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch lease requests',
            error: error.message
        });
    }
};

// Approve / reject
const decideLeaseRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { decision } = req.body; // 'approve' | 'reject'

        if (!['approve', 'reject'].includes(decision)) {
            return res.status(400).json({ success: false, message: 'Invalid decision' });
        }

        const lease = await LeaseRequest.findByPk(id, {
            include: [{ model: Apartment, as: 'apartment' }]
        });
        if (!lease) {
            return res.status(404).json({ success: false, message: 'Lease request not found' });
        }
        if (lease.status !== 'pending_manager') {
            return res.status(400).json({ success: false, message: 'Request is not ready for manager decision' });
        }

        if (decision === 'reject') {
            await lease.update({
                status: 'rejected',
                decisionBy: req.user.id,
                decisionAt: new Date()
            });
            return res.status(200).json({ success: true, message: 'Request rejected', data: lease });
        }

        // Approve path
        await lease.update({
            status: 'approved',
            decisionBy: req.user.id,
            decisionAt: new Date()
        });

        // Update apartment assignment and listing flags
        if (lease.type === 'rent') {
            await lease.apartment.update({
                tenantId: lease.userId,
                status: 'occupied',
                isListedForRent: false
            });
        } else if (lease.type === 'buy') {
            await lease.apartment.update({
                ownerId: lease.userId,
                tenantId: null,
                status: 'occupied',
                isListedForSale: false,
                isListedForRent: false
            });
        }

        res.status(200).json({
            success: true,
            message: 'Request approved',
            data: lease
        });
    } catch (error) {
        console.error('Error deciding lease request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process lease request',
            error: error.message
        });
    }
};

// Owner decision
const ownerDecision = async (req, res) => {
    try {
        const { id } = req.params;
        const { decision } = req.body;
        if (!['approve', 'reject'].includes(decision)) {
            return res.status(400).json({ success: false, message: 'Invalid decision' });
        }

        const lease = await LeaseRequest.findByPk(id, { include: [{ model: Apartment, as: 'apartment' }] });
        if (!lease) return res.status(404).json({ success: false, message: 'Lease request not found' });

        if (lease.status !== 'pending_owner') {
            return res.status(400).json({ success: false, message: 'Request not waiting for owner' });
        }

        if (lease.apartment.ownerId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Only apartment owner can decide' });
        }

        if (decision === 'reject') {
            await lease.update({ status: 'rejected', decisionBy: req.user.id, decisionAt: new Date() });
            return res.status(200).json({ success: true, message: 'Request rejected by owner', data: lease });
        }

        // Move to manager stage
        await lease.update({ status: 'pending_manager' });
        res.status(200).json({ success: true, message: 'Owner approved. Pending manager approval.', data: lease });
    } catch (error) {
        console.error('Owner decision failed:', error);
        res.status(500).json({ success: false, message: 'Failed to process owner decision', error: error.message });
    }
};

// Cancel (requester)
const cancelLeaseRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const lease = await LeaseRequest.findByPk(id);
        if (!lease) {
            return res.status(404).json({ success: false, message: 'Lease request not found' });
        }
        if (lease.userId !== req.user.id && !['admin'].includes(req.user.role?.name)) {
            return res.status(403).json({ success: false, message: 'Not allowed to cancel this request' });
        }
        if (lease.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Only pending requests can be cancelled' });
        }

        await lease.update({ status: 'cancelled' });
        res.status(200).json({ success: true, message: 'Request cancelled', data: lease });
    } catch (error) {
        console.error('Error cancelling lease request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel lease request',
            error: error.message
        });
    }
};

module.exports = {
    createLeaseRequest,
    listLeaseRequests,
    decideLeaseRequest,
    cancelLeaseRequest,
    ownerDecision
};

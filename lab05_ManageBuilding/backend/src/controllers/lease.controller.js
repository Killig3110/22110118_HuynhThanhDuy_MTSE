const { Op } = require('sequelize');
const { LeaseRequest, Apartment, Floor, Building, User, Role } = require('../models');

// Create a new lease/purchase request (resident or guest with contact info)
const createLeaseRequest = async (req, res) => {
    try {
        const userId = req.user?.id || null;
        const userRole = req.user?.role?.name;
        const {
            apartmentId,
            type = 'rent',
            startDate,
            endDate,
            monthlyRent,
            totalPrice,
            note,
            contactName,
            contactEmail,
            contactPhone
        } = req.body;

        // Block staff roles AND existing residents/owners from creating lease requests
        const staffRoles = ['admin', 'building_manager', 'security', 'technician', 'accountant'];
        if (userRole && staffRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'Staff members cannot create lease requests. Only guests or users can request to rent/buy apartments.'
            });
        }

        // Block residents and owners from creating new lease requests (they already have apartments)
        if (userRole && ['resident', 'owner'].includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'Residents and owners cannot create new lease requests. Please contact management if you need assistance.'
            });
        }

        // Allow: guest (no user), user role, or authenticated users without resident/owner/staff roles

        // For guests (userId is null), require contact information
        if (!userId) {
            if (!contactName || !contactEmail || !contactPhone) {
                return res.status(400).json({
                    success: false,
                    message: 'Contact information (name, email, phone) is required for guest requests'
                });
            }
        }

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

        // Determine next status based on type:
        // - RENT: owner approval required first (if owner exists), then manager
        // - BUY: manager approval only
        let nextStatus = 'pending_manager';
        if (type === 'rent' && apartment.ownerId && apartment.ownerId !== userId) {
            // For rent requests, owner must approve first
            nextStatus = 'pending_owner';
        }
        // For buy requests, always go straight to manager approval

        const lease = await LeaseRequest.create({
            apartmentId,
            userId,
            type,
            startDate,
            endDate,
            monthlyRent,
            totalPrice,
            note,
            contactName: contactName || `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || null,
            contactEmail: contactEmail || req.user?.email || null,
            contactPhone: contactPhone || req.user?.phone || null,
            status: nextStatus
        });

        // Log guest request for admin notification
        if (!userId) {
            console.log('🔔 NEW GUEST LEASE REQUEST:', {
                id: lease.id,
                apartment: `#${apartment.apartmentNumber} - ${apartment.floor?.building?.buildingCode}`,
                type: lease.type,
                contactName: lease.contactName,
                contactEmail: lease.contactEmail,
                contactPhone: lease.contactPhone,
                status: lease.status,
                timestamp: new Date().toISOString()
            });
        }

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

// Approve / reject (with database transaction for data consistency)
const decideLeaseRequest = async (req, res) => {
    const { sequelize } = require('../config/database');
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const { decision } = req.body; // 'approve' | 'reject'

        if (!['approve', 'reject'].includes(decision)) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Invalid decision' });
        }

        const lease = await LeaseRequest.findByPk(id, {
            include: [{ model: Apartment, as: 'apartment' }],
            transaction
        });

        if (!lease) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: 'Lease request not found' });
        }

        if (lease.status !== 'pending_manager') {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Request is not ready for manager decision' });
        }

        if (decision === 'reject') {
            await lease.update({
                status: 'rejected',
                decisionBy: req.user.id,
                decisionAt: new Date()
            }, { transaction });

            await transaction.commit();
            return res.status(200).json({ success: true, message: 'Request rejected', data: lease });
        }

        // Approve path - All operations in transaction
        await lease.update({
            status: 'approved',
            decisionBy: req.user.id,
            decisionAt: new Date()
        }, { transaction });

        // Update apartment assignment and listing flags
        // Ensure requester exists (guest request may have null userId)
        let requesterId = lease.userId;
        if (!requesterId) {
            // Try to find existing user by contact email; otherwise create resident account
            if (!lease.contactEmail) {
                await transaction.rollback();
                return res.status(400).json({ success: false, message: 'Missing requester info to approve' });
            }
            const existing = await User.findOne({
                where: { email: lease.contactEmail },
                transaction
            });

            if (existing) {
                requesterId = existing.id;
            } else {
                const [firstName = '', lastName = ''] = (lease.contactName || 'Guest User').split(' ');
                const residentRole = await Role.findOne({
                    where: { name: 'resident' },
                    transaction
                });

                const newUser = await User.create({
                    firstName: firstName || 'Guest',
                    lastName: lastName || 'User',
                    email: lease.contactEmail,
                    phone: lease.contactPhone || null,
                    // generate a simple temp password; should be reset flow in real apps
                    password: 'Temp123!',
                    roleId: residentRole?.id || null,
                    isActive: true
                }, { transaction });

                requesterId = newUser.id;
            }
        }

        // Upgrade role to resident if needed
        if (requesterId) {
            const requester = await User.findByPk(requesterId, {
                include: [{ model: Role, as: 'role' }],
                transaction
            });

            if (requester && requester.role?.name !== 'resident') {
                const residentRole = await Role.findOne({
                    where: { name: 'resident' },
                    transaction
                });

                if (residentRole) {
                    const oldRole = requester.role?.name || 'user';
                    await requester.update({ roleId: residentRole.id }, { transaction });

                    // Log role upgrade for notification
                    console.log('✨ USER ROLE UPGRADED:', {
                        userId: requester.id,
                        email: requester.email,
                        oldRole: oldRole,
                        newRole: 'resident',
                        reason: 'Lease request approved',
                        leaseId: lease.id,
                        apartmentNumber: lease.apartment?.apartmentNumber,
                        timestamp: new Date().toISOString()
                    });
                }
            }
        }

        // Update apartment status
        if (lease.type === 'rent') {
            await lease.apartment.update({
                tenantId: requesterId,
                status: 'occupied',
                isListedForRent: false
            }, { transaction });
        } else if (lease.type === 'buy') {
            await lease.apartment.update({
                ownerId: requesterId,
                tenantId: null,
                status: 'occupied',
                isListedForSale: false,
                isListedForRent: false
            }, { transaction });
        }

        // Update lease with final userId
        if (requesterId !== lease.userId) {
            await lease.update({ userId: requesterId }, { transaction });
        }

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: 'Request approved',
            data: lease
        });
    } catch (error) {
        await transaction.rollback();
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

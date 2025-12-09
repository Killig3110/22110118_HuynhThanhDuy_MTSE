const { Cart, Apartment, User, Floor, Building, Block } = require('../models');

class CartService {
    /**
     * Get all cart items for a user
     */
    async getUserCart(userId) {
        const cartItems = await Cart.findAll({
            where: { userId },
            include: [
                {
                    model: Apartment,
                    as: 'apartment',
                    include: [
                        {
                            model: Floor,
                            as: 'floor',
                            include: [
                                {
                                    model: Building,
                                    as: 'building',
                                    include: [
                                        {
                                            model: Block,
                                            as: 'block'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [['addedAt', 'DESC']]
        });

        return cartItems.map(item => this.formatCartItem(item));
    }

    /**
     * Add item to cart
     */
    async addToCart(userId, data) {
        const { apartmentId, mode, months, note } = data;

        // Check if apartment exists and is available
        const apartment = await Apartment.findByPk(apartmentId, {
            include: [
                {
                    model: Floor,
                    as: 'floor',
                    include: [
                        {
                            model: Building,
                            as: 'building',
                            include: [
                                {
                                    model: Block,
                                    as: 'block'
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        if (!apartment) {
            throw new Error('Apartment not found');
        }

        // Validate availability based on mode
        if (mode === 'rent' && !apartment.isListedForRent) {
            throw new Error('Apartment is not available for rent');
        }

        if (mode === 'buy' && !apartment.isListedForSale) {
            throw new Error('Apartment is not available for sale');
        }

        // Check status
        const validStatuses = ['vacant', 'for_rent', 'for_sale'];
        if (!validStatuses.includes(apartment.status)) {
            throw new Error(`Apartment is ${apartment.status} and not available`);
        }

        // Check if item already exists
        const existingItem = await Cart.findOne({
            where: { userId, apartmentId, mode }
        });

        if (existingItem) {
            // Update existing item
            await existingItem.update({
                months: mode === 'rent' ? months : null,
                note,
                priceSnapshot: mode === 'rent' ? apartment.monthlyRent : apartment.salePrice,
                depositSnapshot: mode === 'rent' ? apartment.monthlyRent * 2 : 0,
                maintenanceFeeSnapshot: apartment.maintenanceFee
            });

            return this.formatCartItem(await Cart.findByPk(existingItem.id, {
                include: [
                    {
                        model: Apartment,
                        as: 'apartment',
                        include: [
                            {
                                model: Floor,
                                as: 'floor',
                                include: [
                                    {
                                        model: Building,
                                        as: 'building',
                                        include: [
                                            {
                                                model: Block,
                                                as: 'block'
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }));
        }

        // Create new cart item
        const cartItem = await Cart.create({
            userId,
            apartmentId,
            mode,
            months: mode === 'rent' ? months || 12 : null,
            note,
            priceSnapshot: mode === 'rent' ? apartment.monthlyRent : apartment.salePrice,
            depositSnapshot: mode === 'rent' ? apartment.monthlyRent * 2 : 0,
            maintenanceFeeSnapshot: apartment.maintenanceFee,
            selected: true
        });

        // Fetch with associations
        const itemWithAssociations = await Cart.findByPk(cartItem.id, {
            include: [
                {
                    model: Apartment,
                    as: 'apartment',
                    include: [
                        {
                            model: Floor,
                            as: 'floor',
                            include: [
                                {
                                    model: Building,
                                    as: 'building',
                                    include: [
                                        {
                                            model: Block,
                                            as: 'block'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        return this.formatCartItem(itemWithAssociations);
    }

    /**
     * Update cart item
     */
    async updateCartItem(userId, cartItemId, updates) {
        const cartItem = await Cart.findOne({
            where: { id: cartItemId, userId }
        });

        if (!cartItem) {
            throw new Error('Cart item not found');
        }

        await cartItem.update(updates);

        return this.formatCartItem(await Cart.findByPk(cartItem.id, {
            include: [
                {
                    model: Apartment,
                    as: 'apartment',
                    include: [
                        {
                            model: Floor,
                            as: 'floor',
                            include: [
                                {
                                    model: Building,
                                    as: 'building',
                                    include: [
                                        {
                                            model: Block,
                                            as: 'block'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }));
    }

    /**
     * Remove item from cart
     */
    async removeFromCart(userId, cartItemId) {
        const cartItem = await Cart.findOne({
            where: { id: cartItemId, userId }
        });

        if (!cartItem) {
            throw new Error('Cart item not found');
        }

        await cartItem.destroy();
        return { success: true };
    }

    /**
     * Clear all cart items for user
     */
    async clearCart(userId) {
        await Cart.destroy({
            where: { userId }
        });

        return { success: true };
    }

    /**
     * Select/deselect cart items
     */
    async toggleSelection(userId, cartItemId, selected) {
        const cartItem = await Cart.findOne({
            where: { id: cartItemId, userId }
        });

        if (!cartItem) {
            throw new Error('Cart item not found');
        }

        await cartItem.update({ selected });
        return this.formatCartItem(await Cart.findByPk(cartItem.id, {
            include: [
                {
                    model: Apartment,
                    as: 'apartment',
                    include: [
                        {
                            model: Floor,
                            as: 'floor',
                            include: [
                                {
                                    model: Building,
                                    as: 'building',
                                    include: [
                                        {
                                            model: Block,
                                            as: 'block'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }));
    }

    /**
     * Select all cart items
     */
    async selectAll(userId, selected = true) {
        await Cart.update(
            { selected },
            { where: { userId } }
        );

        return this.getUserCart(userId);
    }

    /**
     * Get cart summary/totals
     */
    async getCartSummary(userId) {
        const cartItems = await this.getUserCart(userId);

        let rentTotal = 0;
        let buyTotal = 0;
        let depositTotal = 0;
        let maintenanceTotal = 0;
        let selectedCount = 0;

        cartItems.forEach(item => {
            if (item.selected) {
                selectedCount++;

                if (item.mode === 'rent') {
                    rentTotal += item.price * item.months;
                    depositTotal += item.deposit;
                    maintenanceTotal += item.maintenanceFee * item.months;
                } else {
                    buyTotal += item.price;
                    maintenanceTotal += item.maintenanceFee * 12; // Annual
                }
            }
        });

        const grandTotal = rentTotal + buyTotal + depositTotal + maintenanceTotal;

        return {
            items: cartItems,
            summary: {
                rentTotal,
                buyTotal,
                depositTotal,
                maintenanceTotal,
                grandTotal,
                selectedCount,
                totalItems: cartItems.length
            }
        };
    }

    /**
     * Format cart item for response
     */
    formatCartItem(cartItem) {
        const apartment = cartItem.apartment;
        const floor = apartment?.floor;
        const building = floor?.building;
        const block = building?.block;

        return {
            id: cartItem.id,
            apartmentId: cartItem.apartmentId,
            code: apartment?.apartmentNumber,
            title: `${apartment?.type?.toUpperCase()} Apartment`,
            type: apartment?.type,
            area: apartment?.area,
            price: cartItem.priceSnapshot || (cartItem.mode === 'rent' ? apartment?.monthlyRent : apartment?.salePrice),
            mode: cartItem.mode,
            months: cartItem.months || 1,
            status: apartment?.status,
            selected: cartItem.selected,
            note: cartItem.note,

            // Location hierarchy
            block: block?.blockCode || block?.name,
            building: building?.buildingCode || building?.name,
            floor: floor?.floorNumber ? `Floor ${floor.floorNumber}` : floor?.name,

            // Apartment details
            bedrooms: apartment?.bedrooms,
            bathrooms: apartment?.bathrooms,
            balconies: apartment?.balconies,
            parkingSlots: apartment?.parkingSlots,

            // Amenities
            amenities: apartment?.amenities || [],

            // Financial details
            maintenanceFee: cartItem.maintenanceFeeSnapshot || apartment?.maintenanceFee || 0,
            deposit: cartItem.depositSnapshot || 0,

            // Metadata
            addedAt: cartItem.addedAt
        };
    }

    /**
     * Checkout cart - Process payment and complete apartment transactions
     */
    async checkoutCart(userId, data) {
        const { sequelize } = require('../config/database');
        const { Payment, Role, LeaseRequest, HouseholdMember } = require('../models');
        const { paymentMethod, note } = data;

        // Start transaction
        const transaction = await sequelize.transaction();

        try {
            // 1. Get selected cart items
            const cartItems = await Cart.findAll({
                where: {
                    userId,
                    selected: true
                },
                include: [
                    {
                        model: Apartment,
                        as: 'apartment',
                        include: [
                            {
                                model: Floor,
                                as: 'floor',
                                include: [
                                    {
                                        model: Building,
                                        as: 'building'
                                    }
                                ]
                            }
                        ]
                    }
                ],
                transaction
            });

            if (cartItems.length === 0) {
                throw new Error('No items selected for checkout');
            }

            // 2. Validate all apartments are still available
            for (const item of cartItems) {
                const apartment = item.apartment;
                if (apartment.status !== 'available') {
                    throw new Error(`Apartment ${apartment.apartmentNumber} is no longer available`);
                }

                // Check if mode matches apartment listing
                if (item.mode === 'rent' && !apartment.isListedForRent) {
                    throw new Error(`Apartment ${apartment.apartmentNumber} is not available for rent`);
                }
                if (item.mode === 'buy' && !apartment.isListedForSale) {
                    throw new Error(`Apartment ${apartment.apartmentNumber} is not available for sale`);
                }
            }

            // 3. Get user and check current role
            const user = await User.findByPk(userId, {
                include: [{ model: Role, as: 'role' }],
                transaction
            });

            const payments = [];
            const completedApartments = [];

            // 4. Process each cart item
            for (const cartItem of cartItems) {
                const apartment = cartItem.apartment;
                const amount = cartItem.mode === 'rent'
                    ? (cartItem.priceSnapshot || apartment.monthlyRent) * (cartItem.months || 1)
                    : (cartItem.priceSnapshot || apartment.salePrice);

                // Create payment record
                const payment = await Payment.create({
                    apartmentId: apartment.id,
                    billingId: null, // Will be linked to billing later
                    amount: amount,
                    paymentMethod: paymentMethod,
                    paymentDate: new Date(),
                    status: 'successful',
                    transactionId: `TXN-${Date.now()}-${apartment.id}`,
                    reference: `CART-${cartItem.id}`,
                    notes: note || `Payment for ${cartItem.mode} of apartment ${apartment.apartmentNumber}`,
                    receivedBy: userId,
                    receiptNumber: `RCP-${Date.now()}-${apartment.id}`,
                    isActive: true
                }, { transaction });

                // Update apartment status and owner/tenant
                const updateData = {
                    status: cartItem.mode === 'buy' ? 'sold' : 'occupied'
                };

                if (cartItem.mode === 'buy') {
                    updateData.ownerId = userId;
                    updateData.isListedForSale = false;
                } else {
                    updateData.tenantId = userId;
                    updateData.isListedForRent = false;
                }

                await apartment.update(updateData, { transaction });

                // Create household member entry
                await HouseholdMember.create({
                    apartmentId: apartment.id,
                    userId: userId,
                    relationship: cartItem.mode === 'buy' ? 'owner' : 'tenant',
                    isActive: true,
                    moveInDate: new Date()
                }, { transaction });

                // Update related lease request if exists
                await LeaseRequest.update({
                    status: 'completed',
                    completedAt: new Date()
                }, {
                    where: {
                        apartmentId: apartment.id,
                        userId: userId,
                        status: 'approved'
                    },
                    transaction
                });

                payments.push(payment);
                completedApartments.push(apartment);
            }

            // 5. Upgrade user role to resident if not already
            const residentRole = await Role.findOne({
                where: { name: 'resident' },
                transaction
            });

            if (user.role.name !== 'resident' && user.role.name !== 'owner') {
                await user.update({
                    roleId: residentRole.id
                }, { transaction });
            }

            // 6. Clear checked out items from cart
            await Cart.destroy({
                where: {
                    userId,
                    selected: true
                },
                transaction
            });

            // Commit transaction
            await transaction.commit();

            return {
                success: true,
                message: `Successfully completed checkout for ${cartItems.length} apartment(s)`,
                payments: payments.map(p => ({
                    id: p.id,
                    transactionId: p.transactionId,
                    amount: parseFloat(p.amount),
                    status: p.status,
                    paymentMethod: p.paymentMethod,
                    paymentDate: p.paymentDate.toISOString()
                })),
                completedApartments: completedApartments.map(a => ({
                    id: a.id,
                    apartmentNumber: a.apartmentNumber,
                    type: a.type,
                    status: a.status
                })),
                userRole: residentRole.name
            };

        } catch (error) {
            // Rollback transaction on error
            await transaction.rollback();
            throw error;
        }
    }
}

module.exports = new CartService();

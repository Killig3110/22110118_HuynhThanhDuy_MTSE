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

                const price = parseFloat(item.price) || 0;
                const deposit = parseFloat(item.deposit) || 0;
                const maintenanceFee = parseFloat(item.maintenanceFee) || 0;
                const months = item.months || 1;

                if (item.mode === 'rent') {
                    rentTotal += price * months;
                    depositTotal += deposit;
                    maintenanceTotal += maintenanceFee * months;
                } else {
                    buyTotal += price;
                    depositTotal += deposit;
                    maintenanceTotal += maintenanceFee * 12; // Annual
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
            area: parseFloat(apartment?.area) || 0,
            price: parseFloat(cartItem.priceSnapshot || (cartItem.mode === 'rent' ? apartment?.monthlyRent : apartment?.salePrice)) || 0,
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
            maintenanceFee: parseFloat(cartItem.maintenanceFeeSnapshot || apartment?.maintenanceFee) || 0,
            deposit: parseFloat(cartItem.depositSnapshot) || 0,

            // Full apartment object for frontend
            apartment: {
                id: apartment?.id,
                apartmentNumber: apartment?.apartmentNumber,
                type: apartment?.type,
                area: parseFloat(apartment?.area) || 0,
                bedrooms: apartment?.bedrooms,
                bathrooms: apartment?.bathrooms,
                balconies: apartment?.balconies,
                parkingSlots: apartment?.parkingSlots,
                monthlyRent: parseFloat(apartment?.monthlyRent) || 0,
                salePrice: parseFloat(apartment?.salePrice) || 0,
                maintenanceFee: parseFloat(apartment?.maintenanceFee) || 0,
                status: apartment?.status,
                description: apartment?.description,
                amenities: apartment?.amenities || [],
                images: apartment?.images || [],
                isListedForRent: apartment?.isListedForRent,
                isListedForSale: apartment?.isListedForSale
            },

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

                // Check if apartment is available for transaction
                const availableStatuses = ['for_rent', 'for_sale'];
                if (!availableStatuses.includes(apartment.status)) {
                    throw new Error(`Apartment ${apartment.apartmentNumber} is no longer available (status: ${apartment.status})`);
                }

                // Check if mode matches apartment status (listing flags may be false if reserved from approved lease)
                if (item.mode === 'rent' && apartment.status !== 'for_rent') {
                    throw new Error(`Apartment ${apartment.apartmentNumber} is not available for rent`);
                }
                if (item.mode === 'buy' && apartment.status !== 'for_sale') {
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

                // Create billing record first
                const { Billing } = require('../models');
                const billing = await Billing.create({
                    apartmentId: apartment.id,
                    billType: cartItem.mode === 'rent' ? 'rent' : 'other',
                    description: `${cartItem.mode === 'rent' ? 'Rent' : 'Purchase'} payment for apartment ${apartment.apartmentNumber}`,
                    amount: amount,
                    billDate: new Date(),
                    dueDate: new Date(),
                    status: 'paid',
                    lateFee: 0,
                    totalAmount: amount,
                    billPeriodStart: new Date(),
                    billPeriodEnd: new Date(),
                    notes: note || `Checkout payment via cart`,
                    createdBy: userId,
                    isActive: true
                }, { transaction });

                // Create payment record linked to billing
                const payment = await Payment.create({
                    apartmentId: apartment.id,
                    billingId: billing.id,
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

                // Update apartment status to occupied after successful checkout
                const updateData = {
                    status: 'occupied',
                    isListedForRent: false,
                    isListedForSale: false
                };

                if (cartItem.mode === 'buy') {
                    updateData.ownerId = userId;
                    updateData.tenantId = null;  // Clear tenant if buying
                } else {
                    updateData.tenantId = userId;
                }

                await apartment.update(updateData, { transaction });

                // Create household member entry with user info
                await HouseholdMember.create({
                    apartmentId: apartment.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    relationship: cartItem.mode === 'buy' ? 'owner' : 'tenant',
                    dateOfBirth: user.dateOfBirth || null,
                    phoneNumber: user.phone || null,
                    email: user.email,
                    moveInDate: new Date(),
                    isActive: true
                }, { transaction });

                // Delete completed lease request (approved + checked out)
                await LeaseRequest.destroy({
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
                apartments: completedApartments.map(a => ({
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

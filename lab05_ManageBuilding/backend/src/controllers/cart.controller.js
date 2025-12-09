const cartService = require('../services/cart.service');

class CartController {
    /**
     * Get user's cart
     * GET /api/cart
     */
    async getCart(req, res) {
        try {
            const userId = req.user.id;
            const summary = await cartService.getCartSummary(userId);

            res.status(200).json({
                success: true,
                data: summary
            });
        } catch (error) {
            console.error('Get cart error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Add item to cart
     * POST /api/cart
     */
    async addToCart(req, res) {
        try {
            const userId = req.user.id;
            const { apartmentId, mode, months, note } = req.body;

            // Validation
            if (!apartmentId || !mode) {
                return res.status(400).json({
                    success: false,
                    message: 'Apartment ID and mode are required'
                });
            }

            if (!['rent', 'buy'].includes(mode)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid mode. Must be "rent" or "buy"'
                });
            }

            if (mode === 'rent' && (!months || months < 1)) {
                return res.status(400).json({
                    success: false,
                    message: 'Months must be at least 1 for rental'
                });
            }

            const item = await cartService.addToCart(userId, {
                apartmentId,
                mode,
                months: mode === 'rent' ? months : null,
                note
            });

            res.status(201).json({
                success: true,
                message: 'Item added to cart',
                data: item
            });
        } catch (error) {
            console.error('Add to cart error:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Update cart item
     * PATCH /api/cart/:id
     */
    async updateCartItem(req, res) {
        try {
            const userId = req.user.id;
            const cartItemId = req.params.id;
            const updates = req.body;

            // Validate updates
            if (updates.months !== undefined && updates.months < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Months must be at least 1'
                });
            }

            const item = await cartService.updateCartItem(userId, cartItemId, updates);

            res.status(200).json({
                success: true,
                message: 'Cart item updated',
                data: item
            });
        } catch (error) {
            console.error('Update cart item error:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Remove item from cart
     * DELETE /api/cart/:id
     */
    async removeFromCart(req, res) {
        try {
            const userId = req.user.id;
            const cartItemId = req.params.id;

            await cartService.removeFromCart(userId, cartItemId);

            res.status(200).json({
                success: true,
                message: 'Item removed from cart'
            });
        } catch (error) {
            console.error('Remove from cart error:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Clear cart
     * DELETE /api/cart
     */
    async clearCart(req, res) {
        try {
            const userId = req.user.id;
            await cartService.clearCart(userId);

            res.status(200).json({
                success: true,
                message: 'Cart cleared'
            });
        } catch (error) {
            console.error('Clear cart error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Toggle item selection
     * PATCH /api/cart/:id/select
     */
    async toggleSelection(req, res) {
        try {
            const userId = req.user.id;
            const cartItemId = req.params.id;
            const { selected } = req.body;

            if (typeof selected !== 'boolean') {
                return res.status(400).json({
                    success: false,
                    message: 'Selected must be a boolean'
                });
            }

            const item = await cartService.toggleSelection(userId, cartItemId, selected);

            res.status(200).json({
                success: true,
                message: 'Selection updated',
                data: item
            });
        } catch (error) {
            console.error('Toggle selection error:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Select all items
     * POST /api/cart/select-all
     */
    async selectAll(req, res) {
        try {
            const userId = req.user.id;
            const { selected = true } = req.body;

            const items = await cartService.selectAll(userId, selected);

            res.status(200).json({
                success: true,
                message: `All items ${selected ? 'selected' : 'deselected'}`,
                data: items
            });
        } catch (error) {
            console.error('Select all error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get cart summary
     * GET /api/cart/summary
     */
    async getSummary(req, res) {
        try {
            const userId = req.user.id;
            const summary = await cartService.getCartSummary(userId);

            res.status(200).json({
                success: true,
                data: summary
            });
        } catch (error) {
            console.error('Get summary error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new CartController();

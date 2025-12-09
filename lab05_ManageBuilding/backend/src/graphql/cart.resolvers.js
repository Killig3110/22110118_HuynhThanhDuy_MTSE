const cartService = require('../services/cart.service');

const cartResolvers = {
    Query: {
        /**
         * Get user's cart with all items and summary
         */
        myCart: async (_, __, { user }) => {
            if (!user) {
                throw new Error('Authentication required');
            }

            return await cartService.getCartSummary(user.id);
        },

        /**
         * Get cart summary only
         */
        cartSummary: async (_, __, { user }) => {
            if (!user) {
                throw new Error('Authentication required');
            }

            const data = await cartService.getCartSummary(user.id);
            return data.summary;
        }
    },

    Mutation: {
        /**
         * Add item to cart
         */
        addToCart: async (_, { input }, { user }) => {
            if (!user) {
                throw new Error('Authentication required');
            }

            const { apartmentId, mode, months, note } = input;

            return await cartService.addToCart(user.id, {
                apartmentId,
                mode: mode.toLowerCase(),
                months,
                note
            });
        },

        /**
         * Update cart item
         */
        updateCartItem: async (_, { id, input }, { user }) => {
            if (!user) {
                throw new Error('Authentication required');
            }

            return await cartService.updateCartItem(user.id, id, input);
        },

        /**
         * Remove item from cart
         */
        removeFromCart: async (_, { id }, { user }) => {
            if (!user) {
                throw new Error('Authentication required');
            }

            await cartService.removeFromCart(user.id, id);
            return true;
        },

        /**
         * Toggle cart item selection
         */
        toggleCartItemSelection: async (_, { id, selected }, { user }) => {
            if (!user) {
                throw new Error('Authentication required');
            }

            return await cartService.toggleSelection(user.id, id, selected);
        },

        /**
         * Select/deselect all cart items
         */
        selectAllCartItems: async (_, { selected = true }, { user }) => {
            if (!user) {
                throw new Error('Authentication required');
            }

            return await cartService.selectAll(user.id, selected);
        },

        /**
         * Clear all cart items
         */
        clearCart: async (_, __, { user }) => {
            if (!user) {
                throw new Error('Authentication required');
            }

            await cartService.clearCart(user.id);
            return true;
        }
    },

    CartItem: {
        /**
         * Resolve apartment details for cart item
         */
        apartment: async (cartItem) => {
            // Return apartment data from the already loaded association
            return cartItem.apartment;
        }
    }
};

module.exports = cartResolvers;

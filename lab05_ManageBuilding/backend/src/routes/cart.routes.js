const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { authMiddleware } = require('../middleware/auth');

// All cart routes require authentication
router.use(authMiddleware);

// Cart viewing operations (READ ONLY)
router.get('/', cartController.getCart);
router.get('/summary', cartController.getSummary);

// Selection operations (user can select/deselect items for checkout)
router.patch('/:id/select', cartController.toggleSelection);
router.post('/select-all', cartController.selectAll);

// Checkout cart items (REST API backup - GraphQL is preferred)
router.post('/checkout', cartController.checkout);

// ❌ REMOVED: addToCart - Cart items auto-created when lease approved
// ❌ REMOVED: updateCartItem - Price fixed at approval time
// ❌ REMOVED: removeFromCart - User cannot remove approved items
// ❌ REMOVED: clearCart - Cleared automatically after checkout

module.exports = router;

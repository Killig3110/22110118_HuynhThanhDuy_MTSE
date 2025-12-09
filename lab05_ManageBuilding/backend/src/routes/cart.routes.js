const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { authMiddleware } = require('../middleware/auth');

// All cart routes require authentication
router.use(authMiddleware);

// Cart operations
router.get('/', cartController.getCart);
router.get('/summary', cartController.getSummary);
router.post('/', cartController.addToCart);
router.patch('/:id', cartController.updateCartItem);
router.delete('/:id', cartController.removeFromCart);
router.delete('/', cartController.clearCart);

// Selection operations
router.patch('/:id/select', cartController.toggleSelection);
router.post('/select-all', cartController.selectAll);

module.exports = router;

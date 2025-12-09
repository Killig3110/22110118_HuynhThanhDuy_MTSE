const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const favoriteController = require('../controllers/favorite.controller');

// Add apartment to favorites
router.post('/:apartmentId', authMiddleware, favoriteController.addFavorite);

// Remove apartment from favorites
router.delete('/:apartmentId', authMiddleware, favoriteController.removeFavorite);

// Get all favorites for current user
router.get('/', authMiddleware, favoriteController.getFavorites);

// Check if apartment is favorited
router.get('/check/:apartmentId', authMiddleware, favoriteController.checkFavorite);

module.exports = router;

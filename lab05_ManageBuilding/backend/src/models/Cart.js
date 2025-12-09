const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Cart = sequelize.define('Cart', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        },
        comment: 'User who owns this cart item'
    },
    apartmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'apartments',
            key: 'id'
        },
        comment: 'Apartment in the cart'
    },
    mode: {
        type: DataTypes.ENUM('rent', 'buy'),
        allowNull: false,
        defaultValue: 'rent',
        comment: 'Whether user wants to rent or buy'
    },
    months: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 12,
        validate: {
            min: 1,
            max: 60
        },
        comment: 'Number of months for rental (null for purchase)'
    },
    selected: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Whether this item is selected for checkout'
    },
    priceSnapshot: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Price at the time of adding to cart (for reference)'
    },
    depositSnapshot: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Deposit amount at the time of adding to cart'
    },
    maintenanceFeeSnapshot: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Maintenance fee at the time of adding to cart'
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'User notes for this cart item'
    },
    addedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        comment: 'When the item was added to cart'
    }
}, {
    tableName: 'carts',
    timestamps: true,
    indexes: [
        {
            fields: ['user_id']
        },
        {
            fields: ['apartment_id']
        },
        {
            unique: true,
            fields: ['user_id', 'apartment_id', 'mode'],
            name: 'unique_cart_item'
        }
    ],
    hooks: {
        beforeValidate: (cart) => {
            // If mode is 'buy', set months to null
            if (cart.mode === 'buy') {
                cart.months = null;
            }
            // If mode is 'rent', ensure months is set
            if (cart.mode === 'rent' && !cart.months) {
                cart.months = 12;
            }
        }
    }
});

module.exports = Cart;

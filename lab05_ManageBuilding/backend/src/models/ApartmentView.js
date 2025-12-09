const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ApartmentView = sequelize.define('ApartmentView', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        },
        onDelete: 'SET NULL',
        comment: 'Nullable for guest views'
    },
    apartmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'apartments',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    viewedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    ipAddress: {
        type: DataTypes.STRING(45),
        allowNull: true,
        comment: 'IPv4 or IPv6 address for guest tracking'
    }
}, {
    tableName: 'apartment_views',
    timestamps: false,
    indexes: [
        {
            fields: ['user_id', 'viewed_at']
        },
        {
            fields: ['apartment_id']
        },
        {
            fields: ['ip_address', 'apartment_id', 'viewed_at']
        }
    ]
});

module.exports = ApartmentView;

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ApartmentFavorite = sequelize.define('ApartmentFavorite', {
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
        onDelete: 'CASCADE'
    },
    apartmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'apartments',
            key: 'id'
        },
        onDelete: 'CASCADE'
    }
}, {
    tableName: 'apartment_favorites',
    timestamps: true,
    updatedAt: false,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'apartment_id'],
            name: 'unique_user_apartment_favorite'
        },
        {
            fields: ['user_id']
        },
        {
            fields: ['apartment_id']
        }
    ]
});

module.exports = ApartmentFavorite;

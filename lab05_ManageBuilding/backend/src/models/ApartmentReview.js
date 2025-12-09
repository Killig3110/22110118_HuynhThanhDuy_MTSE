const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ApartmentReview = sequelize.define('ApartmentReview', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5,
            isInt: true
        },
        comment: 'Rating from 1 to 5 stars'
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            len: [0, 2000]
        }
    }
}, {
    tableName: 'apartment_reviews',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'apartment_id'],
            name: 'unique_user_apartment_review'
        },
        {
            fields: ['apartment_id']
        },
        {
            fields: ['user_id']
        },
        {
            fields: ['rating']
        }
    ]
});

module.exports = ApartmentReview;

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Floor = sequelize.define('Floor', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    floorNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: -5, // Allows for basement levels
            max: 200
        }
    },
    buildingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'buildings',
            key: 'id'
        }
    },
    totalApartments: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    floorPlan: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Floor plan description or layout details'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'floors',
    indexes: [
        {
            fields: ['building_id']
        },
        {
            fields: ['building_id', 'floor_number'],
            unique: true
        }
    ]
});

module.exports = Floor;
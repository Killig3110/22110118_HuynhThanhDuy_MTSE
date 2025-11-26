const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LeaseRequest = sequelize.define('LeaseRequest', {
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
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    type: {
        type: DataTypes.ENUM('rent', 'buy'),
        allowNull: false,
        defaultValue: 'rent'
    },
    status: {
        type: DataTypes.ENUM('pending_owner', 'pending_manager', 'approved', 'rejected', 'cancelled'),
        defaultValue: 'pending_manager'
    },
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    endDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    monthlyRent: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    totalPrice: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true
    },
    note: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    decisionBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    decisionAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'lease_requests',
    indexes: [
        { fields: ['apartment_id'] },
        { fields: ['user_id'] },
        { fields: ['status'] },
        { fields: ['type'] }
    ]
});

module.exports = LeaseRequest;

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Billing = sequelize.define('Billing', {
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
    billType: {
        type: DataTypes.ENUM('maintenance', 'utility', 'rent', 'parking', 'amenity', 'penalty', 'other'),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    billDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    dueDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'paid', 'overdue', 'cancelled'),
        defaultValue: 'pending'
    },
    lateFee: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    billPeriodStart: {
        type: DataTypes.DATE,
        allowNull: true
    },
    billPeriodEnd: {
        type: DataTypes.DATE,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'billings',
    indexes: [
        {
            fields: ['apartment_id']
        },
        {
            fields: ['status']
        },
        {
            fields: ['due_date']
        },
        {
            fields: ['bill_type']
        },
        {
            fields: ['created_by']
        }
    ]
});

module.exports = Billing;
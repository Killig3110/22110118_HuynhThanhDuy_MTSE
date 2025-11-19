const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    billingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'billings',
            key: 'id'
        }
    },
    apartmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'apartments',
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    paymentDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    paymentMethod: {
        type: DataTypes.ENUM('cash', 'check', 'bank_transfer', 'credit_card', 'debit_card', 'digital_wallet', 'other'),
        allowNull: false
    },
    transactionId: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true
    },
    reference: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('successful', 'pending', 'failed', 'cancelled', 'refunded'),
        defaultValue: 'pending'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    receivedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    receiptNumber: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'payments',
    indexes: [
        {
            fields: ['billing_id']
        },
        {
            fields: ['apartment_id']
        },
        {
            fields: ['status']
        },
        {
            fields: ['payment_date']
        },
        {
            fields: ['received_by']
        },
        {
            fields: ['transaction_id']
        }
    ]
});

module.exports = Payment;
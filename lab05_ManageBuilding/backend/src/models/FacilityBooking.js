const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FacilityBooking = sequelize.define('FacilityBooking', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    facilityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'facilities',
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
    bookedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    bookingDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    startTime: {
        type: DataTypes.TIME,
        allowNull: false
    },
    endTime: {
        type: DataTypes.TIME,
        allowNull: false
    },
    numberOfGuests: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        validate: {
            min: 1,
            max: 100
        }
    },
    purpose: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    bookingFee: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    securityDeposit: {
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
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show'),
        defaultValue: 'pending'
    },
    paymentStatus: {
        type: DataTypes.ENUM('pending', 'paid', 'refunded', 'cancelled'),
        defaultValue: 'pending'
    },
    approvedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    approvedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    cancelledAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    cancellationReason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    specialRequests: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'facility_bookings',
    indexes: [
        {
            fields: ['facility_id']
        },
        {
            fields: ['apartment_id']
        },
        {
            fields: ['booked_by']
        },
        {
            fields: ['booking_date']
        },
        {
            fields: ['status']
        },
        {
            fields: ['approved_by']
        },
        {
            fields: ['facility_id', 'booking_date', 'start_time', 'end_time']
        }
    ]
});

module.exports = FacilityBooking;
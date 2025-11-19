const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Facility = sequelize.define('Facility', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    blockId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'blocks',
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 100]
        }
    },
    type: {
        type: DataTypes.ENUM('gym', 'swimming_pool', 'clubhouse', 'playground', 'parking', 'conference_room', 'garden', 'sports_court', 'library', 'spa', 'other'),
        allowNull: false
    },
    location: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Location within the building/complex'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1
        }
    },
    operatingHours: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'JSON object with daily operating hours'
    },
    bookingRequired: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    advanceBookingDays: {
        type: DataTypes.INTEGER,
        defaultValue: 7,
        validate: {
            min: 0,
            max: 365
        }
    },
    bookingFee: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    rules: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    amenities: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'JSON array of facility amenities'
    },
    maintenanceSchedule: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'JSON object with maintenance schedule'
    },
    managerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('available', 'under_maintenance', 'out_of_order', 'temporarily_closed'),
        defaultValue: 'available'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'facilities',
    indexes: [
        {
            fields: ['block_id']
        },
        {
            fields: ['type']
        },
        {
            fields: ['status']
        },
        {
            fields: ['manager_id']
        }
    ]
});

module.exports = Facility;
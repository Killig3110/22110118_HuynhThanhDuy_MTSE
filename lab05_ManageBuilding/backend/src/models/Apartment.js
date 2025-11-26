const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Apartment = sequelize.define('Apartment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    apartmentNumber: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 20]
        }
    },
    floorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'floors',
            key: 'id'
        }
    },
    ownerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        },
        comment: 'Owner of the apartment'
    },
    tenantId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        },
        comment: 'Current tenant/renter'
    },
    type: {
        type: DataTypes.ENUM('studio', '1bhk', '2bhk', '3bhk', '4bhk', 'penthouse', 'duplex'),
        allowNull: false,
        defaultValue: '2bhk'
    },
    area: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        validate: {
            min: 0
        },
        comment: 'Area in square feet'
    },
    bedrooms: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
            max: 10
        }
    },
    bathrooms: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 10
        }
    },
    balconies: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 5
        }
    },
    parkingSlots: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 10
        }
    },
    monthlyRent: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
            min: 0
        }
    },
    salePrice: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        validate: {
            min: 0
        }
    },
    isListedForRent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isListedForSale: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    maintenanceFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    status: {
        type: DataTypes.ENUM('vacant', 'occupied', 'under_renovation', 'for_rent', 'for_sale'),
        defaultValue: 'vacant'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    amenities: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'JSON array of apartment amenities'
    },
    leaseStartDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    leaseEndDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'apartments',
    indexes: [
        {
            fields: ['floor_id']
        },
        {
            fields: ['owner_id']
        },
        {
            fields: ['tenant_id']
        },
        {
            fields: ['status']
        },
        {
            fields: ['floor_id', 'apartment_number'],
            unique: true
        }
    ]
});

module.exports = Apartment;

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Visitor = sequelize.define('Visitor', {
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
    visitorName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 100]
        }
    },
    visitorPhone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
            len: [10, 20]
        }
    },
    visitorEmail: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
            isEmail: true
        }
    },
    idProofType: {
        type: DataTypes.ENUM('passport', 'driving_license', 'national_id', 'voter_id', 'other'),
        allowNull: true
    },
    idProofNumber: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    purposeOfVisit: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    visitDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    expectedArrival: {
        type: DataTypes.DATE,
        allowNull: true
    },
    actualArrival: {
        type: DataTypes.DATE,
        allowNull: true
    },
    actualDeparture: {
        type: DataTypes.DATE,
        allowNull: true
    },
    vehicleNumber: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    numberOfGuests: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        validate: {
            min: 1,
            max: 20
        }
    },
    approvedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        },
        comment: 'Resident who approved the visit'
    },
    registeredBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        },
        comment: 'Security personnel who registered the visit'
    },
    status: {
        type: DataTypes.ENUM('scheduled', 'arrived', 'departed', 'cancelled', 'no_show'),
        defaultValue: 'scheduled'
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
    tableName: 'visitors',
    indexes: [
        {
            fields: ['apartment_id']
        },
        {
            fields: ['visit_date']
        },
        {
            fields: ['status']
        },
        {
            fields: ['approved_by']
        },
        {
            fields: ['registered_by']
        }
    ]
});

module.exports = Visitor;
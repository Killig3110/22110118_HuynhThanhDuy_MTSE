const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HouseholdMember = sequelize.define('HouseholdMember', {
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
    firstName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 50]
        }
    },
    lastName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 50]
        }
    },
    relationship: {
        type: DataTypes.ENUM('owner', 'tenant', 'spouse', 'child', 'parent', 'sibling', 'relative', 'guest', 'other'),
        allowNull: false
    },
    dateOfBirth: {
        type: DataTypes.DATE,
        allowNull: true
    },
    phoneNumber: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
            len: [10, 20]
        }
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
            isEmail: true
        }
    },
    emergencyContact: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
            len: [10, 20]
        }
    },
    occupation: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    idProofType: {
        type: DataTypes.ENUM('passport', 'driving_license', 'national_id', 'voter_id', 'other'),
        allowNull: true
    },
    idProofNumber: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    moveInDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    moveOutDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'household_members',
    indexes: [
        {
            fields: ['apartment_id']
        },
        {
            fields: ['phone_number']
        },
        {
            fields: ['email']
        }
    ]
});

module.exports = HouseholdMember;
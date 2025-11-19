const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            len: [6, 255]
        }
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
            len: [10, 20]
        }
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    dateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        validate: {
            isDate: true,
            isBefore: new Date().toISOString().split('T')[0]
        }
    },
    avatar: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true
    },
    resetPasswordToken: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true
    },

    // Role and Position references (to be associated)
    roleId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Roles',
            key: 'id'
        }
    },
    positionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Positions',
            key: 'id'
        }
    },

    // Role-specific fields
    emergencyContact: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
            len: [10, 20]
        }
    },
    apartmentNumber: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    badgeNumber: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    licenseNumber: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    specialization: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    workSchedule: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    shiftSchedule: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    certifications: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    vehicleInfo: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    occupancyType: {
        type: DataTypes.ENUM('Owner', 'Tenant', 'Guest'),
        allowNull: true
    },
    systemAccess: {
        type: DataTypes.ENUM('Full', 'Limited'),
        allowNull: true
    },
    managedBuildingsList: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    hooks: {
        beforeCreate: async (user) => {
            // Password should already be hashed in controller
            // Only hash if it's still plain text
            if (user.password && !user.password.startsWith('$2a$')) {
                user.password = await bcrypt.hash(user.password, 12);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password') && !user.password.startsWith('$2a$')) {
                user.password = await bcrypt.hash(user.password, 12);
            }
        }
    }
});

// Instance methods
User.prototype.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toJSON = function () {
    const userObject = Object.assign({}, this.get());
    delete userObject.password;
    delete userObject.resetPasswordToken;
    delete userObject.resetPasswordExpires;
    return userObject;
};

module.exports = User;
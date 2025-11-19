const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Building = sequelize.define('Building', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 100]
        }
    },
    blockId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'blocks',
            key: 'id'
        }
    },
    buildingCode: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 20]
        },
        comment: 'Building code like S.01, S.02, A.01, B.05, etc.'
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    city: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    state: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    zipCode: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    totalFloors: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 200
        }
    },
    constructionYear: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1900,
            max: new Date().getFullYear()
        }
    },
    managerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'under_construction', 'maintenance', 'inactive'),
        defaultValue: 'active'
    },
    amenities: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'JSON array of building amenities like parking, gym, pool, etc.'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'buildings',
    indexes: [
        {
            fields: ['manager_id']
        },
        {
            fields: ['status']
        },
        {
            fields: ['city']
        }
    ]
});

module.exports = Building;
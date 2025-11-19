const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Block = sequelize.define('Block', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 50]
        }
    },
    blockCode: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            len: [1, 10]
        },
        comment: 'Block code like S, A, B, C, etc.'
    },
    location: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: 'Physical location or address of the block'
    },
    totalBuildings: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: 1,
            max: 50
        },
        comment: 'Total number of buildings in this block'
    },
    managerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        },
        comment: 'Block manager or supervisor'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'blocks',
    indexes: [
        {
            fields: ['block_code']
        }
    ]
});

module.exports = Block;
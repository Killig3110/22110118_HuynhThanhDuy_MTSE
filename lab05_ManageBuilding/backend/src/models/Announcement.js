const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Announcement = sequelize.define('Announcement', {
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
    title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [5, 200]
        }
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    type: {
        type: DataTypes.ENUM('general', 'maintenance', 'emergency', 'event', 'policy', 'billing', 'facility', 'other'),
        allowNull: false,
        defaultValue: 'general'
    },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium'
    },
    targetAudience: {
        type: DataTypes.ENUM('all_residents', 'owners_only', 'tenants_only', 'specific_apartments', 'specific_floors', 'specific_blocks'),
        defaultValue: 'all_residents'
    },
    targetIds: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array of apartment/floor/block IDs when targetAudience is specific'
    },
    publishDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    expiryDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    attachments: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array of file attachments'
    },
    isUrgent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    requiresAcknowledgment: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    acknowledgedBy: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array of user IDs who acknowledged the announcement'
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('draft', 'published', 'archived', 'expired'),
        defaultValue: 'draft'
    },
    viewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'announcements',
    indexes: [
        {
            fields: ['block_id']
        },
        {
            fields: ['type']
        },
        {
            fields: ['priority']
        },
        {
            fields: ['publish_date']
        },
        {
            fields: ['status']
        },
        {
            fields: ['created_by']
        },
        {
            fields: ['is_urgent']
        }
    ]
});

module.exports = Announcement;
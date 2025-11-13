const User = require('./User');
const Role = require('./Role');
const Position = require('./Position');

// Define associations
User.belongsTo(Role, {
    foreignKey: 'roleId',
    as: 'role'
});
Role.hasMany(User, {
    foreignKey: 'roleId',
    as: 'users'
});

User.belongsTo(Position, {
    foreignKey: 'positionId',
    as: 'position'
});
Position.hasMany(User, {
    foreignKey: 'positionId',
    as: 'users'
});

module.exports = {
    User,
    Role,
    Position
};
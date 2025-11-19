const User = require('./User');
const Role = require('./Role');
const Position = require('./Position');
const Building = require('./Building');
const Block = require('./Block');
const Floor = require('./Floor');
const Apartment = require('./Apartment');
const HouseholdMember = require('./HouseholdMember');
const Billing = require('./Billing');
const Payment = require('./Payment');
const Visitor = require('./Visitor');
const Facility = require('./Facility');
const FacilityBooking = require('./FacilityBooking');
const Announcement = require('./Announcement');

// User associations (existing)
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

// Building Management Associations

// Block associations (Block là cấp cao nhất)
Block.belongsTo(User, {
    foreignKey: 'managerId',
    as: 'manager'
});
User.hasMany(Block, {
    foreignKey: 'managerId',
    as: 'managedBlocks'
});

// Building associations (Building thuộc về Block)
Building.belongsTo(Block, {
    foreignKey: 'blockId',
    as: 'block'
});
Block.hasMany(Building, {
    foreignKey: 'blockId',
    as: 'buildings'
});

Building.belongsTo(User, {
    foreignKey: 'managerId',
    as: 'manager'
});
User.hasMany(Building, {
    foreignKey: 'managerId',
    as: 'managedBuildings'
});

// Floor associations (Floor thuộc về Building)
Floor.belongsTo(Building, {
    foreignKey: 'buildingId',
    as: 'building'
});
Building.hasMany(Floor, {
    foreignKey: 'buildingId',
    as: 'floors'
});

// Apartment associations (Apartment thuộc về Floor)
Apartment.belongsTo(Floor, {
    foreignKey: 'floorId',
    as: 'floor'
});
Floor.hasMany(Apartment, {
    foreignKey: 'floorId',
    as: 'apartments'
});

Apartment.belongsTo(User, {
    foreignKey: 'ownerId',
    as: 'owner'
});
User.hasMany(Apartment, {
    foreignKey: 'ownerId',
    as: 'ownedApartments'
});

Apartment.belongsTo(User, {
    foreignKey: 'tenantId',
    as: 'tenant'
});
User.hasMany(Apartment, {
    foreignKey: 'tenantId',
    as: 'rentedApartments'
});

// Household Member associations
HouseholdMember.belongsTo(Apartment, {
    foreignKey: 'apartmentId',
    as: 'apartment'
});
Apartment.hasMany(HouseholdMember, {
    foreignKey: 'apartmentId',
    as: 'householdMembers'
});

// Billing associations
Billing.belongsTo(Apartment, {
    foreignKey: 'apartmentId',
    as: 'apartment'
});
Apartment.hasMany(Billing, {
    foreignKey: 'apartmentId',
    as: 'bills'
});

Billing.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator'
});
User.hasMany(Billing, {
    foreignKey: 'createdBy',
    as: 'createdBills'
});

// Payment associations
Payment.belongsTo(Billing, {
    foreignKey: 'billingId',
    as: 'bill'
});
Billing.hasMany(Payment, {
    foreignKey: 'billingId',
    as: 'payments'
});

Payment.belongsTo(Apartment, {
    foreignKey: 'apartmentId',
    as: 'apartment'
});
Apartment.hasMany(Payment, {
    foreignKey: 'apartmentId',
    as: 'payments'
});

Payment.belongsTo(User, {
    foreignKey: 'receivedBy',
    as: 'receiver'
});
User.hasMany(Payment, {
    foreignKey: 'receivedBy',
    as: 'receivedPayments'
});

// Visitor associations
Visitor.belongsTo(Apartment, {
    foreignKey: 'apartmentId',
    as: 'apartment'
});
Apartment.hasMany(Visitor, {
    foreignKey: 'apartmentId',
    as: 'visitors'
});

Visitor.belongsTo(User, {
    foreignKey: 'approvedBy',
    as: 'approver'
});
User.hasMany(Visitor, {
    foreignKey: 'approvedBy',
    as: 'approvedVisitors'
});

Visitor.belongsTo(User, {
    foreignKey: 'registeredBy',
    as: 'registrar'
});
User.hasMany(Visitor, {
    foreignKey: 'registeredBy',
    as: 'registeredVisitors'
});

// Facility associations
Facility.belongsTo(Block, {
    foreignKey: 'blockId',
    as: 'block'
});
Block.hasMany(Facility, {
    foreignKey: 'blockId',
    as: 'facilities'
});

Facility.belongsTo(User, {
    foreignKey: 'managerId',
    as: 'manager'
});
User.hasMany(Facility, {
    foreignKey: 'managerId',
    as: 'managedFacilities'
});

// Facility Booking associations
FacilityBooking.belongsTo(Facility, {
    foreignKey: 'facilityId',
    as: 'facility'
});
Facility.hasMany(FacilityBooking, {
    foreignKey: 'facilityId',
    as: 'bookings'
});

FacilityBooking.belongsTo(Apartment, {
    foreignKey: 'apartmentId',
    as: 'apartment'
});
Apartment.hasMany(FacilityBooking, {
    foreignKey: 'apartmentId',
    as: 'facilityBookings'
});

FacilityBooking.belongsTo(User, {
    foreignKey: 'bookedBy',
    as: 'booker'
});
User.hasMany(FacilityBooking, {
    foreignKey: 'bookedBy',
    as: 'facilityBookings'
});

FacilityBooking.belongsTo(User, {
    foreignKey: 'approvedBy',
    as: 'approver'
});
User.hasMany(FacilityBooking, {
    foreignKey: 'approvedBy',
    as: 'approvedBookings'
});

// Announcement associations
Announcement.belongsTo(Block, {
    foreignKey: 'block_id',
    as: 'block'
});
Block.hasMany(Announcement, {
    foreignKey: 'block_id',
    as: 'announcements'
});

Announcement.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator'
});
User.hasMany(Announcement, {
    foreignKey: 'createdBy',
    as: 'createdAnnouncements'
});

module.exports = {
    User,
    Role,
    Position,
    Building,
    Block,
    Floor,
    Apartment,
    HouseholdMember,
    Billing,
    Payment,
    Visitor,
    Facility,
    FacilityBooking,
    Announcement
};
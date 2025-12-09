const { sequelize } = require('../config/database');
const models = require('../models');

async function syncDatabase() {
    try {
        console.log('🔄 Starting database synchronization...');

        // Test connection
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');

        // Disable foreign key checks to allow dropping tables with foreign keys
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

        // Sync all models
        // alter: true will update existing tables to match models
        // force: true will drop and recreate tables (use with caution!)
        // USING FORCE=TRUE TO UPDATE ENUM VALUES
        await sequelize.sync({ force: true });

        // Re-enable foreign key checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('✅ Database synchronized successfully!');
        console.log('📋 Tables synced:');
        console.log('  - Users');
        console.log('  - Roles');
        console.log('  - Positions');
        console.log('  - Blocks');
        console.log('  - Buildings');
        console.log('  - Floors');
        console.log('  - Apartments');
        console.log('  - HouseholdMembers');
        console.log('  - Billings');
        console.log('  - Payments');
        console.log('  - Visitors');
        console.log('  - Facilities');
        console.log('  - FacilityBookings');
        console.log('  - Announcements');
        console.log('  - LeaseRequests');
        console.log('  - Carts');
        console.log('  - ApartmentFavorites ⭐ (NEW)');
        console.log('  - ApartmentViews ⭐ (NEW)');
        console.log('  - ApartmentReviews ⭐ (NEW)');

        console.log('\n✨ New engagement tables created successfully!');
        console.log('   ApartmentFavorites:');
        console.log('     - userId -> Users, apartmentId -> Apartments');
        console.log('     - Unique constraint: user_id + apartment_id');
        console.log('   ApartmentViews:');
        console.log('     - userId (nullable) -> Users, apartmentId -> Apartments');
        console.log('     - Supports guest tracking via ipAddress');
        console.log('   ApartmentReviews:');
        console.log('     - userId -> Users, apartmentId -> Apartments');
        console.log('     - Rating 1-5, unique constraint: user_id + apartment_id');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error synchronizing database:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    syncDatabase();
}

module.exports = syncDatabase;

const { sequelize } = require('../config/database');
const models = require('../models');

async function syncDatabase() {
    try {
        console.log('🔄 Starting database synchronization...');

        // Test connection
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');

        // Sync all models
        // alter: true will update existing tables to match models
        // force: true will drop and recreate tables (use with caution!)
        await sequelize.sync({ alter: true });

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
        console.log('  - Carts ⭐ (NEW)');

        console.log('\n✨ Cart table created successfully with associations!');
        console.log('   - userId -> Users');
        console.log('   - apartmentId -> Apartments');
        console.log('   - Unique constraint: user_id + apartment_id + mode');

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

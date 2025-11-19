const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');
const { sequelize } = require('../config/database');
const {
    Role,
    Position,
    User,
    Block,
    Building,
    Floor,
    Apartment,
    HouseholdMember,
    Facility,
} = require('../models');

/**
 * Tạo database nếu chưa tồn tại
 */
async function createDatabase() {
    // Tạo connection tạm không gắn với DB cụ thể
    const tempConnection = new Sequelize(
        '', // No database specified
        process.env.DB_USERNAME || 'root',
        process.env.DB_PASSWORD || '1234',
        {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            dialect: 'mysql',
            logging: false,
        },
    );

    try {
        await tempConnection.authenticate();
        const dbName = process.env.DB_NAME || 'lab05_building_management';
        await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        console.log(`✅ Database '${dbName}' created or already exists`);
        await tempConnection.close();
    } catch (error) {
        console.error('❌ Failed to create database:', error);
        throw error;
    }
}

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');

        // 0. Create database if it doesn't exist
        console.log('🏗️ Creating database...');
        await createDatabase();

        // 1. Test and create database connection
        console.log('📡 Testing database connection...');
        await sequelize.authenticate();
        console.log('✅ Database connection successful');

        // 2. Sync database (create tables)
        console.log('🔄 Syncing database (force: true)...');
        // Disable foreign key checks temporarily
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        await sequelize.sync({ force: true }); // drop + recreate all tables
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✅ Database synced successfully');

        // 3. Seed Roles
        console.log('📝 Creating roles...');
        const roles = await Role.bulkCreate([
            { name: 'admin', description: 'Quản lý toàn hệ thống' },
            { name: 'building_manager', description: 'Quản lý tòa nhà cụ thể' },
            { name: 'resident', description: 'Cư dân sinh sống' },
            { name: 'security', description: 'Quản lý an ninh' },
            { name: 'technician', description: 'Bảo trì kỹ thuật' },
            { name: 'accountant', description: 'Quản lý tài chính' },
        ]);

        // 4. Seed Positions
        console.log('💼 Creating positions...');
        const positions = await Position.bulkCreate([
            {
                title: 'System Administrator',
                department: 'IT',
                description: 'Quản trị hệ thống chung',
            },
            {
                title: 'Block Manager',
                department: 'Management',
                description: 'Quản lý toàn bộ block',
            },
            {
                title: 'Building Manager',
                department: 'Management',
                description: 'Quản lý từng tòa nhà',
            },
            {
                title: 'Head of Security',
                department: 'Security',
                description: 'Trưởng bộ phận an ninh',
            },
            {
                title: 'Senior Technician',
                department: 'Maintenance',
                description: 'Kỹ thuật viên cao cấp',
            },
            {
                title: 'Chief Accountant',
                department: 'Finance',
                description: 'Kế toán trưởng',
            },
            {
                title: 'Resident',
                department: 'Residential',
                description: 'Cư dân',
            },
        ]);

        // 5. Create sample users
        console.log('👥 Creating users...');
        const hashedPassword = await bcrypt.hash('123456', 10);

        const users = await User.bulkCreate([
            {
                email: 'admin@building.com',
                password: hashedPassword,
                firstName: 'System',
                lastName: 'Admin',
                phone: '0900000001',
                roleId: roles[0].id, // admin
                positionId: positions[0].id,
                isActive: true,
            },
            {
                email: 'blockmanager@building.com',
                password: hashedPassword,
                firstName: 'Nguyễn',
                lastName: 'Văn Quản',
                phone: '0900000002',
                roleId: roles[1].id, // building_manager
                positionId: positions[1].id,
                isActive: true,
            },
            {
                email: 'buildingmanager@building.com',
                password: hashedPassword,
                firstName: 'Trần',
                lastName: 'Thị Lan',
                phone: '0900000003',
                roleId: roles[1].id, // building_manager
                positionId: positions[2].id,
                isActive: true,
            },
            {
                email: 'resident@building.com',
                password: hashedPassword,
                firstName: 'Lê',
                lastName: 'Văn Dân',
                phone: '0900000004',
                roleId: roles[2].id, // resident
                positionId: positions[6].id,
                isActive: true,
            },
            {
                email: 'security@building.com',
                password: hashedPassword,
                firstName: 'Phạm',
                lastName: 'Văn An',
                phone: '0900000005',
                roleId: roles[3].id, // security
                positionId: positions[3].id,
                isActive: true,
            },
            {
                email: 'student@building.com',
                password: hashedPassword,
                firstName: 'Huỳnh',
                lastName: 'Thành Duy',
                phone: '0900000006',
                roleId: roles[2].id, // resident
                positionId: positions[6].id,
                isActive: true,
            },
        ]);

        // 6. Create Block S
        console.log('🏢 Creating block...');
        const blockS = await Block.create({
            name: 'Khu S',
            blockCode: 'S',
            location: '268 Lý Thường Kiệt, Quận 10, TP.HCM',
            totalBuildings: 10,
            description: 'Khu chung cư sinh viên S',
            managerId: users[1].id, // Block Manager
            isActive: true,
        });

        // 7. Create Buildings S.01 to S.10
        console.log('🏗️ Creating buildings (S.01 - S.10)...');
        const buildings = [];
        for (let i = 1; i <= 10; i++) {
            const buildingCode = `S.${i.toString().padStart(2, '0')}`;
            const building = await Building.create({
                name: `Tòa nhà ${buildingCode}`,
                blockId: blockS.id,
                buildingCode: buildingCode,
                address: `268 Lý Thường Kiệt, Tòa ${buildingCode}`,
                city: 'TP.HCM',
                state: 'TP.HCM',
                zipCode: '700000',
                totalFloors: 20,
                constructionYear: 2020,
                managerId: users[2].id, // Building Manager
                description: `Tòa nhà sinh viên ${buildingCode}`,
                status: 'active',
                amenities: ['parking', 'elevator', 'security'],
                isActive: true,
            });
            buildings.push(building);
        }

        // 8. Create Floors for Building S.01 (sample)
        console.log('🏢 Creating floors for S.01...');
        const floors = [];
        for (let floorNumber = 1; floorNumber <= 20; floorNumber++) {
            const floor = await Floor.create({
                buildingId: buildings[0].id, // S.01
                floorNumber,
                totalApartments: 8,
                floorPlan: `Bố trí mặt bằng tầng ${floorNumber}`,
                isActive: true,
            });
            floors.push(floor);
        }

        // 9. Create Apartments for Floor 1-3 of S.01 (sample)
        console.log('🏠 Creating sample apartments (floors 1-3 of S.01)...');
        const apartments = [];
        for (let floorIndex = 0; floorIndex < 3; floorIndex++) {
            const floor = floors[floorIndex];
            for (let aptNumber = 1; aptNumber <= 8; aptNumber++) {
                const apartmentNumber = `${(floorIndex + 1)
                    .toString()
                    .padStart(2, '0')}${aptNumber.toString().padStart(2, '0')}`;
                const apartment = await Apartment.create({
                    apartmentNumber,
                    floorId: floor.id,
                    type: '2bhk',
                    area: 65.5,
                    bedrooms: 2,
                    bathrooms: 2,
                    balconies: 1,
                    parkingSlots: 0,
                    monthlyRent: 3500000,
                    maintenanceFee: 0,
                    status:
                        floorIndex === 0 && aptNumber <= 3 ? 'occupied' : 'vacant',
                    isActive: true,
                });
                apartments.push(apartment);
            }
        }

        // 10. Create Household Members for occupied apartments
        console.log('👨‍👩‍👧‍👦 Creating household members...');
        const occupiedApartments = apartments.filter(
            (apt) => apt.status === 'occupied',
        );

        for (const apt of occupiedApartments) {
            if (apt.apartmentNumber === '0101') {
                // Resident account: resident@building.com
                await HouseholdMember.create({
                    apartmentId: apt.id,
                    firstName: 'Lê',
                    lastName: 'Văn Dân',
                    relationship: 'owner',
                    dateOfBirth: '1985-03-15',
                    phoneNumber: '0900000004',
                    email: 'resident@building.com',
                    moveInDate: '2023-09-01',
                    isActive: true,
                });
            } else if (apt.apartmentNumber === '0102') {
                // Student account: student@building.com
                await HouseholdMember.create({
                    apartmentId: apt.id,
                    firstName: 'Huỳnh',
                    lastName: 'Thành Duy',
                    relationship: 'tenant',
                    dateOfBirth: '2001-08-20',
                    phoneNumber: '0900000006',
                    email: 'student@building.com',
                    moveInDate: '2024-01-15',
                    isActive: true,
                });
            } else {
                // Generic resident
                await HouseholdMember.create({
                    apartmentId: apt.id,
                    firstName: 'Cu',
                    lastName: `Dan ${apt.apartmentNumber}`,
                    relationship: 'owner',
                    dateOfBirth: '1990-01-01',
                    phoneNumber: `090000${apt.apartmentNumber}`,
                    moveInDate: '2023-09-01',
                    isActive: true,
                });
            }
        }

        // 11. Create Block Facilities
        console.log('🏊‍♂️ Creating block facilities...');
        const facilities = await Facility.bulkCreate([
            {
                blockId: blockS.id,
                name: 'Hồ bơi',
                type: 'swimming_pool',
                location: 'Tầng trệt, Khu trung tâm',
                description: 'Hồ bơi tiêu chuẩn Olympic',
                capacity: 50,
                operatingHours: {
                    open: '06:00',
                    close: '22:00',
                },
                bookingRequired: true,
                advanceBookingDays: 7,
                bookingFee: 50000,
                status: 'available',
                isActive: true,
            },
            {
                blockId: blockS.id,
                name: 'Phòng Gym',
                type: 'gym',
                location: 'Tầng 2, Khu trung tâm',
                description: 'Phòng tập gym với đầy đủ thiết bị',
                capacity: 30,
                operatingHours: {
                    open: '05:00',
                    close: '23:00',
                },
                bookingRequired: false,
                advanceBookingDays: 0,
                bookingFee: 0,
                status: 'available',
                isActive: true,
            },
            {
                blockId: blockS.id,
                name: 'Sân tennis',
                type: 'sports_court',
                location: 'Sân thượng',
                description: 'Sân tennis chuyên nghiệp',
                capacity: 4,
                operatingHours: {
                    open: '06:00',
                    close: '22:00',
                },
                bookingRequired: true,
                advanceBookingDays: 3,
                bookingFee: 100000,
                status: 'available',
                isActive: true,
            },
            {
                blockId: blockS.id,
                name: 'Phòng họp cư dân',
                type: 'conference_room',
                location: 'Tầng 1, Tòa S.01',
                description: 'Phòng họp lớn cho cư dân',
                capacity: 100,
                operatingHours: {
                    open: '08:00',
                    close: '22:00',
                },
                bookingRequired: true,
                advanceBookingDays: 7,
                bookingFee: 200000,
                status: 'available',
                isActive: true,
            },
        ]);

        // SUMMARY
        console.log('✅ Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`- ${roles.length} roles created`);
        console.log(`- ${positions.length} positions created`);
        console.log(`- ${users.length} users created`);
        console.log(`- 1 block created (Block S)`);
        console.log(`- ${buildings.length} buildings created (S.01 - S.10)`);
        console.log(`- ${floors.length} floors created (for S.01)`);
        console.log(`- ${apartments.length} apartments created (sample)`);
        console.log(`- ${occupiedApartments.length} household members created`);
        console.log(`- ${facilities.length} facilities created`);

        console.log('\n🔐 Test Accounts:');
        console.log('Admin:           admin@building.com          / 123456');
        console.log('Block Manager:   blockmanager@building.com   / 123456');
        console.log('BuildingManager: buildingmanager@building.com/ 123456');
        console.log('Resident:        resident@building.com       / 123456');
        console.log('Student:         student@building.com        / 123456');
        console.log('Security:        security@building.com       / 123456');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
}

module.exports = { seedDatabase };

// Run seeder if called directly: `node src/seeders/index.js`
if (require.main === module) {
    seedDatabase()
        .then(() => {
            console.log('✅ Seeder completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Seeder failed:', error);
            process.exit(1);
        });
}

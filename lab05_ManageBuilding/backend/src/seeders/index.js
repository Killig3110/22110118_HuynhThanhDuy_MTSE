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
    LeaseRequest,
} = require('../models');

/**
 * Tạo database nếu chưa tồn tại
 */
async function createDatabase() {
    const tempConnection = new Sequelize(
        '',
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
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        await sequelize.sync({ force: true });
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
        const roleMap = roles.reduce((acc, role) => {
            acc[role.name] = role;
            return acc;
        }, {});

        // 4. Seed Positions
        console.log('💼 Creating positions...');
        const positions = await Position.bulkCreate([
            { title: 'System Administrator', department: 'IT', description: 'Quản trị hệ thống chung' },
            { title: 'Block Manager', department: 'Management', description: 'Quản lý toàn bộ block' },
            { title: 'Building Manager', department: 'Management', description: 'Quản lý từng tòa nhà' },
            { title: 'Head of Security', department: 'Security', description: 'Trưởng bộ phận an ninh' },
            { title: 'Senior Technician', department: 'Maintenance', description: 'Kỹ thuật viên cao cấp' },
            { title: 'Chief Accountant', department: 'Finance', description: 'Kế toán trưởng' },
            { title: 'Resident', department: 'Residential', description: 'Cư dân' },
        ]);
        const positionMap = positions.reduce((acc, position) => {
            acc[position.title] = position;
            return acc;
        }, {});

        // 5. Create users (more residents + managers for multiple blocks/buildings)
        console.log('👥 Creating users...');
        const hashedPassword = await bcrypt.hash('123456', 10);

        const coreUsersPayload = [
            {
                email: 'admin@building.com',
                firstName: 'System',
                lastName: 'Admin',
                phone: '0900000001',
                roleId: roleMap.admin.id,
                positionId: positionMap['System Administrator'].id,
            },
            {
                email: 'blockmanager@building.com',
                firstName: 'Nguyễn',
                lastName: 'Văn Quản',
                phone: '0900000002',
                roleId: roleMap.building_manager.id,
                positionId: positionMap['Block Manager'].id,
            },
            {
                email: 'buildingmanager@building.com',
                firstName: 'Trần',
                lastName: 'Thị Lan',
                phone: '0900000003',
                roleId: roleMap.building_manager.id,
                positionId: positionMap['Building Manager'].id,
            },
            {
                email: 'resident@building.com',
                firstName: 'Lê',
                lastName: 'Văn Dân',
                phone: '0900000004',
                roleId: roleMap.resident.id,
                positionId: positionMap.Resident.id,
            },
            {
                email: 'security@building.com',
                firstName: 'Phạm',
                lastName: 'Văn An',
                phone: '0900000005',
                roleId: roleMap.security.id,
                positionId: positionMap['Head of Security'].id,
            },
            {
                email: 'student@building.com',
                firstName: 'Huỳnh',
                lastName: 'Thành Duy',
                phone: '0900000006',
                roleId: roleMap.resident.id,
                positionId: positionMap.Resident.id,
            },
            {
                email: 'blockmanagerA@building.com',
                firstName: 'Đặng',
                lastName: 'Thu Quản',
                phone: '0900000007',
                roleId: roleMap.building_manager.id,
                positionId: positionMap['Block Manager'].id,
            },
            {
                email: 'blockmanagerB@building.com',
                firstName: 'Phan',
                lastName: 'Hoài Quản',
                phone: '0900000008',
                roleId: roleMap.building_manager.id,
                positionId: positionMap['Block Manager'].id,
            },
            {
                email: 'buildingmanagerA@building.com',
                firstName: 'Bùi',
                lastName: 'Ngọc Lan',
                phone: '0900000009',
                roleId: roleMap.building_manager.id,
                positionId: positionMap['Building Manager'].id,
            },
            {
                email: 'buildingmanagerB@building.com',
                firstName: 'Lâm',
                lastName: 'Hải Đăng',
                phone: '0900000010',
                roleId: roleMap.building_manager.id,
                positionId: positionMap['Building Manager'].id,
            },
            {
                email: 'accountant@building.com',
                firstName: 'Trịnh',
                lastName: 'Thu Ngân',
                phone: '0900000011',
                roleId: roleMap.accountant.id,
                positionId: positionMap['Chief Accountant'].id,
            },
        ].map((user) => ({
            ...user,
            password: hashedPassword,
            isActive: true,
        }));

        const residentPayload = Array.from({ length: 12 }).map((_, idx) => ({
            email: `resident${idx + 1}@building.com`,
            firstName: 'Cư',
            lastName: `Dân ${idx + 1}`,
            phone: `09010000${(idx + 1).toString().padStart(2, '0')}`,
            roleId: roleMap.resident.id,
            positionId: positionMap.Resident.id,
            password: hashedPassword,
            isActive: true,
        }));

        const users = await User.bulkCreate([...coreUsersPayload, ...residentPayload], { returning: true });
        const userByEmail = users.reduce((acc, user) => {
            acc[user.email] = user;
            return acc;
        }, {});
        const residentUsers = users.filter((u) => u.roleId === roleMap.resident.id);

        // 6. Create multiple blocks (A, B, S)
        console.log('🏢 Creating blocks A/B/S...');
        const blockConfigs = [
            {
                name: 'Khu A',
                blockCode: 'A',
                location: '12 Nguyễn Huệ, Quận 1, TP.HCM',
                totalBuildings: 3,
                description: 'Khu cao cấp trung tâm',
                managerId: userByEmail['blockmanagerA@building.com']?.id || users[1].id,
            },
            {
                name: 'Khu B',
                blockCode: 'B',
                location: '45 Lê Văn Việt, Thủ Đức, TP.HCM',
                totalBuildings: 3,
                description: 'Khu tiện ích gia đình',
                managerId: userByEmail['blockmanagerB@building.com']?.id || users[1].id,
            },
            {
                name: 'Khu S',
                blockCode: 'S',
                location: '268 Lý Thường Kiệt, Quận 10, TP.HCM',
                totalBuildings: 4,
                description: 'Khu chung cư sinh viên S',
                managerId: userByEmail['blockmanager@building.com']?.id || users[1].id,
            },
        ];

        const blocks = await Block.bulkCreate(blockConfigs, { returning: true });
        const blockByCode = {};
        blocks.forEach((block) => {
            blockByCode[block.blockCode] = block;
        });

        // 7. Create buildings for each block
        console.log('🏗️ Creating buildings for A/B/S...');
        const buildingConfigs = [
            { blockCode: 'A', count: 3, managerEmail: 'buildingmanagerA@building.com' },
            { blockCode: 'B', count: 3, managerEmail: 'buildingmanagerB@building.com' },
            { blockCode: 'S', count: 4, managerEmail: 'buildingmanager@building.com' },
        ];

        const buildings = [];
        for (const config of buildingConfigs) {
            const block = blockByCode[config.blockCode];
            for (let i = 1; i <= config.count; i++) {
                const buildingCode = `${config.blockCode}.${i.toString().padStart(2, '0')}`;
                const building = await Building.create({
                    name: `Tòa nhà ${buildingCode}`,
                    blockId: block.id,
                    buildingCode,
                    address: `${block.location} - ${buildingCode}`,
                    city: 'TP.HCM',
                    state: 'TP.HCM',
                    zipCode: '700000',
                    totalFloors: 12,
                    constructionYear: 2019 + i,
                    managerId: userByEmail[config.managerEmail]?.id || userByEmail['buildingmanager@building.com']?.id,
                    description: `Tòa ${buildingCode} với tiện ích hiện đại`,
                    status: 'active',
                    amenities: ['parking', 'elevator', 'security', 'wifi'],
                    isActive: true,
                });
                buildings.push(building);
            }
        }

        // 8. Create floors for each building (6 floors to diversify data)
        console.log('🏢 Creating floors for all buildings...');
        const floors = [];
        const floorsPerBuilding = 6;
        for (const building of buildings) {
            for (let floorNumber = 1; floorNumber <= floorsPerBuilding; floorNumber++) {
                const floor = await Floor.create({
                    buildingId: building.id,
                    floorNumber,
                    totalApartments: 6,
                    floorPlan: `Bố trí mặt bằng ${building.buildingCode} - tầng ${floorNumber}`,
                    isActive: true,
                });
                floors.push(floor);
            }
        }

        // 9. Create apartments for each floor
        console.log('🏠 Creating apartments for each floor...');
        const apartments = [];
        const apartmentsPerFloor = 6;
        const statusCycle = ['occupied', 'vacant', 'for_rent', 'for_sale', 'under_renovation'];

        for (const floor of floors) {
            for (let aptNumber = 1; aptNumber <= apartmentsPerFloor; aptNumber++) {
                const apartmentNumber = `${floor.floorNumber.toString().padStart(2, '0')}${aptNumber.toString().padStart(2, '0')}`;
                const status = statusCycle[(floor.floorNumber + aptNumber) % statusCycle.length];

                const isOwned = status !== 'for_sale'; // căn for_sale chưa có chủ để admin có thể niêm yết
                const ownerCandidate = residentUsers[(floor.id + aptNumber) % residentUsers.length] || residentUsers[0];
                const tenantCandidate = residentUsers[(floor.id + aptNumber + 3) % residentUsers.length] || residentUsers[1];
                const isTenant = status === 'occupied';

                const apartment = await Apartment.create({
                    apartmentNumber,
                    floorId: floor.id,
                    type: ['1bhk', '2bhk', '3bhk', 'studio'][aptNumber % 4],
                    area: 45 + floor.floorNumber * 3 + aptNumber,
                    bedrooms: (aptNumber % 3) + 1,
                    bathrooms: (aptNumber % 2) + 1,
                    balconies: aptNumber % 2,
                    parkingSlots: aptNumber % 3 === 0 ? 1 : 0,
                    monthlyRent: 3000000 + floor.floorNumber * 50000 + aptNumber * 25000,
                    maintenanceFee: 150000 + aptNumber * 5000,
                    status,
                    ownerId: isOwned ? ownerCandidate.id : null,
                    tenantId: isTenant ? tenantCandidate.id : null,
                    isListedForRent: status === 'for_rent',
                    isListedForSale: status === 'for_sale',
                    salePrice: 1200000000 + floor.floorNumber * 20000000 + aptNumber * 5000000,
                    description: `Căn hộ ${apartmentNumber} tại tầng ${floor.floorNumber}`,
                    isActive: true,
                });
                apartments.push(apartment);
            }
        }

        // Sample lease requests
        console.log('📝 Creating sample lease requests...');
        const rentCandidate = apartments.find((apt) => apt.isListedForRent);
        const saleCandidate = apartments.find((apt) => apt.isListedForSale);
        await LeaseRequest.bulkCreate(
            [
                rentCandidate && {
                    apartmentId: rentCandidate.id,
                    userId: residentUsers[0]?.id,
                    type: 'rent',
                    status: 'pending_manager',
                    startDate: '2024-12-01',
                    monthlyRent: rentCandidate.monthlyRent,
                    note: 'Muốn thuê 12 tháng'
                },
                saleCandidate && {
                    apartmentId: saleCandidate.id,
                    userId: residentUsers[1]?.id,
                    type: 'buy',
                    status: 'pending_manager',
                    totalPrice: saleCandidate.salePrice,
                    note: 'Đề nghị mua căn này'
                }
            ].filter(Boolean)
        );

        // 10. Create Household Members for a subset of apartments
        console.log('👨‍👩‍👧‍👦 Creating household members...');
        const sampleNames = [
            ['Lê', 'Minh'],
            ['Trần', 'Khánh'],
            ['Nguyễn', 'Hòa'],
            ['Phạm', 'Hạnh'],
            ['Huỳnh', 'Nam'],
            ['Võ', 'Anh'],
            ['Bùi', 'Trang'],
            ['Đinh', 'Thiện'],
            ['Phan', 'Yến'],
            ['Trương', 'Tú'],
        ];

        const occupiedAndRent = apartments.filter((apt) => ['occupied', 'for_rent'].includes(apt.status));
        let phoneSeed = 910000000;
        for (let i = 0; i < occupiedAndRent.length && i < 80; i++) {
            const apt = occupiedAndRent[i];
            const name = sampleNames[i % sampleNames.length];

            await HouseholdMember.create({
                apartmentId: apt.id,
                firstName: name[1],
                lastName: name[0],
                relationship: i % 3 === 0 ? 'owner' : 'tenant',
                dateOfBirth: `199${i % 10}-0${(i % 9) + 1}-15`,
                phoneNumber: `0${phoneSeed + i}`,
                email: i % 4 === 0 ? `hhmember${i + 1}@building.com` : null,
                moveInDate: '2023-09-01',
                isActive: true,
            });
        }

        // 11. Create Block Facilities
        console.log('🏊‍♂️ Creating block facilities...');
        const facilities = await Facility.bulkCreate([
            {
                blockId: blockByCode['S'].id,
                name: 'Hồ bơi',
                type: 'swimming_pool',
                location: 'Tầng trệt, Khu trung tâm',
                description: 'Hồ bơi tiêu chuẩn Olympic',
                capacity: 50,
                operatingHours: { open: '06:00', close: '22:00' },
                bookingRequired: true,
                advanceBookingDays: 7,
                bookingFee: 50000,
                status: 'available',
                isActive: true,
            },
            {
                blockId: blockByCode['A'].id,
                name: 'Phòng Gym',
                type: 'gym',
                location: 'Tầng 2, Khu trung tâm',
                description: 'Phòng tập gym với đầy đủ thiết bị',
                capacity: 30,
                operatingHours: { open: '05:00', close: '23:00' },
                bookingRequired: false,
                advanceBookingDays: 0,
                bookingFee: 0,
                status: 'available',
                isActive: true,
            },
            {
                blockId: blockByCode['B'].id,
                name: 'Sân tennis',
                type: 'sports_court',
                location: 'Sân thượng',
                description: 'Sân tennis chuyên nghiệp',
                capacity: 4,
                operatingHours: { open: '06:00', close: '22:00' },
                bookingRequired: true,
                advanceBookingDays: 3,
                bookingFee: 100000,
                status: 'available',
                isActive: true,
            },
            {
                blockId: blockByCode['S'].id,
                name: 'Phòng họp cư dân',
                type: 'conference_room',
                location: 'Tầng 1, Tòa S.01',
                description: 'Phòng họp lớn cho cư dân',
                capacity: 100,
                operatingHours: { open: '08:00', close: '22:00' },
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
        console.log(`- ${users.length} users created (including managers & residents)`);
        console.log(`- ${blocks.length} blocks created (A/B/S)`);
        console.log(`- ${buildings.length} buildings created`);
        console.log(`- ${floors.length} floors created`);
        console.log(`- ${apartments.length} apartments created`);
        console.log(`- ${Math.min(occupiedAndRent.length, 80)} household members created`);
        console.log(`- ${facilities.length} facilities created`);

        console.log('\n🔐 Test Accounts:');
        console.log('Admin:             admin@building.com          / 123456');
        console.log('Block Manager A:   blockmanagerA@building.com  / 123456');
        console.log('Block Manager B:   blockmanagerB@building.com  / 123456');
        console.log('Block Manager S:   blockmanager@building.com   / 123456');
        console.log('Building Manager S: buildingmanager@building.com / 123456');
        console.log('Resident:          resident@building.com       / 123456');
        console.log('Student:           student@building.com        / 123456');
        console.log('Security:          security@building.com       / 123456');
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

const { sequelize } = require('../config/database');
const { User, Role, Position } = require('../models');

const seedDatabase = async () => {
    try {
        console.log('Starting database seeding...');

        // Force sync database (recreate tables)
        await sequelize.sync({ force: true });
        console.log('Database synced successfully');

        // Create Roles
        const roles = await Role.bulkCreate([
            {
                name: 'Admin',
                description: 'Full system access and user management',
                isActive: true
            },
            {
                name: 'Manager',
                description: 'User management and reporting access',
                isActive: true
            },
            {
                name: 'Employee',
                description: 'Basic user access',
                isActive: true
            },
            {
                name: 'User',
                description: 'Standard user access',
                isActive: true
            }
        ]);
        console.log('Roles created successfully');

        // Create Positions
        const positions = await Position.bulkCreate([
            {
                title: 'Software Engineer',
                description: 'Develops and maintains software applications',
                department: 'Engineering',
                salary: 75000.00,
                isActive: true
            },
            {
                title: 'Senior Software Engineer',
                description: 'Senior developer with leadership responsibilities',
                department: 'Engineering',
                salary: 95000.00,
                isActive: true
            },
            {
                title: 'Product Manager',
                description: 'Manages product development and strategy',
                department: 'Product',
                salary: 85000.00,
                isActive: true
            },
            {
                title: 'UI/UX Designer',
                description: 'Designs user interfaces and experiences',
                department: 'Design',
                salary: 65000.00,
                isActive: true
            },
            {
                title: 'DevOps Engineer',
                description: 'Manages deployment and infrastructure',
                department: 'Engineering',
                salary: 80000.00,
                isActive: true
            },
            {
                title: 'HR Manager',
                description: 'Manages human resources and recruitment',
                department: 'Human Resources',
                salary: 70000.00,
                isActive: true
            }
        ]);
        console.log('Positions created successfully');

        // Create Users
        const users = await User.bulkCreate([
            {
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@example.com',
                password: 'admin123',
                phone: '+1234567890',
                address: '123 Admin Street, Admin City, AC 12345',
                dateOfBirth: '1990-01-01',
                roleId: roles[0].id, // Admin role
                positionId: positions[1].id, // Senior Software Engineer
                isActive: true
            },
            {
                firstName: 'John',
                lastName: 'Manager',
                email: 'manager@example.com',
                password: 'manager123',
                phone: '+1234567891',
                address: '456 Manager Ave, Manager City, MC 67890',
                dateOfBirth: '1985-05-15',
                roleId: roles[1].id, // Manager role
                positionId: positions[2].id, // Product Manager
                isActive: true
            },
            {
                firstName: 'Alice',
                lastName: 'Smith',
                email: 'alice@example.com',
                password: 'alice123',
                phone: '+1234567892',
                address: '789 Employee St, Employee City, EC 54321',
                dateOfBirth: '1992-08-20',
                roleId: roles[2].id, // Employee role
                positionId: positions[0].id, // Software Engineer
                isActive: true
            },
            {
                firstName: 'Bob',
                lastName: 'Johnson',
                email: 'bob@example.com',
                password: 'bob123',
                phone: '+1234567893',
                address: '321 Designer Blvd, Design City, DC 98765',
                dateOfBirth: '1988-12-10',
                roleId: roles[2].id, // Employee role
                positionId: positions[3].id, // UI/UX Designer
                isActive: true
            },
            {
                firstName: 'Charlie',
                lastName: 'Brown',
                email: 'charlie@example.com',
                password: 'charlie123',
                phone: '+1234567894',
                address: '654 DevOps Lane, DevOps City, DOC 13579',
                dateOfBirth: '1991-03-25',
                roleId: roles[3].id, // User role
                positionId: positions[4].id, // DevOps Engineer
                isActive: true
            },
            {
                firstName: 'Diana',
                lastName: 'Wilson',
                email: 'diana@example.com',
                password: 'diana123',
                phone: '+1234567895',
                address: '987 HR Road, HR City, HRC 24680',
                dateOfBirth: '1987-07-30',
                roleId: roles[1].id, // Manager role
                positionId: positions[5].id, // HR Manager
                isActive: true
            },
            {
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                password: 'test123',
                phone: '+1234567896',
                address: '555 Test Street, Test City, TC 11111',
                dateOfBirth: '1995-11-11',
                roleId: roles[3].id, // User role
                positionId: null, // No position
                isActive: false // Inactive user for testing
            }
        ]);
        console.log('Users created successfully');

        console.log('Database seeding completed successfully!');
        console.log('\nSeeded Data Summary:');
        console.log(`- ${roles.length} roles created`);
        console.log(`- ${positions.length} positions created`);
        console.log(`- ${users.length} users created`);

        console.log('\nTest Credentials:');
        console.log('Admin: admin@example.com / admin123');
        console.log('Manager: manager@example.com / manager123');
        console.log('Employee: alice@example.com / alice123');
        console.log('User: test@example.com / test123 (inactive)');

        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

// Run seeder if called directly
if (require.main === module) {
    seedDatabase();
}

module.exports = seedDatabase;
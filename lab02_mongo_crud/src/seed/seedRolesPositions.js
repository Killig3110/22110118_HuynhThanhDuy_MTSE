require('dotenv').config();
const connectDB = require('../config/db');
const Role = require('../models/role.model');
const Position = require('../models/position.model');

const roles = [
    { key: 'R1', name: 'Admin' },
    { key: 'R2', name: 'User' },
    { key: 'R3', name: 'Guest' },
];

const positions = [
    { key: 'P0', name: 'None' },
    { key: 'P1', name: 'Manager' },
    { key: 'P2', name: 'Developer' },
    { key: 'P3', name: 'Designer' },
];

const seed = async () => {
    await connectDB();
    console.log('Seeding roles...');
    for (const r of roles) {
        await Role.updateOne({ key: r.key }, { $set: r }, { upsert: true });
    }
    console.log('Seeding positions...');
    for (const p of positions) {
        await Position.updateOne({ key: p.key }, { $set: p }, { upsert: true });
    }
    console.log('Seeding finished');
    process.exit(0);
};

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});

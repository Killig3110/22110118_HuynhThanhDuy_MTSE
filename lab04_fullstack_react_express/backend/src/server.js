const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./config/database');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));

// Static files CORS middleware - PHẢI đặt trước express.static
app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.CLIENT_URL || 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', true);

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
});

// Static files serve
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// Database connection and server start
sequelize.authenticate()
    .then(() => {
        console.log('Database connected successfully');

        // Sync models
        return sequelize.sync({ force: false });
    })
    .then(() => {
        console.log('Database models synchronized');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Unable to start server:', error);
        process.exit(1);
    });

module.exports = app;
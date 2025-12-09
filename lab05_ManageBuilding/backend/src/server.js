const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { ApolloServer } = require('apollo-server-express');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { sequelize } = require('./config/database');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const buildingRoutes = require('./routes/building.routes');
const blockRoutes = require('./routes/block.routes');
const floorRoutes = require('./routes/floor.routes');
const apartmentRoutes = require('./routes/apartment.routes');
const searchRoutes = require('./routes/search.routes');
const leaseRoutes = require('./routes/lease.routes');
const cartRoutes = require('./routes/cart.routes');
const { errorHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');
const { sanitizeInput } = require('./middleware/validation');

// GraphQL imports
const cartTypeDefs = require('./graphql/cart.schema');
const cartResolvers = require('./graphql/cart.resolvers');

const app = express();

// Security middleware - 4 Layer Security Implementation
// Layer 1: Rate Limiting (implemented in rateLimiter.js)
app.use(generalLimiter);

// Layer 2: Security headers and protection
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            // allow API requests from frontend during dev
            connectSrc: ["'self'", process.env.CLIENT_URL || 'http://localhost:3000', 'http://localhost:5001'],
            fontSrc: ["'self'", "https:", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false
}));

// Layer 3: Input Sanitization 
// (applied per route in validation middleware)

// Layer 4: Authentication & Authorization 
// (implemented in auth.js middleware)

// CORS configuration
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));
app.options('*', cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Static files CORS middleware - PHẢI đặt trước express.static
app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.CLIENT_URL || 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
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

// Global input sanitization
app.use(sanitizeInput);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/blocks', blockRoutes);
app.use('/api/floors', floorRoutes);
app.use('/api/apartments', apartmentRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/leases', leaseRoutes);
app.use('/api/cart', cartRoutes);

// Health check with database connection test
app.get('/api/health', async (req, res) => {
    const health = {
        status: 'OK',
        message: 'Building Management System API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    };

    // Test database connection
    try {
        await sequelize.authenticate();
        health.database = {
            status: 'connected',
            type: 'MySQL',
            host: sequelize.config.host
        };
    } catch (error) {
        health.status = 'DEGRADED';
        health.database = {
            status: 'disconnected',
            error: error.message
        };
        return res.status(503).json(health);
    }

    res.json(health);
});

// API Documentation endpoint
app.get('/api', (req, res) => {
    res.json({
        name: 'Building Management System API',
        version: '1.0.0',
        endpoints: {
            auth: {
                'POST /api/auth/login': 'User login',
                'POST /api/auth/register/resident': 'Resident registration',
                'POST /api/auth/register/staff': 'Staff registration (admin/manager only)',
                'GET /api/auth/profile': 'Get user profile',
                'PUT /api/auth/profile': 'Update user profile',
                'PUT /api/auth/change-password': 'Change password',
                'POST /api/auth/forgot-password': 'Request password reset',
                'POST /api/auth/reset-password': 'Reset password',
                'POST /api/auth/logout': 'User logout'
            },
            buildings: {
                'GET /api/buildings': 'List buildings (with pagination)',
                'GET /api/buildings/:id': 'Get building details',
                'GET /api/buildings/:buildingId/floors': 'Get floors by building',
                'GET /api/buildings/floors/:floorId/apartments': 'Get apartments by floor',
                'POST /api/buildings': 'Create building (manager only)',
                'PUT /api/buildings/:id': 'Update building (manager only)',
                'DELETE /api/buildings/:id': 'Delete building (admin only)'
            },
            users: {
                'GET /api/users': 'List users (admin only)',
                'GET /api/users/:id': 'Get user details',
                'PUT /api/users/:id': 'Update user (admin/manager only)',
                'DELETE /api/users/:id': 'Delete user (admin only)'
            }
        },
        security: {
            rateLimiting: 'Express-rate-limit implemented',
            inputValidation: 'Express-validator with sanitization',
            authentication: 'JWT-based authentication',
            authorization: 'Role-based access control'
        }
    });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        path: req.path,
        method: req.method
    });
});

const PORT = process.env.PORT || 5000;

let server;

// GraphQL Apollo Server setup
const apolloServer = new ApolloServer({
    typeDefs: cartTypeDefs,
    resolvers: cartResolvers,
    context: async ({ req }) => {
        // Extract user from JWT token
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const { User, Role } = require('./models');
                const user = await User.findByPk(decoded.id, {
                    include: [{ model: Role, as: 'role' }]
                });
                return { user };
            } catch (error) {
                console.log('GraphQL auth error:', error.message);
                return { user: null };
            }
        }

        return { user: null };
    },
    formatError: (error) => {
        console.error('GraphQL Error:', error);
        return {
            message: error.message,
            locations: error.locations,
            path: error.path
        };
    }
});

// Database connection and server start
sequelize.authenticate()
    .then(() => {
        console.log('✅ Database connected successfully');

        // Sync models
        return sequelize.sync({ force: false });
    })
    .then(async () => {
        console.log('✅ Database models synchronized');

        // Start Apollo Server
        await apolloServer.start();
        apolloServer.applyMiddleware({
            app,
            path: '/graphql',
            cors: {
                origin: process.env.CLIENT_URL || 'http://localhost:3000',
                credentials: true
            }
        });

        server = app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
            console.log(`🎮 GraphQL Playground: http://localhost:${PORT}${apolloServer.graphqlPath}`);
        });
    })
    .catch((error) => {
        console.error('❌ Unable to start server:', error);
        process.exit(1);
    });

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
    console.log(`\n⚠️  ${signal} signal received: closing HTTP server`);

    if (server) {
        server.close(async () => {
            console.log('🔒 HTTP server closed');

            try {
                await sequelize.close();
                console.log('🔒 Database connection closed');
                console.log('✅ Graceful shutdown completed');
                process.exit(0);
            } catch (error) {
                console.error('❌ Error during shutdown:', error);
                process.exit(1);
            }
        });

        // Force close after 10 seconds
        setTimeout(() => {
            console.error('⏰ Forced shutdown after timeout');
            process.exit(1);
        }, 10000);
    }
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('UNHANDLED_REJECTION');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
});

module.exports = app;

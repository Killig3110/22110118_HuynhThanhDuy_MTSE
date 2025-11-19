const jwt = require('jsonwebtoken');
const { User, Role, Position } = require('../models');

// =======================
// AUTH MIDDLEWARE
// =======================
const authMiddleware = async (req, res, next) => {
    try {
        let token = req.header('Authorization');

        if (token && token.startsWith('Bearer ')) {
            token = token.replace('Bearer ', '');
        } else if (req.cookies?.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
                code: 'NO_TOKEN'
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: err.name === 'TokenExpiredError'
                    ? 'Token has expired.'
                    : 'Invalid token.',
                code: err.name === 'TokenExpiredError'
                    ? 'TOKEN_EXPIRED'
                    : 'INVALID_TOKEN'
            });
        }

        const user = await User.findByPk(decoded.id, {
            include: [
                {
                    model: Role,
                    as: 'role',
                    attributes: ['id', 'name', 'description']
                },
                {
                    model: Position,
                    as: 'position',
                    attributes: ['id', 'title', 'department', 'description']
                }
            ],
            attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found.',
                code: 'USER_NOT_FOUND'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account has been deactivated.',
                code: 'ACCOUNT_INACTIVE'
            });
        }

        req.user = user;
        req.userRole = user.role?.name || null;

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication error.',
            code: 'AUTH_ERROR'
        });
    }
};

// =======================
// ROLE CHECKER
// =======================
const requireRole = (roles) => {
    const allowed = Array.isArray(roles) ? roles : [roles];

    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.',
                code: 'AUTH_REQUIRED'
            });
        }

        const userRole = req.user.role?.name;

        if (!allowed.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required roles: ${allowed.join(', ')}`,
                code: 'INSUFFICIENT_ROLE',
                currentRole: userRole,
            });
        }

        next();
    };
};

// =======================
// PERMISSION CHECKER
// =======================
const requirePermission = (permissions) => {
    return (req, res, next) => {
        const required = Array.isArray(permissions) ? permissions : [permissions];
        const userPermissions = req.user?.role?.permissions || [];

        const hasPermission =
            userPermissions.includes('*') ||
            required.some((p) => userPermissions.includes(p));

        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: `Required permissions: ${required.join(', ')}`,
                code: 'INSUFFICIENT_PERMISSION'
            });
        }

        next();
    };
};

// =======================
// SPECIFIC ROLE MIDDLEWARE
// =======================
const adminMiddleware = requireRole('admin');
const managerMiddleware = requireRole(['admin', 'building_manager']);
const staffMiddleware = requireRole([
    'admin',
    'building_manager',
    'security',
    'technician',
    'accountant'
]);
const residentOrStaffMiddleware = requireRole([
    'admin',
    'building_manager',
    'resident',
    'security',
    'technician',
    'accountant'
]);

// =======================
// RESOURCE OWNERSHIP
// =======================
const requireOwnership = (getResourceUserId) => {
    return async (req, res, next) => {
        try {
            const resourceUserId = await getResourceUserId(req);

            if (['admin', 'building_manager'].includes(req.userRole)) {
                return next();
            }

            if (req.user.id !== resourceUserId) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not own this resource.',
                    code: 'OWNERSHIP_REQUIRED'
                });
            }

            next();
        } catch (err) {
            console.error('Ownership middleware error:', err);
            return res.status(500).json({
                success: false,
                message: 'Authorization error.',
                code: 'OWNERSHIP_CHECK_ERROR'
            });
        }
    };
};

// =======================
// BUILDING ACCESS CHECKER
// =======================
const requireBuildingAccess = async (req, res, next) => {
    const { buildingId } = req.params;
    const role = req.userRole;

    if (role === 'admin') return next();
    if (role === 'building_manager') return next(); // TODO: check assignment in future
    if (role === 'resident') return next(); // TODO: check apartment->floor->building chain

    return res.status(403).json({
        success: false,
        message: 'You do not have access to this building.',
        code: 'BUILDING_ACCESS_DENIED'
    });
};

// =======================
// EXPORT
// =======================
module.exports = {
    authMiddleware,
    requireRole,
    requirePermission,
    adminMiddleware,
    managerMiddleware,
    staffMiddleware,
    residentOrStaffMiddleware,
    requireOwnership,
    requireBuildingAccess
};

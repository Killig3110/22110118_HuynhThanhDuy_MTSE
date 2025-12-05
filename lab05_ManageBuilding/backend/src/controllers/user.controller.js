const fs = require('fs');
const path = require('path');
const { User, Role, Position } = require('../models');
const { Op } = require('sequelize');

const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, roleId, role: roleName, positionId, isActive } = req.query;
        const offset = (page - 1) * limit;

        // Build where clause
        const whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { firstName: { [Op.like]: `%${search}%` } },
                { lastName: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } }
            ];
        }

        if (roleId) whereClause.roleId = roleId;
        if (positionId) whereClause.positionId = positionId;
        if (isActive !== undefined) whereClause.isActive = isActive === 'true';

        const roleInclude = { model: Role, as: 'role' };
        if (roleName) {
            roleInclude.where = { name: roleName };
        }

        const { count, rows: users } = await User.findAndCountAll({
            where: whereClause,
            include: [
                roleInclude,
                { model: Position, as: 'position' }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']],
            distinct: true
        });

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(count / limit),
                    totalItems: count,
                    itemsPerPage: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id, {
            include: [
                { model: Role, as: 'role' },
                { model: Position, as: 'position' }
            ]
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: { user }
        });
    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
            error: error.message
        });
    }
};

const createUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone, address, dateOfBirth, roleId, positionId } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Validate role and position if provided
        if (roleId) {
            const role = await Role.findByPk(roleId);
            if (!role || !role.isActive) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid role selected'
                });
            }
        }

        if (positionId) {
            const position = await Position.findByPk(positionId);
            if (!position || !position.isActive) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid position selected'
                });
            }
        }

        // Handle avatar upload
        const avatar = req.file ? req.file.path : null;

        // Create user
        const userData = {
            firstName,
            lastName,
            email,
            password,
            phone,
            address,
            dateOfBirth,
            roleId: roleId || null,
            positionId: positionId || null,
            avatar
        };

        const user = await User.create(userData);

        // Get user with associations
        const userWithDetails = await User.findByPk(user.id, {
            include: [
                { model: Role, as: 'role' },
                { model: Position, as: 'position' }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: { user: userWithDetails }
        });
    } catch (error) {
        console.error('Create user error:', error);

        // Delete uploaded file if error occurs
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create user',
            error: error.message
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, phone, address, dateOfBirth, roleId, positionId, isActive } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            // Delete uploaded file if user not found
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Error deleting file:', err);
                });
            }

            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if email is already taken by another user
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ where: { email, id: { [Op.ne]: id } } });
            if (existingUser) {
                // Delete uploaded file if email conflict
                if (req.file) {
                    fs.unlink(req.file.path, (err) => {
                        if (err) console.error('Error deleting file:', err);
                    });
                }

                return res.status(400).json({
                    success: false,
                    message: 'Email is already taken by another user'
                });
            }
        }

        // Validate role and position if provided
        if (roleId && roleId !== user.roleId) {
            const role = await Role.findByPk(roleId);
            if (!role || !role.isActive) {
                // Delete uploaded file if role invalid
                if (req.file) {
                    fs.unlink(req.file.path, (err) => {
                        if (err) console.error('Error deleting file:', err);
                    });
                }

                return res.status(400).json({
                    success: false,
                    message: 'Invalid role selected'
                });
            }
        }

        if (positionId && positionId !== user.positionId) {
            const position = await Position.findByPk(positionId);
            if (!position || !position.isActive) {
                // Delete uploaded file if position invalid
                if (req.file) {
                    fs.unlink(req.file.path, (err) => {
                        if (err) console.error('Error deleting file:', err);
                    });
                }

                return res.status(400).json({
                    success: false,
                    message: 'Invalid position selected'
                });
            }
        }

        // Handle avatar upload
        if (req.file) {
            // Delete old avatar if exists
            if (user.avatar && fs.existsSync(user.avatar)) {
                fs.unlink(user.avatar, (err) => {
                    if (err) console.error('Error deleting old avatar:', err);
                });
            }
            user.avatar = req.file.path;
        }

        // Update user fields
        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;
        if (email !== undefined) user.email = email;
        if (phone !== undefined) user.phone = phone;
        if (address !== undefined) user.address = address;
        if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
        if (roleId !== undefined) user.roleId = roleId || null;
        if (positionId !== undefined) user.positionId = positionId || null;
        if (isActive !== undefined) user.isActive = isActive;

        await user.save();

        // Get updated user with associations
        const updatedUser = await User.findByPk(user.id, {
            include: [
                { model: Role, as: 'role' },
                { model: Position, as: 'position' }
            ]
        });

        res.json({
            success: true,
            message: 'User updated successfully',
            data: { user: updatedUser }
        });
    } catch (error) {
        console.error('Update user error:', error);

        // Delete uploaded file if error occurs
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update user',
            error: error.message
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Delete avatar file if exists
        if (user.avatar && fs.existsSync(user.avatar)) {
            fs.unlink(user.avatar, (err) => {
                if (err) console.error('Error deleting avatar:', err);
            });
        }

        await user.destroy();

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: error.message
        });
    }
};

const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.isActive = !user.isActive;
        await user.save();

        // Get updated user with associations
        const updatedUser = await User.findByPk(user.id, {
            include: [
                { model: Role, as: 'role' },
                { model: Position, as: 'position' }
            ]
        });

        res.json({
            success: true,
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            data: { user: updatedUser }
        });
    } catch (error) {
        console.error('Toggle user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle user status',
            error: error.message
        });
    }
};

const getRoles = async (req, res) => {
    try {
        const roles = await Role.findAll({
            where: { isActive: true },
            order: [['name', 'ASC']]
        });

        res.json({
            success: true,
            data: { roles }
        });
    } catch (error) {
        console.error('Get roles error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch roles',
            error: error.message
        });
    }
};

const getPositions = async (req, res) => {
    try {
        const positions = await Position.findAll({
            where: { isActive: true },
            order: [['title', 'ASC']]
        });

        res.json({
            success: true,
            data: { positions }
        });
    } catch (error) {
        console.error('Get positions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch positions',
            error: error.message
        });
    }
};

// Upload avatar function
const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn file ảnh'
            });
        }

        const userId = req.user.id;
        const user = await User.findByPk(userId);

        if (!user) {
            // Xóa file vừa upload nếu user không tồn tại
            fs.unlinkSync(req.file.path);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Xóa avatar cũ nếu có
        if (user.avatar) {
            const oldAvatarPath = path.join(__dirname, '../../uploads/avatars', path.basename(user.avatar));
            if (fs.existsSync(oldAvatarPath)) {
                fs.unlinkSync(oldAvatarPath);
            }
        }

        // Cập nhật avatar path trong database
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        await user.update({ avatar: avatarUrl });

        res.json({
            success: true,
            message: 'Avatar uploaded successfully',
            data: {
                avatarUrl: avatarUrl
            }
        });
    } catch (error) {
        // Xóa file upload nếu có lỗi
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }

        console.error('Upload avatar error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload avatar',
            error: error.message
        });
    }
};

// Delete avatar function
const deleteAvatar = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Xóa file avatar nếu có
        if (user.avatar) {
            const avatarPath = path.join(__dirname, '../../uploads/avatars', path.basename(user.avatar));
            if (fs.existsSync(avatarPath)) {
                fs.unlinkSync(avatarPath);
            }

            // Cập nhật database
            await user.update({ avatar: null });
        }

        res.json({
            success: true,
            message: 'Avatar deleted successfully'
        });
    } catch (error) {
        console.error('Delete avatar error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete avatar',
            error: error.message
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    getRoles,
    getPositions,
    uploadAvatar,
    deleteAvatar
};

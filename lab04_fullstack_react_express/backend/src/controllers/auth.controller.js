const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { User, Role, Position } = require('../models');

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '15m' // Short-lived access token
    });
};

const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
        expiresIn: '7d' // Long-lived refresh token
    });
};

const generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

const register = async (req, res) => {
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
        let role = null, position = null;
        if (roleId) {
            role = await Role.findByPk(roleId);
            if (!role || !role.isActive) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid role selected'
                });
            }
        }

        if (positionId) {
            position = await Position.findByPk(positionId);
            if (!position || !position.isActive) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid position selected'
                });
            }
        }

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
            positionId: positionId || null
        };

        const user = await User.create(userData);

        // Generate token
        const token = generateToken(user.id);

        // Get user with associations
        const userWithDetails = await User.findByPk(user.id, {
            include: [
                { model: Role, as: 'role' },
                { model: Position, as: 'position' }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: userWithDetails,
                token
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user
        const user = await User.findOne({
            where: { email },
            include: [
                { model: Role, as: 'role' },
                { model: Position, as: 'position' }
            ]
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate tokens
        const accessToken = generateToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        // Set refresh token as httpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user,
                accessToken,
                expiresIn: 15 * 60 // 15 minutes in seconds
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
};

const refreshTokenEndpoint = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token not provided'
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);

        // Get user
        const user = await User.findByPk(decoded.id, {
            include: [
                { model: Role, as: 'role' },
                { model: Position, as: 'position' }
            ]
        });

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token or user deactivated'
            });
        }

        // Generate new access token
        const newAccessToken = generateToken(user.id);

        res.json({
            success: true,
            data: {
                accessToken: newAccessToken,
                expiresIn: 15 * 60 // 15 minutes in seconds
            }
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid refresh token'
        });
    }
};

const logout = async (req, res) => {
    try {
        // Clear refresh token cookie
        res.clearCookie('refreshToken');

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed'
        });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email address'
            });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found with this email'
            });
        }

        // Generate reset token
        const resetToken = generateResetToken();
        const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save reset token to user
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        // Create reset URL
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        // Email configuration
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || 'Lab04 Support Team'}" <${process.env.EMAIL_FROM_ADDRESS || 'noreply@lab04app.com'}>`,
            to: email,
            subject: '🔐 Password Reset Request - Lab04 App',
            html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🔐 Password Reset</h1>
                    <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9;">Lab04 Full Stack Application</p>
                </div>
                
                <!-- Content -->
                <div style="padding: 40px 20px;">
                    <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Hello there!</h2>
                    
                    <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0;">
                        We received a request to reset the password for your Lab04 account. No worries, it happens to the best of us!
                    </p>
                    
                    <p style="color: #666666; line-height: 1.6; margin: 0 0 30px 0;">
                        Click the button below to create a new password:
                    </p>
                    
                    <!-- Reset Button -->
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="display: inline-block; 
                                  padding: 15px 30px; 
                                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                  color: #ffffff; 
                                  text-decoration: none; 
                                  border-radius: 25px; 
                                  font-weight: bold;
                                  font-size: 16px;
                                  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                            Reset My Password
                        </a>
                    </div>
                    
                    <!-- Security Info -->
                    <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 30px 0;">
                        <p style="color: #856404; margin: 0; font-size: 14px; line-height: 1.5;">
                            <strong>🔒 Security Note:</strong> This link will expire in <strong>10 minutes</strong> for your security. 
                            If you didn't request this password reset, please ignore this email.
                        </p>
                    </div>
                    
                    <p style="color: #666666; line-height: 1.6; margin: 20px 0 0 0;">
                        If the button doesn't work, you can copy and paste this link into your browser:
                    </p>
                    
                    <p style="color: #667eea; word-break: break-all; font-size: 14px; background-color: #f8f9fa; padding: 10px; border-radius: 5px; margin: 10px 0;">
                        ${resetUrl}
                    </p>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border-top: 1px solid #e9ecef;">
                    <p style="color: #6c757d; margin: 0; font-size: 14px;">
                        This email was sent by <strong>Lab04 Application</strong>
                    </p>
                    <p style="color: #6c757d; margin: 5px 0 0 0; font-size: 12px;">
                        If you have any questions, please contact our support team.
                    </p>
                </div>
            </div>
        </body>
        </html>
      `
        };

        try {
            await transporter.sendMail(mailOptions);
            res.json({
                success: true,
                message: 'Password reset email sent successfully'
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Reset the token fields if email fails
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await user.save();

            res.status(500).json({
                success: false,
                message: 'Failed to send reset email'
            });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Password reset failed',
            error: error.message
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide token and new password'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Find user with valid reset token
        const user = await User.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: {
                    [require('sequelize').Op.gt]: new Date()
                }
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Update password
        user.password = newPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successful'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Password reset failed',
            error: error.message
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: [
                { model: Role, as: 'role' },
                { model: Position, as: 'position' }
            ]
        });

        res.json({
            success: true,
            data: { user }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get profile',
            error: error.message
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, phone, address, dateOfBirth } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update user fields - allow empty strings but not undefined
        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;
        if (phone !== undefined) user.phone = phone;
        if (address !== undefined) user.address = address;
        if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;

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
            message: 'Profile updated successfully',
            data: { user: updatedUser }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message
        });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }

        const user = await User.findByPk(req.user.id);

        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password',
            error: error.message
        });
    }
};

module.exports = {
    register,
    login,
    refreshTokenEndpoint,
    logout,
    forgotPassword,
    resetPassword,
    getProfile,
    updateProfile,
    changePassword
};
import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing token on mount
    useEffect(() => {
        const initializeAuth = async () => {
            const token = Cookies.get('token');

            if (token) {
                try {
                    const response = await authAPI.getProfile();
                    if (response.data.success) {
                        setUser(response.data.data.user);
                    } else {
                        // Invalid token, remove it
                        Cookies.remove('token');
                    }
                } catch (error) {
                    console.error('Token validation failed:', error);
                    Cookies.remove('token');
                }
            }

            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (credentials) => {
        try {
            setIsLoading(true);
            const response = await authAPI.login(credentials);

            if (response.data.success) {
                const { user: userData, token } = response.data.data;

                // Store token in cookies (7 days)
                Cookies.set('token', token, { expires: 7 });

                // Update state
                setUser(userData);

                toast.success('Login successful!');
                return { success: true };
            } else {
                toast.error(response.data.message || 'Login failed');
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.error('Login error:', error);
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            return { success: false, message };
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            setIsLoading(true);
            const response = await authAPI.register(userData);

            if (response.data.success) {
                const { user: newUser, token } = response.data.data;

                // Store token in cookies (7 days)
                Cookies.set('token', token, { expires: 7 });

                // Update state
                setUser(newUser);

                toast.success('Registration successful!');
                return { success: true };
            } else {
                toast.error(response.data.message || 'Registration failed');
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.error('Registration error:', error);
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
            return { success: false, message };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        // Remove token from cookies
        Cookies.remove('token');

        // Clear user state
        setUser(null);

        toast.success('Logged out successfully');
    };

    const updateProfile = async (profileData) => {
        try {
            setIsLoading(true);
            const response = await authAPI.updateProfile(profileData);

            if (response.data.success) {
                setUser(response.data.data.user);
                toast.success('Profile updated successfully!');
                return { success: true };
            } else {
                toast.error(response.data.message || 'Profile update failed');
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.error('Profile update error:', error);
            const message = error.response?.data?.message || 'Profile update failed';
            toast.error(message);
            return { success: false, message };
        } finally {
            setIsLoading(false);
        }
    };

    const changePassword = async (passwordData) => {
        try {
            setIsLoading(true);
            const response = await authAPI.changePassword(passwordData);

            if (response.data.success) {
                toast.success('Password changed successfully!');
                return { success: true };
            } else {
                toast.error(response.data.message || 'Password change failed');
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.error('Password change error:', error);
            const message = error.response?.data?.message || 'Password change failed';
            toast.error(message);
            return { success: false, message };
        } finally {
            setIsLoading(false);
        }
    };

    const forgotPassword = async (email) => {
        try {
            setIsLoading(true);
            const response = await authAPI.forgotPassword({ email });

            if (response.data.success) {
                toast.success('Password reset email sent successfully!');
                return { success: true };
            } else {
                toast.error(response.data.message || 'Failed to send reset email');
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            const message = error.response?.data?.message || 'Failed to send reset email';
            toast.error(message);
            return { success: false, message };
        } finally {
            setIsLoading(false);
        }
    };

    const resetPassword = async (resetData) => {
        try {
            setIsLoading(true);
            const response = await authAPI.resetPassword(resetData);

            if (response.data.success) {
                toast.success('Password reset successful!');
                return { success: true };
            } else {
                toast.error(response.data.message || 'Password reset failed');
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.error('Reset password error:', error);
            const message = error.response?.data?.message || 'Password reset failed';
            toast.error(message);
            return { success: false, message };
        } finally {
            setIsLoading(false);
        }
    };

    // Helper function to check user role
    const hasRole = (requiredRole) => {
        if (!user || !user.role) return false;

        const userRole = user.role.name;

        if (requiredRole === 'Admin') {
            return userRole === 'Admin';
        }

        if (requiredRole === 'Manager') {
            return ['Admin', 'Manager'].includes(userRole);
        }

        return true;
    };

    // Helper function to check if user is admin
    const isAdmin = () => hasRole('Admin');

    // Helper function to check if user is manager or admin
    const isManager = () => hasRole('Manager');

    const value = {
        user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        forgotPassword,
        resetPassword,
        hasRole,
        isAdmin,
        isManager
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
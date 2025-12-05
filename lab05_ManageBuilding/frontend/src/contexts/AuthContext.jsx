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
            const token = localStorage.getItem('token');
            console.log('🔍 Initializing auth, token found:', token ? token.substring(0, 20) + '...' : 'No token');

            if (token) {
                try {
                    console.log('🔄 Validating token with backend...');
                    const response = await authAPI.getProfile();
                    console.log('✅ Token validation response:', response.data);

                    if (response.data.success) {
                        setUser(response.data.data.user);
                        console.log('👤 User authenticated successfully:', response.data.data.user.email);
                    } else {
                        // Invalid token, remove it
                        console.log('❌ Invalid token, removing...');
                        localStorage.removeItem('token');
                        toast.info('Please login again with your building management account');
                    }
                } catch (error) {
                    console.error('❌ Token validation failed:', error);
                    localStorage.removeItem('token');
                    // Check if it's a 404 user not found error (old lab04 token)
                    if (error.response?.status === 404 || error.response?.status === 401) {
                        toast.info('Your session has expired. Please login again with your building management account.');
                    }
                }
            } else {
                console.log('ℹ️ No token found, user needs to login');
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
                const { user: userData, accessToken, expiresIn } = response.data.data;

                // Store access token in localStorage
                localStorage.setItem('token', accessToken);
                localStorage.setItem('tokenExpiry', Date.now() + (expiresIn * 1000));
                console.log('💾 Access token saved to localStorage:', accessToken.substring(0, 20) + '...');

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

                // Store token in localStorage instead of cookies
                localStorage.setItem('token', token);
                console.log('💾 Token saved to localStorage after registration:', token.substring(0, 20) + '...');

                // Update state
                setUser(newUser);

                toast.success('Registration successful!');
                return { success: true, user: newUser };
            } else {
                toast.error(response.data.message || 'Registration failed');
                return { success: false, message: response.data.message, errors: response.data.errors };
            }
        } catch (error) {
            console.error('Registration error:', error);
            const message = error.response?.data?.message || 'Registration failed';
            const errors = error.response?.data?.errors;
            toast.error(message);
            return { success: false, message, errors };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        // Remove token from localStorage
        localStorage.removeItem('token');

        // Clear user state
        setUser(null);

        toast.success('Logged out successfully');
    };

    const updateProfile = async (profileData) => {
        try {
            setIsLoading(true);
            console.log('🔄 Updating profile with data:', profileData);

            // Check if token exists before making request
            const token = localStorage.getItem('token');
            console.log('🔑 Token check before profile update:', token ? 'Present' : 'Missing');

            if (!token) {
                console.error('❌ No token found, cannot update profile');
                toast.error('Authentication required. Please login again.');
                return { success: false, message: 'No authentication token' };
            }

            const response = await authAPI.updateProfile(profileData);
            console.log('📥 Profile update response:', response.data);

            if (response.data.success) {
                // Update user state carefully to avoid re-authentication issues
                const updatedUser = response.data.data.user;
                console.log('👤 Updated user data:', updatedUser);

                // Check if token still exists after API call
                const tokenAfter = Cookies.get('token');
                console.log('🔑 Token check after API call:', tokenAfter ? 'Still present' : 'MISSING!');

                setUser(prevUser => ({
                    ...prevUser,
                    ...updatedUser,
                    // Preserve important auth data
                    role: updatedUser.role || prevUser?.role,
                    position: updatedUser.position || prevUser?.position
                }));

                toast.success('Profile updated successfully!');
                return { success: true };
            } else {
                console.error('❌ Profile update failed:', response.data.message);
                toast.error(response.data.message || 'Profile update failed');
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.error('❌ Profile update error:', error);
            console.error('📋 Error details:', error.response?.data);

            // Check if token was removed due to error
            const tokenAfterError = Cookies.get('token');
            console.log('🔑 Token check after error:', tokenAfterError ? 'Still present' : 'REMOVED!');

            // Don't logout on profile update errors
            const message = error.response?.data?.message || 'Profile update failed';
            toast.error(message);
            return { success: false, message };
        } finally {
            setIsLoading(false);
        }
    }; const changePassword = async (passwordData) => {
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
        isManager,
        setUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

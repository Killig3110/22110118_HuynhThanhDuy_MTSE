import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { User, Mail, Phone, MapPin, Calendar, Camera, Lock, Save, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AvatarUpload from '../components/AvatarUpload';

const profileSchema = yup.object({
    firstName: yup
        .string()
        .min(2, 'First name must be at least 2 characters')
        .max(50, 'First name must not exceed 50 characters')
        .required('First name is required'),
    lastName: yup
        .string()
        .min(2, 'Last name must be at least 2 characters')
        .max(50, 'Last name must not exceed 50 characters')
        .required('Last name is required'),
    phone: yup
        .string()
        .matches(/^[0-9+\-\s()]+$/, 'Invalid phone number format')
        .optional(),
    address: yup.string().optional(),
    dateOfBirth: yup.date().max(new Date(), 'Date of birth cannot be in the future').optional(),
});

const passwordSchema = yup.object({
    currentPassword: yup
        .string()
        .required('Current password is required'),
    newPassword: yup
        .string()
        .min(6, 'New password must be at least 6 characters')
        .required('New password is required'),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
        .required('Please confirm your password'),
});

const Profile = () => {
    const { user, updateProfile, changePassword, setUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Debug user data
    console.log('👤 Profile component user data:', {
        user,
        avatar: user?.avatar,
        localStorage: localStorage.getItem('user')
    });

    // Handle avatar update
    const handleAvatarUpdate = async (newAvatarUrl) => {
        // Update user state immediately for UI feedback
        setUser(prevUser => ({
            ...prevUser,
            avatar: newAvatarUrl
        }));

        // Also update localStorage for persistence
        try {
            const token = localStorage.getItem('token');
            if (token) {
                // Fetch fresh user data to ensure sync
                const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setUser(data.data.user);
                        // Update localStorage too
                        localStorage.setItem('user', JSON.stringify(data.data.user));
                    }
                }
            }
        } catch (error) {
            console.error('Error refreshing user data:', error);
        }
    };

    // Profile form
    const profileForm = useForm({
        resolver: yupResolver(profileSchema),
        defaultValues: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            phone: user?.phone || '',
            address: user?.address || '',
            dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        },
    });

    // Password form
    const passwordForm = useForm({
        resolver: yupResolver(passwordSchema),
    });

    // Update form when user data changes
    useEffect(() => {
        if (user) {
            profileForm.reset({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                address: user.address || '',
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
            });
        }
    }, [user, profileForm]);

    // Force reload user data on component mount if avatar is missing
    useEffect(() => {
        const reloadUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.success && data.data.user.avatar) {
                            console.log('🔄 Reloaded user with avatar:', data.data.user.avatar);
                            setUser(data.data.user);
                        }
                    }
                }
            } catch (error) {
                console.error('Error reloading user data:', error);
            }
        };

        // Only reload if user exists but no avatar
        if (user && !user.avatar) {
            reloadUserData();
        }
    }, [user, setUser]);

    const onProfileSubmit = async (data) => {
        console.log('📤 Submitting profile data:', data);

        const result = await updateProfile(data);
        console.log('📥 Profile update result:', result);

        if (result.success) {
            // Reset form with updated values
            profileForm.reset({
                firstName: user?.firstName || '',
                lastName: user?.lastName || '',
                phone: user?.phone || '',
                address: user?.address || '',
                dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
            });
        } else {
            profileForm.setError('root', {
                type: 'manual',
                message: result.message || 'Profile update failed'
            });
        }
    };

    const onPasswordSubmit = async (data) => {
        const result = await changePassword(data);
        if (result.success) {
            passwordForm.reset();
        } else {
            passwordForm.setError('root', {
                type: 'manual',
                message: result.message || 'Password change failed'
            });
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not provided';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="px-4 py-6 sm:px-0">
                    <h1 className="text-3xl font-bold leading-tight text-gray-900">
                        Profile Settings
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Manage your account settings and preferences.
                    </p>
                </div>

                {/* Profile Card */}
                <div className="px-4 sm:px-0 mb-8">
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center space-x-6">
                            <div className="flex-shrink-0">
                                <AvatarUpload
                                    currentAvatar={user?.avatar}
                                    onAvatarUpdate={handleAvatarUpdate}
                                />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {user?.firstName} {user?.lastName}
                                </h2>
                                <p className="text-gray-600">{user?.email}</p>
                                <div className="flex items-center mt-2 space-x-4">
                                    {user?.role && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {user.role.name}
                                        </span>
                                    )}
                                    {user?.position && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {user.position.title}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-4 sm:px-0">
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`${activeTab === 'profile'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                            >
                                Profile Information
                            </button>
                            <button
                                onClick={() => setActiveTab('password')}
                                className={`${activeTab === 'password'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                            >
                                Change Password
                            </button>
                        </nav>
                    </div>

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="bg-white shadow rounded-lg p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Current Information */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Current Information
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <User className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Full Name</p>
                                                <p className="text-sm text-gray-600">{user?.firstName} {user?.lastName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Email</p>
                                                <p className="text-sm text-gray-600">{user?.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Phone</p>
                                                <p className="text-sm text-gray-600">{user?.phone || 'Not provided'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Calendar className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Date of Birth</p>
                                                <p className="text-sm text-gray-600">{formatDate(user?.dateOfBirth)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-3">
                                            <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Address</p>
                                                <p className="text-sm text-gray-600">{user?.address || 'Not provided'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Update Form */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Update Information
                                    </h3>
                                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                                        {/* First Name & Last Name */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                                                    First Name
                                                </label>
                                                <input
                                                    {...profileForm.register('firstName')}
                                                    type="text"
                                                    className={`
                            mt-1 block w-full px-3 py-2 border 
                            ${profileForm.formState.errors.firstName ? 'border-red-300' : 'border-gray-300'}
                            rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                          `}
                                                    placeholder="First name"
                                                />
                                                {profileForm.formState.errors.firstName && (
                                                    <p className="mt-1 text-sm text-red-600">{profileForm.formState.errors.firstName.message}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                                                    Last Name
                                                </label>
                                                <input
                                                    {...profileForm.register('lastName')}
                                                    type="text"
                                                    className={`
                            mt-1 block w-full px-3 py-2 border 
                            ${profileForm.formState.errors.lastName ? 'border-red-300' : 'border-gray-300'}
                            rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                          `}
                                                    placeholder="Last name"
                                                />
                                                {profileForm.formState.errors.lastName && (
                                                    <p className="mt-1 text-sm text-red-600">{profileForm.formState.errors.lastName.message}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                                Phone Number
                                            </label>
                                            <input
                                                {...profileForm.register('phone')}
                                                type="tel"
                                                className={`
                          mt-1 block w-full px-3 py-2 border 
                          ${profileForm.formState.errors.phone ? 'border-red-300' : 'border-gray-300'}
                          rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                        `}
                                                placeholder="Phone number"
                                            />
                                            {profileForm.formState.errors.phone && (
                                                <p className="mt-1 text-sm text-red-600">{profileForm.formState.errors.phone.message}</p>
                                            )}
                                        </div>

                                        {/* Date of Birth */}
                                        <div>
                                            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                                                Date of Birth
                                            </label>
                                            <input
                                                {...profileForm.register('dateOfBirth')}
                                                type="date"
                                                className={`
                          mt-1 block w-full px-3 py-2 border 
                          ${profileForm.formState.errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'}
                          rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                        `}
                                            />
                                            {profileForm.formState.errors.dateOfBirth && (
                                                <p className="mt-1 text-sm text-red-600">{profileForm.formState.errors.dateOfBirth.message}</p>
                                            )}
                                        </div>

                                        {/* Address */}
                                        <div>
                                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                                Address
                                            </label>
                                            <textarea
                                                {...profileForm.register('address')}
                                                rows={3}
                                                className={`
                          mt-1 block w-full px-3 py-2 border 
                          ${profileForm.formState.errors.address ? 'border-red-300' : 'border-gray-300'}
                          rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                        `}
                                                placeholder="Enter your address"
                                            />
                                            {profileForm.formState.errors.address && (
                                                <p className="mt-1 text-sm text-red-600">{profileForm.formState.errors.address.message}</p>
                                            )}
                                        </div>

                                        {/* Error Message */}
                                        {profileForm.formState.errors.root && (
                                            <div className="rounded-md bg-red-50 p-4">
                                                <div className="text-sm text-red-700">{profileForm.formState.errors.root.message}</div>
                                            </div>
                                        )}

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            Update Profile
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Password Tab */}
                    {activeTab === 'password' && (
                        <div className="bg-white shadow rounded-lg p-6">
                            <div className="max-w-md mx-auto">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Change Password
                                </h3>
                                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                                    {/* Current Password */}
                                    <div>
                                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                                            Current Password
                                        </label>
                                        <div className="mt-1 relative">
                                            <input
                                                {...passwordForm.register('currentPassword')}
                                                type={showCurrentPassword ? 'text' : 'password'}
                                                className={`
                          block w-full px-3 py-2 pr-10 border 
                          ${passwordForm.formState.errors.currentPassword ? 'border-red-300' : 'border-gray-300'}
                          rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                        `}
                                                placeholder="Enter current password"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            >
                                                {showCurrentPassword ? (
                                                    <EyeOff className="h-5 w-5 text-gray-400" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                        {passwordForm.formState.errors.currentPassword && (
                                            <p className="mt-1 text-sm text-red-600">{passwordForm.formState.errors.currentPassword.message}</p>
                                        )}
                                    </div>

                                    {/* New Password */}
                                    <div>
                                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                            New Password
                                        </label>
                                        <div className="mt-1 relative">
                                            <input
                                                {...passwordForm.register('newPassword')}
                                                type={showNewPassword ? 'text' : 'password'}
                                                className={`
                          block w-full px-3 py-2 pr-10 border 
                          ${passwordForm.formState.errors.newPassword ? 'border-red-300' : 'border-gray-300'}
                          rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                        `}
                                                placeholder="Enter new password"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                            >
                                                {showNewPassword ? (
                                                    <EyeOff className="h-5 w-5 text-gray-400" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                        {passwordForm.formState.errors.newPassword && (
                                            <p className="mt-1 text-sm text-red-600">{passwordForm.formState.errors.newPassword.message}</p>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                            Confirm New Password
                                        </label>
                                        <div className="mt-1 relative">
                                            <input
                                                {...passwordForm.register('confirmPassword')}
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                className={`
                          block w-full px-3 py-2 pr-10 border 
                          ${passwordForm.formState.errors.confirmPassword ? 'border-red-300' : 'border-gray-300'}
                          rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                        `}
                                                placeholder="Confirm new password"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="h-5 w-5 text-gray-400" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                        {passwordForm.formState.errors.confirmPassword && (
                                            <p className="mt-1 text-sm text-red-600">{passwordForm.formState.errors.confirmPassword.message}</p>
                                        )}
                                    </div>

                                    {/* Error Message */}
                                    {passwordForm.formState.errors.root && (
                                        <div className="rounded-md bg-red-50 p-4">
                                            <div className="text-sm text-red-700">{passwordForm.formState.errors.root.message}</div>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <Lock className="h-4 w-4 mr-2" />
                                        Change Password
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
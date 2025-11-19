import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { User, Mail, Phone, MapPin, Calendar, Camera, Lock, Save, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AvatarUpload from '../components/AvatarUpload';

// Role-based field configuration
const getRoleFields = (role) => {
    const baseFields = {
        firstName: { label: 'First Name', required: true, icon: User },
        lastName: { label: 'Last Name', required: true, icon: User },
        phone: { label: 'Phone Number', required: false, icon: Phone },
        address: { label: 'Address', required: false, icon: MapPin },
        dateOfBirth: { label: 'Date of Birth', required: false, icon: Calendar, type: 'date' }
    };

    const roleSpecificFields = {
        admin: {
            ...baseFields,
            emergencyContact: { label: 'Emergency Contact', required: true, icon: Phone },
            systemAccess: { label: 'System Access Level', required: false, type: 'select', options: ['Full', 'Limited'] }
        },
        building_manager: {
            ...baseFields,
            managedBuildingsList: { label: 'Managed Buildings', required: false, type: 'textarea' },
            workSchedule: { label: 'Work Schedule', required: false, type: 'text' },
            emergencyContact: { label: 'Emergency Contact', required: true, icon: Phone }
        },
        resident: {
            ...baseFields,
            apartmentNumber: { label: 'Apartment Number', required: false, type: 'text' },
            occupancyType: { label: 'Occupancy Type', required: false, type: 'select', options: ['Owner', 'Tenant', 'Guest'] },
            emergencyContact: { label: 'Emergency Contact', required: true, icon: Phone },
            vehicleInfo: { label: 'Vehicle Information', required: false, type: 'textarea' }
        },
        security: {
            ...baseFields,
            badgeNumber: { label: 'Security Badge Number', required: true, type: 'text' },
            shiftSchedule: { label: 'Shift Schedule', required: false, type: 'text' },
            emergencyContact: { label: 'Emergency Contact', required: true, icon: Phone },
            certifications: { label: 'Security Certifications', required: false, type: 'textarea' }
        },
        technician: {
            ...baseFields,
            specialization: { label: 'Technical Specialization', required: false, type: 'text' },
            workSchedule: { label: 'Work Schedule', required: false, type: 'text' },
            emergencyContact: { label: 'Emergency Contact', required: true, icon: Phone },
            certifications: { label: 'Technical Certifications', required: false, type: 'textarea' }
        },
        accountant: {
            ...baseFields,
            licenseNumber: { label: 'Accounting License Number', required: false, type: 'text' },
            workSchedule: { label: 'Work Schedule', required: false, type: 'text' },
            emergencyContact: { label: 'Emergency Contact', required: true, icon: Phone }
        }
    };

    return roleSpecificFields[role] || baseFields;
};

// Dynamic schema based on user role
const createProfileSchema = (userRole) => {
    const fields = getRoleFields(userRole);
    const schemaFields = {};

    Object.entries(fields).forEach(([fieldName, config]) => {
        let fieldSchema = yup.string();

        if (fieldName === 'dateOfBirth') {
            fieldSchema = yup.date().max(new Date(), 'Date of birth cannot be in the future');
        } else if (fieldName === 'phone' || fieldName === 'emergencyContact') {
            fieldSchema = yup.string().matches(/^[0-9+\-\s()]+$/, 'Invalid phone number format');
        }

        if (config.required) {
            fieldSchema = fieldSchema.required(`${config.label} is required`);
        } else {
            fieldSchema = fieldSchema.optional();
        }

        if (fieldName === 'firstName' || fieldName === 'lastName') {
            fieldSchema = fieldSchema.min(2, `${config.label} must be at least 2 characters`)
                .max(50, `${config.label} must not exceed 50 characters`);
        }

        schemaFields[fieldName] = fieldSchema;
    });

    return yup.object(schemaFields);
};

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

    // Get user role and dynamic fields
    const userRole = user?.role?.name || 'resident';
    const roleFields = getRoleFields(userRole);
    const dynamicSchema = createProfileSchema(userRole);

    // Debug user data
    console.log('👤 Profile component user data:', {
        user,
        userRole,
        roleFields: Object.keys(roleFields),
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

    // Profile form with dynamic schema
    const profileForm = useForm({
        resolver: yupResolver(dynamicSchema),
        defaultValues: Object.keys(roleFields).reduce((acc, fieldName) => {
            if (fieldName === 'dateOfBirth') {
                acc[fieldName] = user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '';
            } else {
                acc[fieldName] = user?.[fieldName] || '';
            }
            return acc;
        }, {}),
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
            // Reset form with updated values using dynamic fields
            const resetValues = Object.keys(roleFields).reduce((acc, fieldName) => {
                if (fieldName === 'dateOfBirth') {
                    acc[fieldName] = user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '';
                } else {
                    acc[fieldName] = user?.[fieldName] || '';
                }
                return acc;
            }, {});

            profileForm.reset(resetValues);
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

                                    {/* Role Information */}
                                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium text-blue-900">Your Role:</span>
                                            <span className="text-sm text-blue-700">{user?.role?.name} - {user?.position?.title}</span>
                                        </div>
                                        <p className="text-xs text-blue-600 mt-1">
                                            Profile fields are customized based on your role in the building management system.
                                        </p>
                                    </div>

                                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                                        {Object.entries(roleFields).map(([fieldName, config]) => (
                                            <div key={fieldName} className={config.type === 'textarea' ? 'col-span-2' : ''}>
                                                <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700">
                                                    {config.label} {config.required && <span className="text-red-500">*</span>}
                                                </label>

                                                {config.type === 'select' ? (
                                                    <select
                                                        {...profileForm.register(fieldName)}
                                                        className={`
                                                            mt-1 block w-full px-3 py-2 border 
                                                            ${profileForm.formState.errors[fieldName] ? 'border-red-300' : 'border-gray-300'}
                                                            rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                                                        `}
                                                    >
                                                        <option value="">Select {config.label}</option>
                                                        {config.options?.map(option => (
                                                            <option key={option} value={option}>{option}</option>
                                                        ))}
                                                    </select>
                                                ) : config.type === 'textarea' ? (
                                                    <textarea
                                                        {...profileForm.register(fieldName)}
                                                        rows={3}
                                                        className={`
                                                            mt-1 block w-full px-3 py-2 border 
                                                            ${profileForm.formState.errors[fieldName] ? 'border-red-300' : 'border-gray-300'}
                                                            rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                                                        `}
                                                        placeholder={`Enter ${config.label.toLowerCase()}`}
                                                    />
                                                ) : (
                                                    <div className="relative">
                                                        {config.icon && (
                                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                <config.icon className="h-4 w-4 text-gray-400" />
                                                            </div>
                                                        )}
                                                        <input
                                                            {...profileForm.register(fieldName)}
                                                            type={config.type || 'text'}
                                                            className={`
                                                                mt-1 block w-full ${config.icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border 
                                                                ${profileForm.formState.errors[fieldName] ? 'border-red-300' : 'border-gray-300'}
                                                                rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                                                            `}
                                                            placeholder={`Enter ${config.label.toLowerCase()}`}
                                                        />
                                                    </div>
                                                )}

                                                {profileForm.formState.errors[fieldName] && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {profileForm.formState.errors[fieldName].message}
                                                    </p>
                                                )}
                                            </div>
                                        ))}

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
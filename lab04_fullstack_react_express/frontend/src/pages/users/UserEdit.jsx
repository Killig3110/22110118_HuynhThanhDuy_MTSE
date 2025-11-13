import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Calendar, Camera, ToggleLeft, ToggleRight } from 'lucide-react';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';

const schema = yup.object({
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
    email: yup
        .string()
        .email('Please enter a valid email')
        .required('Email is required'),
    phone: yup
        .string()
        .matches(/^[0-9+\-\s()]+$/, 'Invalid phone number format')
        .optional(),
    address: yup.string().optional(),
    dateOfBirth: yup.date().max(new Date(), 'Date of birth cannot be in the future').optional(),
    roleId: yup.number().optional(),
    positionId: yup.number().optional(),
});

const UserEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [roles, setRoles] = useState([]);
    const [positions, setPositions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        reset,
    } = useForm({
        resolver: yupResolver(schema),
    });

    useEffect(() => {
        fetchUser();
        fetchRoles();
        fetchPositions();
    }, [id]);

    const fetchUser = async () => {
        try {
            const response = await userAPI.getUserById(id);
            if (response.data.success) {
                const userData = response.data.data.user;
                setUser(userData);

                // Reset form with user data
                reset({
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    email: userData.email,
                    phone: userData.phone || '',
                    address: userData.address || '',
                    dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
                    roleId: userData.roleId || '',
                    positionId: userData.positionId || '',
                });
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            toast.error('Failed to fetch user data');
            navigate('/users');
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await userAPI.getRoles();
            if (response.data.success) {
                setRoles(response.data.data.roles);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const fetchPositions = async () => {
        try {
            const response = await userAPI.getPositions();
            if (response.data.success) {
                setPositions(response.data.data.positions);
            }
        } catch (error) {
            console.error('Error fetching positions:', error);
        }
    };

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);
            console.log('🔄 Updating user with data:', data);

            // Don't use FormData, send as JSON
            const updateData = {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone || null,
                address: data.address || null,
                dateOfBirth: data.dateOfBirth || null,
                roleId: data.roleId ? parseInt(data.roleId) : null,
                positionId: data.positionId ? parseInt(data.positionId) : null,
            };

            console.log('📤 Sending update data:', updateData);

            const response = await userAPI.updateUser(id, updateData);

            console.log('📥 Update response:', response.data);

            if (response.data.success) {
                toast.success('User updated successfully!');
                navigate('/users');
            } else {
                setError('root', {
                    type: 'manual',
                    message: response.data.message || 'User update failed'
                });
            }
        } catch (error) {
            console.error('❌ Error updating user:', error);
            console.error('📋 Error response:', error.response?.data);

            const message = error.response?.data?.message || 'User update failed';
            toast.error(message);
            setError('root', {
                type: 'manual',
                message
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async () => {
        try {
            const response = await userAPI.toggleUserStatus(id);
            if (response.data.success) {
                setUser(prev => ({ ...prev, isActive: !prev.isActive }));
                toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
            }
        } catch (error) {
            console.error('Error toggling user status:', error);
            toast.error('Failed to update user status');
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">User not found</h2>
                    <Link to="/users" className="mt-4 text-blue-600 hover:text-blue-500">
                        Return to users list
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex items-center">
                        <Link
                            to="/users"
                            className="mr-4 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back to Users
                        </Link>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold leading-tight text-gray-900">
                                Edit User
                            </h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Update user information, role, and position assignments.
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleToggleStatus}
                                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${user.isActive
                                    ? 'text-red-700 bg-red-100 hover:bg-red-200'
                                    : 'text-green-700 bg-green-100 hover:bg-green-200'
                                    }`}
                            >
                                {user.isActive ? (
                                    <>
                                        <ToggleRight className="h-4 w-4 mr-2" />
                                        Deactivate User
                                    </>
                                ) : (
                                    <>
                                        <ToggleLeft className="h-4 w-4 mr-2" />
                                        Activate User
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Current User Info */}
                <div className="px-4 sm:px-0 mb-6">
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center space-x-6">
                            <div className="flex-shrink-0 relative">
                                <div className="h-20 w-20 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-2xl font-bold text-white">
                                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                    </span>
                                </div>
                                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {user.firstName} {user.lastName}
                                </h2>
                                <p className="text-gray-600">{user.email}</p>
                                <div className="flex items-center mt-2 space-x-4">
                                    {user.role && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {user.role.name}
                                        </span>
                                    )}
                                    {user.position && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {user.position.title}
                                        </span>
                                    )}
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="mt-2 text-sm text-gray-500">
                                    <p>Member since: {formatDate(user.createdAt)}</p>
                                    {user.lastLogin && (
                                        <p>Last login: {formatDate(user.lastLogin)}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="px-4 sm:px-0">
                    <div className="bg-white shadow rounded-lg">
                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                            {/* Personal Information */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Personal Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* First Name */}
                                    <div>
                                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                                            First Name *
                                        </label>
                                        <div className="mt-1 relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                {...register('firstName')}
                                                type="text"
                                                className={`
                          block w-full px-3 py-2 pl-10 border 
                          ${errors.firstName ? 'border-red-300' : 'border-gray-300'}
                          rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                        `}
                                                placeholder="Enter first name"
                                            />
                                        </div>
                                        {errors.firstName && (
                                            <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                                        )}
                                    </div>

                                    {/* Last Name */}
                                    <div>
                                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                                            Last Name *
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                {...register('lastName')}
                                                type="text"
                                                className={`
                          block w-full px-3 py-2 border 
                          ${errors.lastName ? 'border-red-300' : 'border-gray-300'}
                          rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                        `}
                                                placeholder="Enter last name"
                                            />
                                        </div>
                                        {errors.lastName && (
                                            <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                            Email Address *
                                        </label>
                                        <div className="mt-1 relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                {...register('email')}
                                                type="email"
                                                className={`
                          block w-full px-3 py-2 pl-10 border 
                          ${errors.email ? 'border-red-300' : 'border-gray-300'}
                          rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                        `}
                                                placeholder="Enter email address"
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                                        )}
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                            Phone Number
                                        </label>
                                        <div className="mt-1 relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Phone className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                {...register('phone')}
                                                type="tel"
                                                className={`
                          block w-full px-3 py-2 pl-10 border 
                          ${errors.phone ? 'border-red-300' : 'border-gray-300'}
                          rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                        `}
                                                placeholder="Enter phone number"
                                            />
                                        </div>
                                        {errors.phone && (
                                            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                                        )}
                                    </div>

                                    {/* Date of Birth */}
                                    <div>
                                        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                                            Date of Birth
                                        </label>
                                        <div className="mt-1 relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Calendar className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                {...register('dateOfBirth')}
                                                type="date"
                                                className={`
                          block w-full px-3 py-2 pl-10 border 
                          ${errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'}
                          rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                        `}
                                            />
                                        </div>
                                        {errors.dateOfBirth && (
                                            <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="mt-6">
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                        Address
                                    </label>
                                    <div className="mt-1 relative">
                                        <div className="absolute top-3 left-3 pointer-events-none">
                                            <MapPin className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <textarea
                                            {...register('address')}
                                            rows={3}
                                            className={`
                        block w-full px-3 py-2 pl-10 border 
                        ${errors.address ? 'border-red-300' : 'border-gray-300'}
                        rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                      `}
                                            placeholder="Enter full address"
                                        />
                                    </div>
                                    {errors.address && (
                                        <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Role & Position */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Role & Position Assignment
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Role */}
                                    <div>
                                        <label htmlFor="roleId" className="block text-sm font-medium text-gray-700">
                                            Role
                                        </label>
                                        <div className="mt-1">
                                            <select
                                                {...register('roleId')}
                                                className={`
                          block w-full px-3 py-2 border 
                          ${errors.roleId ? 'border-red-300' : 'border-gray-300'}
                          rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                        `}
                                            >
                                                <option value="">Select a role</option>
                                                {roles.map((role) => (
                                                    <option key={role.id} value={role.id}>
                                                        {role.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {errors.roleId && (
                                            <p className="mt-1 text-sm text-red-600">{errors.roleId.message}</p>
                                        )}
                                    </div>

                                    {/* Position */}
                                    <div>
                                        <label htmlFor="positionId" className="block text-sm font-medium text-gray-700">
                                            Position
                                        </label>
                                        <div className="mt-1">
                                            <select
                                                {...register('positionId')}
                                                className={`
                          block w-full px-3 py-2 border 
                          ${errors.positionId ? 'border-red-300' : 'border-gray-300'}
                          rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                        `}
                                            >
                                                <option value="">Select a position</option>
                                                {positions.map((position) => (
                                                    <option key={position.id} value={position.id}>
                                                        {position.title} - {position.department}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {errors.positionId && (
                                            <p className="mt-1 text-sm text-red-600">{errors.positionId.message}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Error Message */}
                            {errors.root && (
                                <div className="rounded-md bg-red-50 p-4">
                                    <div className="text-sm text-red-700">{errors.root.message}</div>
                                </div>
                            )}

                            {/* Submit Buttons */}
                            <div className="border-t border-gray-200 pt-6">
                                <div className="flex justify-end space-x-3">
                                    <Link
                                        to="/users"
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`
                      inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
                      ${isSubmitting
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                            }
                    `}
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        {isSubmitting ? 'Updating...' : 'Update User'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserEdit;
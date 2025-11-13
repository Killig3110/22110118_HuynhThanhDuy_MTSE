import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Calendar, Camera, Eye, EyeOff, Lock } from 'lucide-react';
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
    password: yup
        .string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    phone: yup
        .string()
        .matches(/^[0-9+\-\s()]+$/, 'Invalid phone number format')
        .optional(),
    address: yup.string().optional(),
    dateOfBirth: yup.date().max(new Date(), 'Date of birth cannot be in the future').optional(),
    roleId: yup.number().optional(),
    positionId: yup.number().optional(),
});

const UserCreate = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [roles, setRoles] = useState([]);
    const [positions, setPositions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm({
        resolver: yupResolver(schema),
    });

    useEffect(() => {
        fetchRoles();
        fetchPositions();
    }, []);

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

            // Create FormData for file upload
            const formData = new FormData();

            // Append form fields
            Object.keys(data).forEach(key => {
                if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
                    formData.append(key, data[key]);
                }
            });

            const response = await userAPI.createUser(formData);

            if (response.data.success) {
                toast.success('User created successfully!');
                navigate('/users');
            } else {
                setError('root', {
                    type: 'manual',
                    message: response.data.message || 'User creation failed'
                });
            }
        } catch (error) {
            console.error('Error creating user:', error);
            const message = error.response?.data?.message || 'User creation failed';
            setError('root', {
                type: 'manual',
                message
            });
        } finally {
            setIsSubmitting(false);
        }
    };

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
                    <div className="mt-2">
                        <h1 className="text-3xl font-bold leading-tight text-gray-900">
                            Create New User
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Add a new user to the system with role and position assignments.
                        </p>
                    </div>
                </div>

                {/* Form */}
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

                                    {/* Password */}
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                            Password *
                                        </label>
                                        <div className="mt-1 relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                {...register('password')}
                                                type={showPassword ? 'text' : 'password'}
                                                className={`
                          block w-full px-3 py-2 pl-10 pr-10 border 
                          ${errors.password ? 'border-red-300' : 'border-gray-300'}
                          rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                        `}
                                                placeholder="Enter password"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-5 w-5 text-gray-400" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
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
                                        {isSubmitting ? 'Creating...' : 'Create User'}
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

export default UserCreate;
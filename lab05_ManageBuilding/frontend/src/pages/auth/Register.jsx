import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Calendar, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

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
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('password'), null], 'Passwords must match')
        .required('Please confirm your password'),
    phone: yup
        .string()
        .matches(/^[0-9+\-\s()]+$/, 'Invalid phone number format')
        .optional(),
    address: yup.string().optional(),
    dateOfBirth: yup.date().max(new Date(), 'Date of birth cannot be in the future').optional(),
});

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { register: registerUser, isLoading } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            // role/position ignored for guests
        }
    });

    const onSubmit = async (data) => {
        const { confirmPassword, ...userData } = data;
        const result = await registerUser(userData);

        if (result.success) {
            navigate('/dashboard');
        } else {
            // map backend validation errors to fields
            if (result.errors && Array.isArray(result.errors)) {
                result.errors.forEach((err) => {
                    if (err.field) {
                        setError(err.field, {
                            type: 'server',
                            message: err.message || 'Invalid value'
                        });
                    }
                });
            }
            setError('root', {
                type: 'manual',
                message: result.message || 'Registration failed'
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <UserPlus className="mx-auto h-12 w-12 text-blue-600" />
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="font-medium text-blue-600 hover:text-blue-500"
                        >
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        {/* First Name & Last Name */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                                    First Name
                                </label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        {...register('firstName')}
                                        type="text"
                                        autoComplete="given-name"
                                        className={`
                      appearance-none relative block w-full px-3 py-2 pl-10 border 
                      ${errors.firstName ? 'border-red-300' : 'border-gray-300'}
                      placeholder-gray-500 text-gray-900 rounded-md focus:outline-none 
                      focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm
                    `}
                                        placeholder="First name"
                                    />
                                </div>
                                {errors.firstName && (
                                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                                    Last Name
                                </label>
                                <div className="mt-1">
                                    <input
                                        {...register('lastName')}
                                        type="text"
                                        autoComplete="family-name"
                                        className={`
                      appearance-none relative block w-full px-3 py-2 border 
                      ${errors.lastName ? 'border-red-300' : 'border-gray-300'}
                      placeholder-gray-500 text-gray-900 rounded-md focus:outline-none 
                      focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm
                    `}
                                        placeholder="Last name"
                                    />
                                </div>
                                {errors.lastName && (
                                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    {...register('email')}
                                    type="email"
                                    autoComplete="email"
                                    className={`
                    appearance-none relative block w-full px-3 py-2 pl-10 border 
                    ${errors.email ? 'border-red-300' : 'border-gray-300'}
                    placeholder-gray-500 text-gray-900 rounded-md focus:outline-none 
                    focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm
                  `}
                                    placeholder="Enter your email"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    className={`
                    appearance-none relative block w-full px-3 py-2 pl-10 pr-10 border 
                    ${errors.password ? 'border-red-300' : 'border-gray-300'}
                    placeholder-gray-500 text-gray-900 rounded-md focus:outline-none 
                    focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm
                  `}
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm Password
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    {...register('confirmPassword')}
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    className={`
                    appearance-none relative block w-full px-3 py-2 pl-10 pr-10 border 
                    ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'}
                    placeholder-gray-500 text-gray-900 rounded-md focus:outline-none 
                    focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm
                  `}
                                    placeholder="Confirm your password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        {/* Optional Fields */}
                        <div className="space-y-4 pt-4 border-t border-gray-200">
                            <p className="text-sm font-medium text-gray-700">Additional Information (Optional)</p>

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
                                        autoComplete="tel"
                                        className={`
                      appearance-none relative block w-full px-3 py-2 pl-10 border 
                      ${errors.phone ? 'border-red-300' : 'border-gray-300'}
                      placeholder-gray-500 text-gray-900 rounded-md focus:outline-none 
                      focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm
                    `}
                                        placeholder="Phone number"
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
                      appearance-none relative block w-full px-3 py-2 pl-10 border 
                      ${errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'}
                      placeholder-gray-500 text-gray-900 rounded-md focus:outline-none 
                      focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm
                    `}
                                    />
                                </div>
                                {errors.dateOfBirth && (
                                    <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
                                )}
                            </div>

                            {/* Address */}
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                    Address
                                </label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 pt-2 pointer-events-none">
                                        <MapPin className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <textarea
                                        {...register('address')}
                                        rows={3}
                                        className={`
                      appearance-none relative block w-full px-3 py-2 pl-10 border 
                      ${errors.address ? 'border-red-300' : 'border-gray-300'}
                      placeholder-gray-500 text-gray-900 rounded-md focus:outline-none 
                      focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm
                    `}
                                        placeholder="Enter your address"
                                    />
                                </div>
                                {errors.address && (
                                    <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                                )}
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Role
                                </label>
                                <div className="mt-1">
                                    <input
                                        className="appearance-none relative block w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 rounded-md sm:text-sm"
                                        value="Registered as guest/resident"
                                        disabled
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        {errors.root && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="text-sm text-red-700">{errors.root.message}</div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`
                  group relative w-full flex justify-center py-2 px-4 border border-transparent 
                  text-sm font-medium rounded-md text-white 
                  ${isLoading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                    }
                  transition duration-150 ease-in-out
                `}
                            >
                                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                    <UserPlus
                                        className={`h-5 w-5 ${isLoading ? 'text-gray-300' : 'text-blue-500 group-hover:text-blue-400'}`}
                                    />
                                </span>
                                {isLoading ? 'Creating account...' : 'Create Account'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;

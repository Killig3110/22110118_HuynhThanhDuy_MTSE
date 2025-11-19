import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const schema = yup.object({
    email: yup
        .string()
        .email('Please enter a valid email')
        .required('Email is required'),
    password: yup
        .string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
});

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showTestAccounts, setShowTestAccounts] = useState(false);
    const { login, isLoading } = useAuth();
    const navigate = useNavigate();

    // Test accounts from seeder
    const testAccounts = [
        { email: 'admin@building.com', password: '123456', role: 'Admin' },
        { email: 'blockmanager@building.com', password: '123456', role: 'Block Manager' },
        { email: 'buildingmanager@building.com', password: '123456', role: 'Building Manager' },
        { email: 'resident@building.com', password: '123456', role: 'Resident' },
        { email: 'student@building.com', password: '123456', role: 'Student' },
        { email: 'security@building.com', password: '123456', role: 'Security' }
    ];

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        setValue,
    } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
        const result = await login(data);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError('root', {
                type: 'manual',
                message: result.message || 'Login failed'
            });
        }
    };

    const handleTestLogin = (account) => {
        setValue('email', account.email);
        setValue('password', account.password);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <LogIn className="mx-auto h-12 w-12 text-blue-600" />
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Or{' '}
                        <Link
                            to="/register"
                            className="font-medium text-blue-600 hover:text-blue-500"
                        >
                            create a new account
                        </Link>
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        {/* Email Field */}
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

                        {/* Password Field */}
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
                                    autoComplete="current-password"
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

                        {/* Remember & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link
                                    to="/forgot-password"
                                    className="font-medium text-blue-600 hover:text-blue-500"
                                >
                                    Forgot your password?
                                </Link>
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
                                    <LogIn
                                        className={`h-5 w-5 ${isLoading ? 'text-gray-300' : 'text-blue-500 group-hover:text-blue-400'}`}
                                    />
                                </span>
                                {isLoading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>

                    {/* Test Credentials */}
                    <div className="mt-6">
                        <button
                            type="button"
                            onClick={() => setShowTestAccounts(!showTestAccounts)}
                            className="w-full text-sm text-blue-600 hover:text-blue-800 underline focus:outline-none"
                        >
                            {showTestAccounts ? 'Hide' : 'Show'} Test Accounts
                        </button>

                        {showTestAccounts && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-md border">
                                <h3 className="text-sm font-medium text-gray-900 mb-3">Available Test Accounts:</h3>
                                <div className="space-y-2">
                                    {testAccounts.map((account, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => handleTestLogin(account)}
                                            className="w-full text-left p-3 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        >
                                            <div className="font-medium text-gray-900">{account.role}</div>
                                            <div className="text-gray-600">{account.email}</div>
                                            <div className="text-xs text-gray-500">Password: {account.password}</div>
                                        </button>
                                    ))}
                                </div>
                                <p className="mt-3 text-xs text-gray-500">
                                    Click any account to auto-fill the login form
                                </p>
                            </div>
                        )}

                        {/* Security Features Notice */}
                        <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
                            <h3 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                                🔒 Security Features Implemented:
                            </h3>
                            <ul className="text-xs text-blue-800 space-y-1">
                                <li>• <strong>Rate Limiting:</strong> Max 10 login attempts per 15 minutes</li>
                                <li>• <strong>Input Validation:</strong> Email & password validation with sanitization</li>
                                <li>• <strong>Authentication:</strong> JWT tokens with 15-minute expiry</li>
                                <li>• <strong>Authorization:</strong> Role-based access control (6 user roles)</li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-6 border-t border-gray-200 pt-6">
                        <div className="text-sm text-gray-600">
                            <p className="font-medium mb-2">Test Credentials:</p>
                            <div className="space-y-1 text-xs">
                                <p><strong>Admin:</strong> admin@example.com / admin123</p>
                                <p><strong>Manager:</strong> manager@example.com / manager123</p>
                                <p><strong>Employee:</strong> alice@example.com / alice123</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
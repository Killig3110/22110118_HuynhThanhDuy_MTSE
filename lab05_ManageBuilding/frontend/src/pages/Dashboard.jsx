import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Users, Building2, Home, TrendingUp, Calendar, Clock, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();

    const stats = [
        {
            id: 1,
            name: 'Total Buildings',
            value: '10',
            change: '+0%',
            changeType: 'neutral',
            icon: Building2,
        },
        {
            id: 2,
            name: 'Total Apartments',
            value: '1,600',
            change: '+0%',
            changeType: 'neutral',
            icon: Home,
        },
        {
            id: 3,
            name: 'Occupied Apartments',
            value: '24',
            change: '+1.5%',
            changeType: 'increase',
            icon: Users,
        },
        {
            id: 4,
            name: 'Occupancy Rate',
            value: '1.5%',
            change: '+0.1%',
            changeType: 'increase',
            icon: TrendingUp,
        },
    ];

    const recentActivities = [
        {
            id: 1,
            type: 'new_resident',
            message: 'New resident moved to apartment S.01-0102',
            time: '2 hours ago',
            icon: Users,
            color: 'text-green-600',
        },
        {
            id: 2,
            type: 'maintenance_request',
            message: 'Maintenance requested for S.01 elevator',
            time: '4 hours ago',
            icon: Clock,
            color: 'text-yellow-600',
        },
        {
            id: 3,
            type: 'payment_received',
            message: 'Rent payment received from apt S.01-0101',
            time: '1 day ago',
            icon: TrendingUp,
            color: 'text-blue-600',
        },
        {
            id: 4,
            type: 'visitor_registered',
            message: 'Visitor registered for apartment S.01-0103',
            time: '2 days ago',
            icon: Users,
            color: 'text-purple-600',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="px-4 py-6 sm:px-0">
                    <div className="border-b border-gray-200 pb-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold leading-tight text-gray-900">
                                    Welcome back, {user?.firstName}!
                                </h1>
                                <p className="mt-2 text-sm text-gray-600">
                                    Here's what's happening with your application today.
                                </p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center text-sm text-gray-500">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    {new Date().toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Info Card */}
                <div className="px-4 sm:px-0 mb-8">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="h-16 w-16 rounded-full overflow-hidden border-4 border-blue-300">
                                    {user?.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                // Fallback to initials if image fails to load
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div
                                        className={`h-full w-full bg-blue-500 rounded-full flex items-center justify-center ${user?.avatar ? 'hidden' : 'flex'}`}
                                    >
                                        <span className="text-xl font-bold text-white">
                                            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="ml-6">
                                <h2 className="text-xl font-bold text-white">
                                    {user?.firstName} {user?.lastName}
                                </h2>
                                <p className="text-blue-100">{user?.email}</p>
                                <div className="flex items-center mt-2 space-x-4">
                                    {user?.role && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            <Award className="h-3 w-3 mr-1" />
                                            {user.role.name}
                                        </span>
                                    )}
                                    {user?.position && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-blue-800">
                                            {user.position.title}
                                        </span>
                                    )}
                                    {user?.lastLogin && (
                                        <span className="text-blue-100 text-sm flex items-center">
                                            <Clock className="h-3 w-3 mr-1" />
                                            Last login: {new Date(user.lastLogin).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                {(user?.role?.name === 'admin' || user?.role?.name === 'building_manager') && (
                    <div className="px-4 sm:px-0 mb-8">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Overview</h3>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {stats.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.id} className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden">
                                        <dt>
                                            <div className="absolute bg-blue-500 rounded-md p-3">
                                                <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                                            </div>
                                            <p className="ml-16 text-sm font-medium text-gray-500 truncate">{item.name}</p>
                                        </dt>
                                        <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                                            <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
                                            <p
                                                className={`ml-2 flex items-baseline text-sm font-semibold ${item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                                                    }`}
                                            >
                                                {item.change}
                                            </p>
                                        </dd>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="px-4 sm:px-0 mb-8">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Link
                            to="/buildings"
                            className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow hover:shadow-md transition-shadow"
                        >
                            <div>
                                <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-600 ring-4 ring-white">
                                    <Building2 className="h-6 w-6" aria-hidden="true" />
                                </span>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    View Buildings
                                </h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    Browse all buildings and apartment information.
                                </p>
                            </div>
                        </Link>

                        {user?.role?.name === 'admin' || user?.role?.name === 'building_manager' ? (
                            <Link
                                to="/residents"
                                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow hover:shadow-md transition-shadow"
                            >
                                <div>
                                    <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-600 ring-4 ring-white">
                                        <Users className="h-6 w-6" aria-hidden="true" />
                                    </span>
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        <span className="absolute inset-0" aria-hidden="true" />
                                        Manage Residents
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-500">
                                        View and manage resident information and apartments.
                                    </p>
                                </div>
                            </Link>
                        ) : null}

                        {user?.role?.name === 'admin' ? (
                            <Link
                                to="/management"
                                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow hover:shadow-md transition-shadow"
                            >
                                <div>
                                    <span className="rounded-lg inline-flex p-3 bg-yellow-50 text-yellow-600 ring-4 ring-white">
                                        <Award className="h-6 w-6" aria-hidden="true" />
                                    </span>
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        <span className="absolute inset-0" aria-hidden="true" />
                                        System Management
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Manage users, roles, and system configurations.
                                    </p>
                                </div>
                            </Link>
                        ) : null}

                        <Link
                            to="/profile"
                            className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow hover:shadow-md transition-shadow"
                        >
                            <div>
                                <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-600 ring-4 ring-white">
                                    <Users className="h-6 w-6" aria-hidden="true" />
                                </span>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    My Profile
                                </h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    Update your personal information and account settings.
                                </p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Recent Activities */}
                {(user?.role?.name === 'admin' || user?.role?.name === 'building_manager') && (
                    <div className="px-4 sm:px-0">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activities</h3>
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h4 className="text-sm font-medium text-gray-900">System Activity</h4>
                            </div>
                            <ul role="list" className="divide-y divide-gray-200">
                                {recentActivities.map((activity) => {
                                    const Icon = activity.icon;
                                    return (
                                        <li key={activity.id} className="px-6 py-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-shrink-0">
                                                    <Icon className={`h-6 w-6 ${activity.color}`} aria-hidden="true" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {activity.message}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{activity.time}</p>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
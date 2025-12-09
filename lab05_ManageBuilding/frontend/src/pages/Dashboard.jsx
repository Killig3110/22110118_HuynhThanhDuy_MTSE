import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Users, Building2, Home, TrendingUp, Calendar, Clock, Award, ShoppingBag, ShoppingCart, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { buildingAPI, searchAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
    const { user } = useAuth();
    const role = user?.role?.name;
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState([]);
    const [apartmentStats, setApartmentStats] = useState({ occupied: 0, forRent: 0, forSale: 0, total: 0 });
    const recentActivities = [];

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const buildingRes = await buildingAPI.list({ limit: 200 });
                const buildings =
                    buildingRes.data?.data?.buildings ||
                    buildingRes.data?.data ||
                    buildingRes.data?.items ||
                    buildingRes.data ||
                    [];
                const pagination = buildingRes.data?.data?.pagination;
                const buildingCount = pagination?.totalItems ?? (Array.isArray(buildings) ? buildings.length : 0);

                const apartmentsRes = await searchAPI.searchApartments({ limit: 100 });
                const apartments = apartmentsRes.data?.data || apartmentsRes.data?.items || apartmentsRes.data || [];
                const occupied = apartments.filter((a) => a.status === 'occupied').length;
                const forRent = apartments.filter((a) => a.isListedForRent).length;
                const forSale = apartments.filter((a) => a.isListedForSale).length;
                const totalApt = apartments.length;
                setApartmentStats({ occupied, forRent, forSale, total: totalApt });
                const occupancyRate = totalApt > 0 ? ((occupied / totalApt) * 100).toFixed(1) + '%' : '0%';
                setStats([
                    { id: 1, name: 'Total Buildings', value: buildingCount, change: '', changeType: 'neutral', icon: Building2 },
                    { id: 2, name: 'Total Apartments', value: totalApt, change: '', changeType: 'neutral', icon: Home },
                    { id: 3, name: 'Occupied Apartments', value: occupied, change: '', changeType: 'neutral', icon: Users },
                    { id: 4, name: 'Occupancy Rate', value: occupancyRate, change: '', changeType: 'increase', icon: TrendingUp },
                ]);
            } catch (error) {
                console.error('Load dashboard data failed', error);
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

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

                {/* My Cart Widget */}
                <MyCartWidget />

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

// MyCart Widget Component
const MyCartWidget = () => {
    const { cartItems, calculateTotals, isLoading } = useCart();
    const totals = calculateTotals();

    if (isLoading) {
        return null;
    }

    if (cartItems.length === 0) {
        return null;
    }

    return (
        <div className="px-4 sm:px-0 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <ShoppingCart className="h-8 w-8 mr-3" />
                        <h3 className="text-xl font-bold">My Cart</h3>
                    </div>
                    <Link
                        to="/cart"
                        className="flex items-center text-sm font-medium hover:text-blue-100 transition-colors"
                    >
                        View Cart
                        <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                        <p className="text-sm opacity-90 mb-1">Total Items</p>
                        <p className="text-3xl font-bold">{totals.totalItems}</p>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                        <p className="text-sm opacity-90 mb-1">Selected Items</p>
                        <p className="text-3xl font-bold">{totals.selectedItems}</p>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                        <p className="text-sm opacity-90 mb-1">Total Value</p>
                        <p className="text-2xl font-bold">${totals.grandTotal.toLocaleString()}</p>
                    </div>
                </div>

                {totals.selectedItems > 0 && (
                    <div className="mt-4">
                        <Link
                            to="/checkout"
                            className="block w-full bg-white text-blue-600 text-center py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                        >
                            Proceed to Checkout
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;

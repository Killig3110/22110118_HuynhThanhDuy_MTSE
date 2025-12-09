import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Building2,
    Home,
    Users,
    TrendingUp,
    ShoppingCart,
    FileText,
    MapPin,
    Search,
    Calendar,
    Clock,
    Award,
    ChevronRight,
    Activity,
    DollarSign,
    Package
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { buildingAPI, searchAPI, apartmentAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const DashboardNew = () => {
    const { user } = useAuth();
    const { cartItems } = useCart();
    const navigate = useNavigate();
    const role = user?.role?.name;

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        buildings: 0,
        apartments: 0,
        occupied: 0,
        available: 0,
        forRent: 0,
        forSale: 0,
        occupancyRate: 0,
    });

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Load buildings
            const buildingRes = await buildingAPI.list({ limit: 200 });
            const buildings = buildingRes.data?.data?.buildings || buildingRes.data?.data || [];
            const buildingCount = buildings.length;

            // Load apartments
            const apartmentsRes = await searchAPI.searchApartments({ limit: 500 });
            const apartments = apartmentsRes.data?.data || [];

            const occupied = apartments.filter((a) => a.status === 'occupied').length;
            const available = apartments.filter((a) => a.status === 'vacant').length;
            const forRent = apartments.filter((a) => a.isListedForRent).length;
            const forSale = apartments.filter((a) => a.isListedForSale).length;
            const total = apartments.length;
            const occupancyRate = total > 0 ? ((occupied / total) * 100).toFixed(1) : 0;

            setStats({
                buildings: buildingCount,
                apartments: total,
                occupied,
                available,
                forRent,
                forSale,
                occupancyRate: parseFloat(occupancyRate),
            });
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    // Role-based quick actions
    const getQuickActions = () => {
        const staffRoles = ['admin', 'building_manager', 'security', 'technician', 'accountant'];
        const isStaff = staffRoles.includes(role);

        if (isStaff) {
            return [
                { name: 'Buildings', icon: Building2, href: '/buildings', color: 'blue', description: 'Manage buildings' },
                { name: 'Search', icon: Search, href: '/search', color: 'purple', description: 'Search apartments' },
                { name: 'Map View', icon: MapPin, href: '/buildings/map', color: 'green', description: 'View 3D map' },
                { name: 'Residents', icon: Users, href: '/residents', color: 'orange', description: 'Manage residents' },
            ];
        }

        if (role === 'resident') {
            return [
                { name: 'Marketplace', icon: ShoppingCart, href: '/marketplace', color: 'indigo', description: 'Browse apartments' },
                { name: 'My Cart', icon: Package, href: '/cart', color: 'pink', description: `${cartItems.length} items` },
                { name: 'My Requests', icon: FileText, href: '/my-requests', color: 'teal', description: 'View your requests' },
                { name: 'Map View', icon: MapPin, href: '/buildings/map', color: 'green', description: 'View 3D map' },
            ];
        }

        // User or guest
        return [
            { name: 'Marketplace', icon: ShoppingCart, href: '/marketplace', color: 'indigo', description: 'Browse apartments' },
            { name: 'My Cart', icon: Package, href: '/cart', color: 'pink', description: `${cartItems.length} items` },
            { name: 'Map View', icon: MapPin, href: '/buildings/map', color: 'green', description: 'Explore buildings' },
            { name: 'Search', icon: Search, href: '/search', color: 'purple', description: 'Find apartments' },
        ];
    };

    const quickActions = getQuickActions();

    // Stats cards data
    const statsCards = [
        {
            name: 'Total Buildings',
            value: stats.buildings,
            icon: Building2,
            color: 'blue',
            change: null,
        },
        {
            name: 'Total Apartments',
            value: stats.apartments,
            icon: Home,
            color: 'purple',
            change: null,
        },
        {
            name: 'Occupied',
            value: stats.occupied,
            icon: Users,
            color: 'green',
            subtitle: `${stats.available} available`,
        },
        {
            name: 'Occupancy Rate',
            value: `${stats.occupancyRate}%`,
            icon: TrendingUp,
            color: 'orange',
            change: stats.occupancyRate > 70 ? '+5.2%' : '-2.1%',
        },
    ];

    const marketplaceStats = [
        {
            name: 'For Rent',
            value: stats.forRent,
            icon: Home,
            color: 'blue',
        },
        {
            name: 'For Sale',
            value: stats.forSale,
            icon: DollarSign,
            color: 'emerald',
        },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                Welcome back, {user?.firstName}! 👋
                            </h1>
                            <p className="text-lg text-gray-600">
                                Here's your overview for today
                            </p>
                        </div>
                        <div className="hidden md:flex items-center space-x-4">
                            <div className="bg-white rounded-lg shadow-sm px-4 py-3 border border-gray-200">
                                <div className="flex items-center text-gray-600">
                                    <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                                    <span className="text-sm font-medium">
                                        {new Date().toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Profile Card */}
                <div className="mb-8">
                    <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>

                        <div className="relative flex items-center">
                            <div className="flex-shrink-0">
                                <div className="h-20 w-20 rounded-full bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center border-4 border-white border-opacity-30">
                                    {user?.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={`${user.firstName} ${user.lastName}`}
                                            className="h-full w-full rounded-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <span className={`text-3xl font-bold ${user?.avatar ? 'hidden' : 'block'}`}>
                                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                                    </span>
                                </div>
                            </div>
                            <div className="ml-6 flex-1">
                                <h2 className="text-2xl font-bold">
                                    {user?.firstName} {user?.lastName}
                                </h2>
                                <p className="text-blue-100 text-sm mt-1">{user?.email}</p>
                                <div className="flex items-center mt-3 space-x-3">
                                    {user?.role?.name && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white text-blue-700 shadow-sm">
                                            <Award className="h-3 w-3 mr-1" />
                                            {user.role.name}
                                        </span>
                                    )}
                                    {user?.position?.title && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 backdrop-blur-sm">
                                            {user.position.title}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="hidden lg:flex items-center text-blue-100 text-sm">
                                <Clock className="h-4 w-4 mr-2" />
                                <div>
                                    <p className="text-xs opacity-75">Last login</p>
                                    <p className="font-medium">
                                        {user?.lastLogin
                                            ? new Date(user.lastLogin).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                            : 'Today'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <Activity className="h-6 w-6 mr-2 text-blue-600" />
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickActions.map((action) => {
                            const Icon = action.icon;
                            const colorClasses = {
                                blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
                                purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
                                green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
                                orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
                                indigo: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
                                pink: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700',
                                teal: 'from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700',
                            };

                            return (
                                <Link
                                    key={action.name}
                                    to={action.href}
                                    className={`group bg-gradient-to-br ${colorClasses[action.color]} text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <Icon className="h-8 w-8 mb-3 opacity-90" />
                                            <h3 className="text-lg font-semibold mb-1">{action.name}</h3>
                                            <p className="text-sm opacity-90">{action.description}</p>
                                        </div>
                                        <ChevronRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Stats Grid - For Staff */}
                {['admin', 'building_manager'].includes(role) && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">System Overview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {statsCards.map((stat) => {
                                const Icon = stat.icon;
                                const bgColors = {
                                    blue: 'bg-blue-50',
                                    purple: 'bg-purple-50',
                                    green: 'bg-green-50',
                                    orange: 'bg-orange-50',
                                };
                                const iconColors = {
                                    blue: 'text-blue-600',
                                    purple: 'text-purple-600',
                                    green: 'text-green-600',
                                    orange: 'text-orange-600',
                                };

                                return (
                                    <div
                                        key={stat.name}
                                        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`${bgColors[stat.color]} p-3 rounded-lg`}>
                                                <Icon className={`h-6 w-6 ${iconColors[stat.color]}`} />
                                            </div>
                                            {stat.change && (
                                                <span className="text-sm font-medium text-green-600">
                                                    {stat.change}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-600 text-sm font-medium mb-1">{stat.name}</p>
                                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                        {stat.subtitle && (
                                            <p className="text-sm text-gray-500 mt-2">{stat.subtitle}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Marketplace Stats - For Users/Residents */}
                {['user', 'resident'].includes(role) && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Available Now</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {marketplaceStats.map((stat) => {
                                const Icon = stat.icon;
                                const bgGradients = {
                                    blue: 'from-blue-500 to-blue-600',
                                    emerald: 'from-emerald-500 to-emerald-600',
                                };

                                return (
                                    <div
                                        key={stat.name}
                                        className={`bg-gradient-to-br ${bgGradients[stat.color]} text-white rounded-xl shadow-lg p-6`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-white text-opacity-90 text-sm font-medium mb-2">
                                                    {stat.name}
                                                </p>
                                                <p className="text-5xl font-bold">{stat.value}</p>
                                                <Link
                                                    to="/marketplace"
                                                    className="inline-flex items-center mt-4 text-sm font-medium hover:underline"
                                                >
                                                    Browse now
                                                    <ChevronRight className="h-4 w-4 ml-1" />
                                                </Link>
                                            </div>
                                            <Icon className="h-16 w-16 opacity-20" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Footer CTA */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white text-center">
                    <h3 className="text-2xl font-bold mb-2">Need Help?</h3>
                    <p className="text-indigo-100 mb-6">
                        Our support team is here to assist you 24/7
                    </p>
                    <button className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors">
                        Contact Support
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardNew;

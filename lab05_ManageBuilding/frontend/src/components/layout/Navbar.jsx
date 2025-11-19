import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, LogOut, User, Users, UserPlus, Home, Bell, Building2 } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 w-full z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Left side - Logo and Navigation */}
                    <div className="flex items-center">
                        <Link to="/dashboard" className="flex-shrink-0 flex items-center">
                            <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center">
                                <span className="text-white font-bold text-sm">BM</span>
                            </div>
                            <span className="ml-2 text-xl font-semibold text-gray-900">Building Management</span>
                        </Link>

                        {/* Navigation Links */}
                        <div className="hidden md:ml-6 md:flex md:space-x-8">
                            <Link
                                to="/dashboard"
                                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                            >
                                <Home className="h-4 w-4 mr-2" />
                                Dashboard
                            </Link>

                            <Link
                                to="/buildings"
                                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                <Building2 className="h-4 w-4 mr-2" />
                                Buildings
                            </Link>

                            {(user?.role?.name === 'admin' || user?.role?.name === 'building_manager') && (
                                <Link
                                    to="/residents"
                                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                                >
                                    <Users className="h-4 w-4 mr-2" />
                                    Residents
                                </Link>
                            )}

                            {user?.role?.name === 'admin' && (
                                <Link
                                    to="/management"
                                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                                >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Management
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Right side - User menu */}
                    <div className="flex items-center space-x-4">
                        {/* Notifications */}
                        <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <span className="sr-only">View notifications</span>
                            <Bell className="h-6 w-6" />
                        </button>

                        {/* User Profile Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 p-2 hover:bg-gray-50 transition-colors">
                                <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-gray-200">
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
                                        <span className="text-white font-medium text-sm">
                                            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                                        </span>
                                    </div>
                                </div>
                                <div className="hidden md:block text-left">
                                    <div className="text-sm font-medium text-gray-900">
                                        {user?.firstName} {user?.lastName}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {user?.role?.name}
                                    </div>
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-1">
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <p className="text-sm font-medium text-gray-900">
                                        {user?.firstName} {user?.lastName}
                                    </p>
                                    <p className="text-sm text-gray-500">{user?.email}</p>
                                </div>

                                <Link
                                    to="/profile"
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    <User className="h-4 w-4 mr-3" />
                                    Your Profile
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    <LogOut className="h-4 w-4 mr-3" />
                                    Sign out
                                </button>
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                type="button"
                                className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                                aria-controls="mobile-menu"
                                aria-expanded="false"
                            >
                                <span className="sr-only">Open main menu</span>
                                <Menu className="block h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu - hidden by default */}
            <div className="md:hidden" id="mobile-menu">
                <div className="pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
                    <Link
                        to="/dashboard"
                        className="flex items-center px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                    >
                        <Home className="h-5 w-5 mr-3" />
                        Dashboard
                    </Link>

                    <Link
                        to="/buildings"
                        className="flex items-center px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                        <Building2 className="h-5 w-5 mr-3" />
                        Buildings
                    </Link>

                    {(user?.role?.name === 'admin' || user?.role?.name === 'building_manager') && (
                        <Link
                            to="/residents"
                            className="flex items-center px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                        >
                            <Users className="h-5 w-5 mr-3" />
                            Residents
                        </Link>
                    )}

                    {user?.role?.name === 'admin' && (
                        <Link
                            to="/management"
                            className="flex items-center px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                        >
                            <UserPlus className="h-5 w-5 mr-3" />
                            Management
                        </Link>
                    )}

                    <Link
                        to="/profile"
                        className="flex items-center px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                        <User className="h-5 w-5 mr-3" />
                        Profile
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                        <LogOut className="h-5 w-5 mr-3" />
                        Sign out
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
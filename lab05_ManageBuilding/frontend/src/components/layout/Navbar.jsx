import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { Menu, LogOut, User, Users, UserPlus, Home, Bell, Building2, MapPin, Search, ClipboardList, ShoppingBag, HomeIcon, ShoppingCart } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { cartItemCount } = useCart();
    const role = user?.role?.name;

    const mainLinks = useMemo(() => {
        const links = [];

        if (!user) {
            links.push({ to: '/buildings/map', label: 'Interactive Map', icon: MapPin, show: true });
            links.push({ to: '/marketplace', label: 'Marketplace', icon: ShoppingBag, show: true });
            return links;
        }

        // Authenticated users
        links.push({ to: '/dashboard', label: 'Dashboard', icon: Home, show: true });
        links.push({ to: '/buildings', label: 'Buildings', icon: Building2, show: role !== 'guest' });
        links.push({ to: '/buildings/map', label: 'Interactive Map', icon: MapPin, show: true });
        links.push({ to: '/marketplace', label: 'Marketplace', icon: ShoppingBag, show: true });
        links.push({ to: '/search', label: 'Search', icon: Search, show: true });

        if (role === 'resident') {
            links.push({ to: '/my-requests', label: 'My Requests', icon: ClipboardList, show: true });
            links.push({ to: '/my-apartments', label: 'My Apartments', icon: HomeIcon, show: true });
        }

        if (['admin', 'building_manager'].includes(role)) {
            links.push({ to: '/leases', label: 'Leases', icon: ClipboardList, show: true });
            links.push({ to: '/residents', label: 'Residents', icon: Users, show: true });
        }

        if (role === 'admin') {
            links.push({ to: '/management', label: 'User Management', icon: UserPlus, show: true });
        }

        return links;
    }, [role, user]);

    const handleLogout = () => {
        logout();
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 w-full z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Left side - Logo and Navigation */}
                    <div className="flex items-center">
                        <Link to={user ? "/dashboard" : "/home"} className="flex-shrink-0 flex items-center">
                            <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center">
                                <span className="text-white font-bold text-sm">BM</span>
                            </div>
                            <span className="ml-2 text-xl font-semibold text-gray-900">Building Management</span>
                        </Link>

                        {/* Navigation Links */}
                        <div className="hidden md:ml-6 md:flex md:space-x-4 lg:space-x-6 items-center">
                            {mainLinks.slice(0, 5).map((link) => (
                                link.show && (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                                    >
                                        <link.icon className="h-4 w-4 mr-2" />
                                        {link.label}
                                    </Link>
                                )
                            ))}
                            {mainLinks.filter((l) => l.show).length > 5 && (
                                <div className="relative group">
                                    <button className="inline-flex items-center px-2 py-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors border border-gray-200 rounded-md">
                                        More
                                    </button>
                                    <div className="absolute left-0 mt-2 w-52 bg-white shadow-lg border border-gray-200 rounded-md py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                        {mainLinks.slice(5).map((link) => (
                                            link.show && (
                                                <Link
                                                    key={link.to}
                                                    to={link.to}
                                                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    <link.icon className="h-4 w-4 mr-2" />
                                                    {link.label}
                                                </Link>
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right side - User menu */}
                    <div className="flex items-center space-x-4">
                        {/* Cart Icon with Badge */}
                        {user && (
                            <Link
                                to="/cart"
                                className="relative p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <span className="sr-only">View cart</span>
                                <ShoppingCart className="h-6 w-6" />
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {cartItemCount > 9 ? '9+' : cartItemCount}
                                    </span>
                                )}
                            </Link>
                        )}

                        {/* Notifications - Only for authenticated users */}
                        {user && (
                            <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                <span className="sr-only">View notifications</span>
                                <Bell className="h-6 w-6" />
                            </button>
                        )}

                        {/* User Profile Dropdown or Guest Login/Register */}
                        {user ? (
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
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                                >
                                    Register
                                </Link>
                            </div>
                        )}

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
                    {mainLinks.filter((l) => l.show).map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className="flex items-center px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                        >
                            <link.icon className="h-5 w-5 mr-3" />
                            {link.label}
                        </Link>
                    ))}

                    {user ? (
                        <>
                            <Link
                                to="/profile"
                                className="flex items-center px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                            >
                                <User className="h-5 w-5 mr-3" />
                                Profile
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                            >
                                <LogOut className="h-5 w-5 mr-3" />
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="flex items-center px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                            >
                                <User className="h-5 w-5 mr-3" />
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="flex items-center px-3 py-2 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 mx-3 rounded-md transition-colors"
                            >
                                <UserPlus className="h-5 w-5 mr-3" />
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

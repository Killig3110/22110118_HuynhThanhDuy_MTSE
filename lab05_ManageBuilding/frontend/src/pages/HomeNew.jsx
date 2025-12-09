import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Building2,
    Home,
    MapPin,
    Search,
    ShoppingCart,
    Shield,
    Clock,
    Award,
    ArrowRight,
    CheckCircle,
    Users,
    Sparkles,
    TrendingUp
} from 'lucide-react';

const HomePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const features = [
        {
            icon: Building2,
            title: '3D Building Explorer',
            description: 'Navigate through buildings with interactive 3D visualization',
            color: 'blue',
        },
        {
            icon: Search,
            title: 'Smart Search',
            description: 'Find your perfect apartment with advanced filters',
            color: 'purple',
        },
        {
            icon: ShoppingCart,
            title: 'Easy Cart System',
            description: 'Add multiple apartments and request in one click',
            color: 'indigo',
        },
        {
            icon: Shield,
            title: 'Secure Process',
            description: 'Safe and transparent approval workflow',
            color: 'green',
        },
        {
            icon: Clock,
            title: 'Real-time Updates',
            description: 'Track your requests with instant notifications',
            color: 'orange',
        },
        {
            icon: Award,
            title: 'Premium Management',
            description: 'Professional building administration team',
            color: 'pink',
        },
    ];

    const stats = [
        { label: 'Buildings', value: '10+', icon: Building2 },
        { label: 'Apartments', value: '360+', icon: Home },
        { label: 'Happy Residents', value: '500+', icon: Users },
        { label: 'Occupancy Rate', value: '92%', icon: TrendingUp },
    ];

    const howItWorks = [
        {
            step: '1',
            title: 'Browse & Explore',
            description: 'Explore our marketplace or use the 3D map to find apartments',
        },
        {
            step: '2',
            title: 'Add to Cart',
            description: 'Select multiple apartments and add them to your cart',
        },
        {
            step: '3',
            title: 'Submit Request',
            description: 'Submit your requests with your contact information',
        },
        {
            step: '4',
            title: 'Get Approved',
            description: 'Our team reviews and approves your request quickly',
        },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920')] bg-cover bg-center opacity-10"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                    <div className="text-center">
                        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
                            Find Your Dream
                            <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                                Apartment
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                            Modern building management system with 3D visualization, smart search, and seamless rental process
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                            {!user ? (
                                <>
                                    <Link
                                        to="/marketplace"
                                        className="group inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-full font-bold text-lg shadow-2xl hover:shadow-3xl hover:bg-blue-50 transition-all transform hover:scale-105"
                                    >
                                        <ShoppingCart className="h-6 w-6 mr-2" />
                                        Browse Marketplace
                                        <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <Link
                                        to="/buildings/map"
                                        className="inline-flex items-center px-8 py-4 bg-white bg-opacity-20 backdrop-blur-sm rounded-full font-bold text-lg border-2 border-white hover:bg-opacity-30 transition-all"
                                    >
                                        <MapPin className="h-6 w-6 mr-2 " />
                                        Explore 3D Map
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/dashboard"
                                        className="group inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-full font-bold text-lg shadow-2xl hover:shadow-3xl hover:bg-blue-50 transition-all transform hover:scale-105"
                                    >
                                        <Sparkles className="h-6 w-6 mr-2" />
                                        Go to Dashboard
                                        <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <Link
                                        to="/marketplace"
                                        className="inline-flex items-center px-8 py-4 bg-white bg-opacity-20 backdrop-blur-sm text-black rounded-full font-bold text-lg border-2 border-white hover:bg-opacity-30 transition-all"
                                    >
                                        <ShoppingCart className="h-6 w-6 mr-2" />
                                        Marketplace
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Floating User Badge */}
                        {user && (
                            <div className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-black border border-white border-opacity-30">
                                <div className="h-8 w-8 rounded-full bg-white bg-opacity-30 flex items-center justify-center mr-3">
                                    <span className="text-sm font-bold">{user.firstName?.charAt(0)}</span>
                                </div>
                                <span className="text-sm font-medium">Welcome, {user.firstName}!</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Wave Separator */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="white" />
                    </svg>
                </div>
            </div>

            {/* Stats Section */}
            <div className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <div key={stat.label} className="text-center">
                                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white mb-4">
                                        <Icon className="h-8 w-8" />
                                    </div>
                                    <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                                    <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Why Choose Our Platform?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Experience modern apartment hunting with cutting-edge features designed for your convenience
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature) => {
                            const Icon = feature.icon;
                            const gradients = {
                                blue: 'from-blue-500 to-blue-600',
                                purple: 'from-purple-500 to-purple-600',
                                indigo: 'from-indigo-500 to-indigo-600',
                                green: 'from-green-500 to-green-600',
                                orange: 'from-orange-500 to-orange-600',
                                pink: 'from-pink-500 to-pink-600',
                            };

                            return (
                                <div
                                    key={feature.title}
                                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 border border-gray-100"
                                >
                                    <div className={`inline-flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br ${gradients[feature.color]} text-white mb-6 group-hover:scale-110 transition-transform`}>
                                        <Icon className="h-7 w-7" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* How It Works Section */}
            <div className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            How It Works
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Simple 4-step process to find and rent your dream apartment
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {howItWorks.map((item, index) => (
                            <div key={item.step} className="relative">
                                <div className="bg-white rounded-2xl shadow-lg p-8 text-center h-full">
                                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl font-bold mb-6">
                                        {item.step}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-600">
                                        {item.description}
                                    </p>
                                </div>
                                {/* Arrow for desktop */}
                                {index < howItWorks.length - 1 && (
                                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                                        <ArrowRight className="h-8 w-8 text-blue-300" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-20 bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Ready to Find Your Perfect Home?
                    </h2>
                    <p className="text-xl text-blue-100 mb-10">
                        Join hundreds of satisfied residents who found their dream apartments with us
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to={user ? '/marketplace' : '/register'}
                            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-full font-bold text-lg shadow-2xl hover:shadow-3xl hover:bg-blue-50 transition-all transform hover:scale-105"
                        >
                            {user ? 'Start Browsing' : 'Get Started Free'}
                            <ArrowRight className="h-5 w-5 ml-2" />
                        </Link>
                        {!user && (
                            <Link
                                to="/login"
                                className="inline-flex items-center px-8 py-4 bg-white bg-opacity-20 backdrop-blur-sm text-black rounded-full font-bold text-lg border-2 border-white hover:bg-opacity-30 transition-all"
                            >
                                Already have an account?
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center mb-4">
                                <Building2 className="h-8 w-8 text-blue-500 mr-3" />
                                <span className="text-2xl font-bold text-white">BuildingHub</span>
                            </div>
                            <p className="text-gray-400 mb-4">
                                Modern building management system with 3D visualization and smart search features.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2">
                                <li><Link to="/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
                                <li><Link to="/buildings/map" className="hover:text-white transition-colors">3D Map</Link></li>
                                <li><Link to="/search" className="hover:text-white transition-colors">Search</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Support</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
                        <p>&copy; {new Date().getFullYear()} BuildingHub. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/layout/Navbar';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import HomePage from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import UserList from './pages/users/UserList';
import UserCreate from './pages/users/UserCreate';
import UserEdit from './pages/users/UserEdit';
import BuildingList from './pages/buildings/BuildingList';
import InteractiveBuildingMap from './pages/buildings/InteractiveBuildingMap';
import SearchPage from './pages/Search';
import LeaseRequests from './pages/leases/LeaseRequests';
import Marketplace from './pages/marketplace/Marketplace';
import MyRequests from './pages/leases/MyRequests';
import MyApartments from './pages/apartments/MyApartments';
import CartPage from './pages/cart/CartPage';
import CartManagement from './pages/cart/CartManagement';
import CheckoutPage from './pages/checkout/CheckoutPage';
import BlockManager from './pages/admin/BlockManager';
import BuildingManager from './pages/admin/BuildingManager';
import FloorManager from './pages/admin/FloorManager';
import ApartmentManager from './pages/admin/ApartmentManager';
import UserManager from './pages/admin/UserManager';
import Residents from './pages/residents/Residents';

const managementRoles = ['admin', 'building_manager', 'security', 'technician', 'accountant'];

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/home" replace />;
    }

    if (requiredRole) {
        const userRole = user.role?.name;
        if (requiredRole === 'admin' && userRole !== 'admin') {
            return <Navigate to="/home" replace />;
        }
        if (requiredRole === 'building_manager' && !['admin', 'building_manager'].includes(userRole)) {
            return <Navigate to="/home" replace />;
        }
    }

    return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    if (user) {
        const role = user.role?.name;
        const target = managementRoles.includes(role) ? '/dashboard' : '/home';
        return <Navigate to={target} replace />;
    }

    return children;
};

// App Layout Component
const AppLayout = ({ children }) => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            {user && <Navbar />}
            <main className={user ? "pt-16" : ""}>
                {children}
            </main>
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <Router>
                    <AppLayout>
                        <Routes>
                            <Route path="/home" element={<HomePage />} />
                            {/* Public Routes */}
                            <Route
                                path="/login"
                                element={
                                    <PublicRoute>
                                        <Login />
                                    </PublicRoute>
                                }
                            />
                            <Route
                                path="/register"
                                element={
                                    <PublicRoute>
                                        <Register />
                                    </PublicRoute>
                                }
                            />
                            <Route
                                path="/forgot-password"
                                element={
                                    <PublicRoute>
                                        <ForgotPassword />
                                    </PublicRoute>
                                }
                            />
                            <Route
                                path="/reset-password/:token"
                                element={
                                    <PublicRoute>
                                        <ResetPassword />
                                    </PublicRoute>
                                }
                            />

                            {/* Protected Routes */}
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/profile"
                                element={
                                    <ProtectedRoute>
                                        <Profile />
                                    </ProtectedRoute>
                                }
                            />

                            {/* System Management Routes (Admin only) */}
                            <Route
                                path="/management"
                                element={
                                    <ProtectedRoute requiredRole="admin">
                                        <UserList />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/management/users/create"
                                element={
                                    <ProtectedRoute requiredRole="admin">
                                        <UserCreate />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/management/users/edit/:id"
                                element={
                                    <ProtectedRoute requiredRole="admin">
                                        <UserEdit />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Building Management Routes - Public Access for Guest Viewing */}
                            <Route
                                path="/buildings"
                                element={<BuildingList />}
                            />
                            <Route
                                path="/buildings/map"
                                element={<InteractiveBuildingMap />}
                            />
                            <Route
                                path="/search"
                                element={
                                    <ProtectedRoute>
                                        <SearchPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/leases"
                                element={
                                    <ProtectedRoute>
                                        <LeaseRequests />
                                    </ProtectedRoute>
                                }
                            />
                            {/* Marketplace - Public Access */}
                            <Route
                                path="/marketplace"
                                element={<Marketplace />}
                            />
                            <Route
                                path="/cart"
                                element={
                                    <ProtectedRoute>
                                        <CartPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/cart/manage"
                                element={
                                    <ProtectedRoute>
                                        <CartManagement />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/checkout"
                                element={
                                    <ProtectedRoute>
                                        <CheckoutPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/my-requests"
                                element={
                                    <ProtectedRoute>
                                        <MyRequests />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/my-apartments"
                                element={
                                    <ProtectedRoute>
                                        <MyApartments />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/residents"
                                element={
                                    <ProtectedRoute requiredRole="building_manager">
                                        <Residents />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/blocks"
                                element={
                                    <ProtectedRoute requiredRole="admin">
                                        <BlockManager />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/buildings"
                                element={
                                    <ProtectedRoute requiredRole="admin">
                                        <BuildingManager />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/floors"
                                element={
                                    <ProtectedRoute requiredRole="admin">
                                        <FloorManager />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/apartments"
                                element={
                                    <ProtectedRoute requiredRole="admin">
                                        <ApartmentManager />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/users"
                                element={
                                    <ProtectedRoute requiredRole="admin">
                                        <UserManager />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Default Routes */}
                            <Route path="*" element={<Navigate to="/home" replace />} />
                        </Routes>

                        {/* Toast Notifications */}
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                duration: 4000,
                                style: {
                                    background: '#363636',
                                    color: '#fff',
                                },
                                success: {
                                    duration: 3000,
                                    iconTheme: {
                                        primary: '#28a745',
                                        secondary: '#fff',
                                    },
                                },
                                error: {
                                    duration: 5000,
                                    iconTheme: {
                                        primary: '#dc3545',
                                        secondary: '#fff',
                                    },
                                },
                            }}
                        />
                    </AppLayout>
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;

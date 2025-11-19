import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import UserList from './pages/users/UserList';
import UserCreate from './pages/users/UserCreate';
import UserEdit from './pages/users/UserEdit';
import BuildingList from './pages/buildings/BuildingList';
import InteractiveBuildingMap from './pages/buildings/InteractiveBuildingMap';

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
        return <Navigate to="/login" replace />;
    }

    if (requiredRole) {
        const userRole = user.role?.name;

        if (requiredRole === 'admin' && userRole !== 'admin') {
            return <Navigate to="/dashboard" replace />;
        }

        if (requiredRole === 'building_manager' && !['admin', 'building_manager'].includes(userRole)) {
            return <Navigate to="/dashboard" replace />;
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
        return <Navigate to="/dashboard" replace />;
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
            <Router>
                <AppLayout>
                    <Routes>
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

                        {/* Building Management Routes */}
                        <Route
                            path="/buildings"
                            element={
                                <ProtectedRoute>
                                    <BuildingList />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/buildings/map"
                            element={
                                <ProtectedRoute>
                                    <InteractiveBuildingMap />
                                </ProtectedRoute>
                            }
                        />

                        {/* Default Routes */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
        </AuthProvider>
    );
}

export default App;
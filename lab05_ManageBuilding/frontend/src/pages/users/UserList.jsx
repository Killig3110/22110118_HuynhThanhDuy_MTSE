import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, ToggleLeft, ToggleRight, Filter, Users, User } from 'lucide-react';
import { userAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const UserList = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    });

    // Filters
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [positionFilter, setPositionFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Fetch data
    useEffect(() => {
        fetchUsers();
        fetchRoles();
        fetchPositions();
    }, [pagination.currentPage, search, roleFilter, positionFilter, statusFilter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.currentPage,
                limit: pagination.itemsPerPage,
                search: search.trim() || undefined,
                roleId: roleFilter || undefined,
                positionId: positionFilter || undefined,
                isActive: statusFilter !== '' ? statusFilter : undefined,
            };

            const response = await userAPI.getUsers(params);
            if (response.data.success) {
                setUsers(response.data.data.users);
                setPagination({
                    ...pagination,
                    ...response.data.data.pagination
                });
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await userAPI.getRoles();
            if (response.data.success) {
                setRoles(response.data.data.roles);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const fetchPositions = async () => {
        try {
            const response = await userAPI.getPositions();
            if (response.data.success) {
                setPositions(response.data.data.positions);
            }
        } catch (error) {
            console.error('Error fetching positions:', error);
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
            try {
                const response = await userAPI.deleteUser(userId);
                if (response.data.success) {
                    toast.success('User deleted successfully');
                    fetchUsers();
                }
            } catch (error) {
                console.error('Error deleting user:', error);
                toast.error('Failed to delete user');
            }
        }
    };

    const handleToggleStatus = async (userId, currentStatus, userName) => {
        try {
            const response = await userAPI.toggleUserStatus(userId);
            if (response.data.success) {
                toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
                fetchUsers();
            }
        } catch (error) {
            console.error('Error toggling user status:', error);
            toast.error('Failed to update user status');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination({ ...pagination, currentPage: 1 });
        fetchUsers();
    };

    const clearFilters = () => {
        setSearch('');
        setRoleFilter('');
        setPositionFilter('');
        setStatusFilter('');
        setPagination({ ...pagination, currentPage: 1 });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (isActive) => {
        return isActive ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
            </span>
        ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Inactive
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold leading-tight text-gray-900">
                                User Management
                            </h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Manage user accounts, roles, and permissions.
                            </p>
                        </div>
                        {currentUser?.role?.name === 'Admin' && (
                            <Link
                                to="/users/create"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create User
                            </Link>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="px-4 sm:px-0 mb-6">
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                <Filter className="h-5 w-5 mr-2" />
                                Filters
                            </h3>
                            <button
                                onClick={clearFilters}
                                className="text-sm text-blue-600 hover:text-blue-500"
                            >
                                Clear all
                            </button>
                        </div>

                        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {/* Search */}
                            <div className="lg:col-span-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, or phone..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            {/* Role Filter */}
                            <div>
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                >
                                    <option value="">All Roles</option>
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.id}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Position Filter */}
                            <div>
                                <select
                                    value={positionFilter}
                                    onChange={(e) => setPositionFilter(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                >
                                    <option value="">All Positions</option>
                                    {positions.map((position) => (
                                        <option key={position.id} value={position.id}>
                                            {position.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                >
                                    <option value="">All Status</option>
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Users Table */}
                <div className="px-4 sm:px-0">
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    <Users className="h-5 w-5 mr-2" />
                                    Users ({pagination.totalItems})
                                </h3>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <div className="spinner"></div>
                                </div>
                            ) : users.length === 0 ? (
                                <div className="text-center py-8">
                                    <User className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {search || roleFilter || positionFilter || statusFilter !== ''
                                            ? 'Try adjusting your search or filter criteria.'
                                            : 'Get started by creating a new user.'
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    User
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Role
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Position
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Created
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {users.map((user) => (
                                                <tr key={user.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 flex-shrink-0">
                                                                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                                                    <span className="text-white font-medium text-sm">
                                                                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {user.firstName} {user.lastName}
                                                                </div>
                                                                <div className="text-sm text-gray-500">{user.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {user.role ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                {user.role.name}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400">No role</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {user.position ? user.position.title : 'No position'}
                                                        </div>
                                                        {user.position?.department && (
                                                            <div className="text-sm text-gray-500">{user.position.department}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(user.isActive)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(user.createdAt)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex items-center space-x-2">
                                                            {currentUser?.role?.name === 'Admin' && (
                                                                <>
                                                                    <Link
                                                                        to={`/users/edit/${user.id}`}
                                                                        className="text-blue-600 hover:text-blue-900"
                                                                        title="Edit user"
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </Link>
                                                                    <button
                                                                        onClick={() => handleToggleStatus(user.id, user.isActive, `${user.firstName} ${user.lastName}`)}
                                                                        className={user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                                                                        title={user.isActive ? 'Deactivate user' : 'Activate user'}
                                                                    >
                                                                        {user.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)}
                                                                        className="text-red-600 hover:text-red-900"
                                                                        title="Delete user"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="mt-6 flex items-center justify-between">
                                    <div className="flex-1 flex justify-between sm:hidden">
                                        <button
                                            onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                                            disabled={pagination.currentPage <= 1}
                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                                            disabled={pagination.currentPage >= pagination.totalPages}
                                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700">
                                                Showing{' '}
                                                <span className="font-medium">{((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}</span>
                                                {' '}to{' '}
                                                <span className="font-medium">
                                                    {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                                                </span>
                                                {' '}of{' '}
                                                <span className="font-medium">{pagination.totalItems}</span>
                                                {' '}results
                                            </p>
                                        </div>
                                        <div>
                                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                                <button
                                                    onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                                                    disabled={pagination.currentPage <= 1}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Previous
                                                </button>
                                                {[...Array(pagination.totalPages)].map((_, index) => {
                                                    const page = index + 1;
                                                    return (
                                                        <button
                                                            key={page}
                                                            onClick={() => setPagination({ ...pagination, currentPage: page })}
                                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === pagination.currentPage
                                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            {page}
                                                        </button>
                                                    );
                                                })}
                                                <button
                                                    onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                                                    disabled={pagination.currentPage >= pagination.totalPages}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Next
                                                </button>
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserList;
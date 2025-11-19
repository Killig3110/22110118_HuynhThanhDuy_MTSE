import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const BuildingList = () => {
    const [buildings, setBuildings] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        search: '',
        sortBy: 'buildingCode',
        sortOrder: 'ASC'
    });

    // Fetch buildings with pagination
    const fetchBuildings = async (loadMore = false) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const queryParams = new URLSearchParams({
                page: loadMore ? filters.page + 1 : filters.page,
                limit: filters.limit,
                search: filters.search,
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder
            });

            const response = await fetch(`http://localhost:5001/api/buildings?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                if (loadMore) {
                    setBuildings(prev => [...prev, ...data.data.buildings]);
                    setFilters(prev => ({ ...prev, page: prev.page + 1 }));
                } else {
                    setBuildings(data.data.buildings);
                }
                setPagination(data.data.pagination);
            } else {
                toast.error(data.message || 'Failed to fetch buildings');
            }
        } catch (error) {
            console.error('Error fetching buildings:', error);
            toast.error('Network error while fetching buildings');
        } finally {
            setLoading(false);
        }
    };

    // Load more buildings (lazy loading)
    const loadMore = () => {
        if (pagination.hasNext && !loading) {
            fetchBuildings(true);
        }
    };

    // Handle search
    const handleSearch = (e) => {
        const value = e.target.value;
        setFilters(prev => ({ ...prev, search: value, page: 1 }));
    };

    // Handle search submit
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchBuildings();
    };

    // Handle sort change
    const handleSort = (field) => {
        const newOrder = filters.sortBy === field && filters.sortOrder === 'ASC' ? 'DESC' : 'ASC';
        setFilters(prev => ({ ...prev, sortBy: field, sortOrder: newOrder, page: 1 }));
    };

    useEffect(() => {
        fetchBuildings();
    }, [filters.sortBy, filters.sortOrder]);

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="bg-white rounded-lg shadow-md">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">Building Management</h1>

                        {/* Search Form */}
                        <form onSubmit={handleSearchSubmit} className="mt-4 sm:mt-0">
                            <div className="flex">
                                <input
                                    type="text"
                                    value={filters.search}
                                    onChange={handleSearch}
                                    placeholder="Search buildings..."
                                    className="px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Search
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Building List */}
                <div className="p-6">
                    {/* Sort Controls */}
                    <div className="mb-4 flex flex-wrap gap-2">
                        <button
                            onClick={() => handleSort('buildingCode')}
                            className={`px-3 py-1 rounded text-sm ${filters.sortBy === 'buildingCode'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Building Code
                            {filters.sortBy === 'buildingCode' && (
                                filters.sortOrder === 'ASC' ? ' ↑' : ' ↓'
                            )}
                        </button>
                        <button
                            onClick={() => handleSort('name')}
                            className={`px-3 py-1 rounded text-sm ${filters.sortBy === 'name'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Name
                            {filters.sortBy === 'name' && (
                                filters.sortOrder === 'ASC' ? ' ↑' : ' ↓'
                            )}
                        </button>
                    </div>

                    {/* Buildings Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {buildings.map(building => (
                            <BuildingCard key={building.id} building={building} />
                        ))}
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    )}

                    {/* Load More Button */}
                    {!loading && pagination.hasNext && (
                        <div className="text-center mt-8">
                            <button
                                onClick={loadMore}
                                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                Load More Buildings
                            </button>
                        </div>
                    )}

                    {/* Pagination Info */}
                    <div className="mt-6 text-sm text-gray-600 text-center">
                        Showing {buildings.length} of {pagination.totalItems} buildings
                        {pagination.totalPages > 1 && (
                            <span> • Page {pagination.currentPage} of {pagination.totalPages}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Building Card Component
const BuildingCard = ({ building }) => {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{building.name}</h3>
                <span className="text-sm font-medium text-blue-600">{building.buildingCode}</span>
            </div>

            <p className="text-gray-600 text-sm mb-2">{building.address}</p>

            <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                <span>Floors: {building.totalFloors}</span>
                <span className={`px-2 py-1 rounded text-xs ${building.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                    {building.status}
                </span>
            </div>

            {building.block && (
                <p className="text-xs text-gray-500 mb-3">
                    Block: {building.block.name} ({building.block.blockCode})
                </p>
            )}

            <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
            >
                {showDetails ? 'Hide Details' : 'View Details'}
            </button>

            {showDetails && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="space-y-1 text-xs text-gray-600">
                        {building.constructionYear && (
                            <p>Built: {building.constructionYear}</p>
                        )}
                        {building.manager && (
                            <p>Manager: {building.manager.firstName} {building.manager.lastName}</p>
                        )}
                        {building.description && (
                            <p>Description: {building.description}</p>
                        )}
                        {building.amenities && building.amenities.length > 0 && (
                            <p>Amenities: {building.amenities.join(', ')}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuildingList;
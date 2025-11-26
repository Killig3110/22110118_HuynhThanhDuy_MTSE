import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { searchAPI, buildingAPI, blockAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const BuildingList = () => {
    const { user } = useAuth();
    const isAdmin = ['admin', 'building_manager'].includes(user?.role?.name);
    const [buildings, setBuildings] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        search: '',
        sortBy: 'buildingCode',
        sortOrder: 'ASC'
    });
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        id: null,
        name: '',
        buildingCode: '',
        blockId: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        totalFloors: 1
    });

    // Fetch buildings
    const fetchBuildings = async (loadMore = false) => {
        try {
            setLoading(true);
            const trimmedSearch = filters.search.trim();

            if (trimmedSearch) {
                const { data } = await searchAPI.searchAll({
                    q: trimmedSearch,
                    types: 'buildings',
                    limit: filters.limit
                });

                const results = data.data?.buildings || [];

                setBuildings(results);
                setPagination({
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: results.length,
                    itemsPerPage: results.length,
                    hasNext: false,
                    hasPrev: false
                });
                return;
            }

            const params = {
                page: loadMore ? filters.page + 1 : filters.page,
                limit: filters.limit,
                search: filters.search,
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder
            };

            const { data } = await buildingAPI.list(params);

            if (data.success) {
                const list = data.data?.buildings || data.data || [];

                if (loadMore) {
                    setBuildings(prev => [...prev, ...list]);
                    setFilters(prev => ({ ...prev, page: prev.page + 1 }));
                } else {
                    setBuildings(list);
                }

                setPagination(data.data?.pagination || {});
            } else {
                toast.error(data.message || 'Failed to fetch buildings');
            }
        } catch (err) {
            console.error(err);
            toast.error('Network error while fetching buildings');
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        if (filters.search.trim()) return;
        if (pagination.hasNext && !loading) fetchBuildings(true);
    };

    const handleSearch = (e) => {
        setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchBuildings();
    };

    const handleSort = (field) => {
        const newOrder = filters.sortBy === field && filters.sortOrder === 'ASC' ? 'DESC' : 'ASC';
        setFilters(prev => ({ ...prev, sortBy: field, sortOrder: newOrder, page: 1 }));
    };

    const resetForm = () => {
        setForm({
            id: null,
            name: '',
            buildingCode: '',
            blockId: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            totalFloors: 1
        });
    };

    const submitForm = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: form.name,
                buildingCode: form.buildingCode,
                blockId: Number(form.blockId),
                address: form.address,
                city: form.city,
                state: form.state,
                zipCode: form.zipCode,
                totalFloors: Number(form.totalFloors)
            };

            if (form.id) {
                await buildingAPI.update(form.id, payload);
                toast.success('Building updated');
            } else {
                await buildingAPI.create(payload);
                toast.success('Building created');
            }

            resetForm();
            setShowForm(false);
            fetchBuildings();

        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Save failed');
        }
    };

    useEffect(() => {
        const load = async () => {
            fetchBuildings();
            if (isAdmin) {
                const { data } = await blockAPI.list({ limit: 100 });
                setBlocks(data.data || []);
            }
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.sortBy, filters.sortOrder]);

    return (
        <>
            {/* MAIN LAYOUT */}
            <div className="container mx-auto px-4 py-6">
                <div className="bg-white rounded-lg shadow-md">

                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <h1 className="text-2xl font-bold text-gray-900">Building Management</h1>

                            <form onSubmit={handleSearchSubmit} className="mt-4 sm:mt-0 flex gap-2">
                                <div className="flex">
                                    <input
                                        type="text"
                                        value={filters.search}
                                        onChange={handleSearch}
                                        placeholder="Search buildings..."
                                        className="px-4 py-2 border border-gray-300 rounded-l-md"
                                    />
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-r-md"
                                    >
                                        Search
                                    </button>
                                </div>

                                {isAdmin && (
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(true)}
                                        className="px-4 py-2 bg-emerald-600 text-white rounded"
                                    >
                                        Add Building
                                    </button>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6">

                        {/* Sort buttons */}
                        <div className="mb-4 flex flex-wrap gap-2">
                            <button
                                onClick={() => handleSort('buildingCode')}
                                className={`px-3 py-1 rounded text-sm ${filters.sortBy === 'buildingCode'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-600'
                                    }`}
                            >
                                Building Code {filters.sortBy === 'buildingCode' && (filters.sortOrder === 'ASC' ? '↑' : '↓')}
                            </button>

                            <button
                                onClick={() => handleSort('name')}
                                className={`px-3 py-1 rounded text-sm ${filters.sortBy === 'name'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-600'
                                    }`}
                            >
                                Name {filters.sortBy === 'name' && (filters.sortOrder === 'ASC' ? '↑' : '↓')}
                            </button>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {buildings.map(b => (
                                <BuildingCard
                                    key={b.id}
                                    building={b}
                                    canEdit={isAdmin}
                                    onEdit={() => {
                                        setForm({
                                            id: b.id,
                                            name: b.name,
                                            buildingCode: b.buildingCode,
                                            blockId: b.blockId,
                                            address: b.address,
                                            city: b.city,
                                            state: b.state,
                                            zipCode: b.zipCode,
                                            totalFloors: b.totalFloors
                                        });
                                        setShowForm(true);
                                    }}
                                    onDelete={async () => {
                                        if (!window.confirm('Delete this building?')) return;
                                        try {
                                            await buildingAPI.remove(b.id);
                                            toast.success('Deleted');
                                            fetchBuildings();
                                        } catch (err) {
                                            toast.error('Delete failed');
                                        }
                                    }}
                                />
                            ))}
                        </div>

                        {loading && (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        )}

                        {!loading && pagination.hasNext && (
                            <div className="text-center mt-8">
                                <button
                                    onClick={loadMore}
                                    className="px-6 py-2 bg-gray-600 text-white rounded-md"
                                >
                                    Load More
                                </button>
                            </div>
                        )}

                        <div className="mt-6 text-sm text-gray-600 text-center">
                            Showing {buildings.length} of {pagination.totalItems}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL FORM */}
            {showForm && isAdmin && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">

                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {form.id ? 'Edit Building' : 'Add Building'}
                            </h3>
                            <button
                                onClick={() => { setShowForm(false); resetForm(); }}
                                className="text-gray-500"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={submitForm} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input className="border rounded px-3 py-2 text-sm" value={form.name} placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                            <input className="border rounded px-3 py-2 text-sm" value={form.buildingCode} placeholder="Building Code" onChange={(e) => setForm({ ...form, buildingCode: e.target.value })} required />

                            <select className="border rounded px-3 py-2 text-sm" value={form.blockId} onChange={(e) => setForm({ ...form, blockId: e.target.value })} required>
                                <option value="">Select Block</option>
                                {blocks.map(b => <option key={b.id} value={b.id}>{b.name} ({b.blockCode})</option>)}
                            </select>

                            <input type="number" className="border rounded px-3 py-2 text-sm" value={form.totalFloors} placeholder="Floors" min="1" onChange={(e) => setForm({ ...form, totalFloors: e.target.value })} required />

                            <input className="border rounded px-3 py-2 text-sm md:col-span-2" value={form.address} placeholder="Address" onChange={(e) => setForm({ ...form, address: e.target.value })} required />

                            <input className="border rounded px-3 py-2 text-sm" value={form.city} placeholder="City" onChange={(e) => setForm({ ...form, city: e.target.value })} required />
                            <input className="border rounded px-3 py-2 text-sm" value={form.state} placeholder="State" onChange={(e) => setForm({ ...form, state: e.target.value })} required />
                            <input className="border rounded px-3 py-2 text-sm" value={form.zipCode} placeholder="Zipcode" onChange={(e) => setForm({ ...form, zipCode: e.target.value })} required />

                            <div className="md:col-span-2 flex gap-2 mt-2">
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded">
                                    {form.id ? 'Update' : 'Create'}
                                </button>
                                <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="px-3 py-2 text-sm text-gray-600">
                                    Cancel
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            )}
        </>
    );
};



// CARD COMPONENT
const BuildingCard = ({ building, canEdit, onEdit, onDelete }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [openAction, setOpenAction] = useState(false);

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative">

            {/* Header */}
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{building.name}</h3>
                <span className="text-sm font-medium text-blue-600">{building.buildingCode}</span>
            </div>

            {/* Address */}
            <p className="text-gray-600 text-sm mb-2">{building.address}</p>

            {/* Floors + Status */}
            <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                <span>Floors: {building.totalFloors}</span>
                <span className={`px-2 py-1 text-xs rounded ${building.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-200 text-gray-600'
                    }`}>
                    {building.status}
                </span>
            </div>

            {/* Block */}
            {building.block && (
                <p className="text-xs text-gray-500 mb-3">
                    Block: {building.block.name} ({building.block.blockCode})
                </p>
            )}

            {/* Buttons Row */}
            <div className="flex gap-2 mt-3">

                {/* View Details */}
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex-1 py-2 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                >
                    {showDetails ? 'Hide Details' : 'View Details'}
                </button>

                {/* ACTION BUTTON */}
                {canEdit && (
                    <div className="relative">
                        <button
                            onClick={() => setOpenAction(prev => !prev)}
                            className="w-10 h-10 flex items-center justify-center border rounded bg-gray-100 hover:bg-gray-200"
                        >
                            ⋮
                        </button>

                        {/* Dropdown menu */}
                        {openAction && (
                            <div className="absolute right-0 mt-2 w-32 bg-white shadow-lg border rounded z-30">
                                <button
                                    onClick={() => {
                                        setOpenAction(false);
                                        onEdit();
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() => {
                                        setOpenAction(false);
                                        onDelete();
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}

            </div>

            {/* DETAILS SECTION */}
            {showDetails && (
                <div className="mt-3 pt-3 border-t text-xs text-gray-600 space-y-1">
                    {building.constructionYear && <p>Built: {building.constructionYear}</p>}
                    {building.manager && <p>Manager: {building.manager.firstName} {building.manager.lastName}</p>}
                    {building.description && <p>Description: {building.description}</p>}
                    {building.amenities?.length > 0 && <p>Amenities: {building.amenities.join(', ')}</p>}
                </div>
            )}
        </div>
    );
};

export default BuildingList;

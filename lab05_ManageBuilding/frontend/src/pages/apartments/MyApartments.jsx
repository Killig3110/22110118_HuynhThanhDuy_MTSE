import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { searchAPI, leaseAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Home, MapPin, DollarSign, Users, Eye, Calendar } from 'lucide-react';

const MyApartments = () => {
    const { user } = useAuth();
    const [apartments, setApartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all'); // all, owned, rented

    const load = async () => {
        try {
            setLoading(true);
            const response = await api.get('/apartments/my-apartments');
            setApartments(response.data.data || []);
        } catch (error) {
            console.error('Load my apartments failed', error);
            toast.error('Failed to load your apartments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const toggleListing = async (apartmentId, listingType) => {
        try {
            const apartment = apartments.find(a => a.id === apartmentId);
            const newValue = listingType === 'rent' ? !apartment.isListedForRent : !apartment.isListedForSale;

            await api.patch(`/api/apartments/${apartmentId}/listing`, {
                [listingType === 'rent' ? 'isListedForRent' : 'isListedForSale']: newValue
            });

            setApartments(apartments.map(apt =>
                apt.id === apartmentId
                    ? { ...apt, [listingType === 'rent' ? 'isListedForRent' : 'isListedForSale']: newValue }
                    : apt
            ));

            toast.success(`${listingType === 'rent' ? 'Rental' : 'Sale'} listing ${newValue ? 'enabled' : 'disabled'}`);
        } catch (error) {
            console.error('Error toggling listing:', error);
            toast.error(error.response?.data?.message || 'Failed to update listing');
        }
    };

    const updateStatus = async (apartmentId, newStatus) => {
        try {
            await api.patch(`/api/apartments/${apartmentId}/status`, { status: newStatus });

            setApartments(apartments.map(apt =>
                apt.id === apartmentId ? { ...apt, status: newStatus } : apt
            ));

            toast.success(`Apartment status updated to ${newStatus}`);
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const ownerDecision = async (leaseId, decision) => {
        try {
            await leaseAPI.ownerDecision(leaseId, decision);
            toast.success(decision === 'approve' ? 'Approved' : 'Rejected');
            load();
        } catch (error) {
            console.error('Owner decision failed', error);
            toast.error(error.response?.data?.message || 'Decision failed');
        }
    };

    const filteredApartments = apartments.filter(apt => {
        if (activeTab === 'all') return true;
        if (activeTab === 'owned') return apt.ownerId === user?.id;
        if (activeTab === 'rented') return apt.householdMembers?.some(m => m.email === user?.email) && apt.ownerId !== user?.id;
        return true;
    });

    const statusColors = {
        vacant: 'bg-green-100 text-green-800',
        occupied: 'bg-blue-100 text-blue-800',
        under_renovation: 'bg-yellow-100 text-yellow-800'
    };

    const statusLabels = {
        vacant: 'Vacant',
        occupied: 'Occupied',
        under_renovation: 'Under Renovation'
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Apartments</h1>
                <p className="text-gray-600">Manage your owned and rented apartments</p>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'all'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        All Apartments ({apartments.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('owned')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'owned'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Owned ({apartments.filter(a => a.ownerId === user?.id).length})
                    </button>
                    <button
                        onClick={() => setActiveTab('rented')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'rented'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Rented ({apartments.filter(a => a.householdMembers?.some(m => m.email === user?.email) && a.ownerId !== user?.id).length})
                    </button>
                </nav>
            </div>

            {/* Apartments Grid */}
            {filteredApartments.length === 0 ? (
                <div className="text-center py-12">
                    <Home className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No apartments</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {activeTab === 'all' && "You don't have any apartments yet."}
                        {activeTab === 'owned' && "You don't own any apartments."}
                        {activeTab === 'rented' && "You don't have any rented apartments."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredApartments.map((apartment) => {
                        const isOwner = apartment.ownerId === user?.id;
                        // Parse images JSON field
                        let images = [];
                        try {
                            images = typeof apartment.images === 'string'
                                ? JSON.parse(apartment.images)
                                : (apartment.images || []);
                        } catch (e) {
                            images = [];
                        }
                        const primaryImage = images[0] || `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop`;

                        return (
                            <div key={apartment.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                {/* Image */}
                                <div className="relative h-48 bg-gray-200">
                                    <img
                                        src={primaryImage}
                                        alt={apartment.apartmentNumber}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop`;
                                        }}
                                    />
                                    <div className="absolute top-3 right-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[apartment.status]}`}>
                                            {statusLabels[apartment.status]}
                                        </span>
                                    </div>
                                    {isOwner && (
                                        <div className="absolute top-3 left-3">
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                                                Owner
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    {/* Title & Location */}
                                    <div className="mb-3">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                            Apartment {apartment.apartmentNumber}
                                        </h3>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <MapPin className="h-4 w-4 mr-1" />
                                            <span>Floor {apartment.floor?.floorNumber}, {apartment.floor?.building?.name}</span>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Home className="h-4 w-4 mr-2 text-gray-400" />
                                            <span>{apartment.bedrooms} beds · {apartment.bathrooms} baths · {apartment.area}m²</span>
                                        </div>
                                        {apartment.rentPrice && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                                                <span>Rent: ${apartment.rentPrice.toLocaleString()}/month</span>
                                            </div>
                                        )}
                                        {apartment.salePrice && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                                                <span>Sale: ${apartment.salePrice.toLocaleString()}</span>
                                            </div>
                                        )}
                                        {apartment.householdMembers?.length > 0 && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Users className="h-4 w-4 mr-2 text-gray-400" />
                                                <span>{apartment.householdMembers.length} resident(s)</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Listing Status (Only for owners of vacant apartments) */}
                                    {isOwner && apartment.status === 'vacant' && (
                                        <div className="mb-4 p-3 bg-gray-50 rounded-lg space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700">Listed for Rent</span>
                                                <button
                                                    onClick={() => toggleListing(apartment.id, 'rent')}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${apartment.isListedForRent ? 'bg-blue-600' : 'bg-gray-300'
                                                        }`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${apartment.isListedForRent ? 'translate-x-6' : 'translate-x-1'
                                                            }`}
                                                    />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700">Listed for Sale</span>
                                                <button
                                                    onClick={() => toggleListing(apartment.id, 'sale')}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${apartment.isListedForSale ? 'bg-blue-600' : 'bg-gray-300'
                                                        }`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${apartment.isListedForSale ? 'translate-x-6' : 'translate-x-1'
                                                            }`}
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Status Update (Only for owners) */}
                                    {isOwner && (
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Update Status
                                            </label>
                                            <select
                                                value={apartment.status}
                                                onChange={(e) => updateStatus(apartment.id, e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="vacant">Vacant</option>
                                                <option value="occupied">Occupied</option>
                                                <option value="under_renovation">Under Renovation</option>
                                            </select>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <a
                                            href={`/apartments/${apartment.id}`}
                                            className="flex-1 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors text-center"
                                        >
                                            <Eye className="h-4 w-4 inline mr-1" />
                                            View Details
                                        </a>
                                    </div>

                                    {/* Pending Requests */}
                                    <PendingRequests apartmentId={apartment.id} isOwner={isOwner} onDecision={ownerDecision} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const PendingRequests = ({ apartmentId, isOwner, onDecision }) => {
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (!isOwner) return;

        const loadPending = async () => {
            try {
                const { data } = await leaseAPI.list({ apartmentId, status: 'pending_owner', limit: 50 });
                setItems(data.data || []);
            } catch (error) {
                console.error('Load pending owner failed', error);
            }
        };
        loadPending();
    }, [apartmentId, isOwner]);

    if (!isOwner || !items.length) return null;

    return (
        <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                Pending Owner Approval ({items.length})
            </h4>
            <div className="space-y-2">
                {items.map((req) => (
                    <div key={req.id} className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-semibold text-gray-900 capitalize">{req.type}</span>
                                    <span className="px-2 py-0.5 bg-blue-200 text-blue-800 text-xs rounded-full">
                                        Pending
                                    </span>
                                </div>
                                <div className="text-xs text-gray-600 flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {req.requester?.firstName} {req.requester?.lastName} ({req.requester?.email})
                                </div>
                                {req.note && (
                                    <div className="text-xs text-gray-500 mt-1 italic">"{req.note}"</div>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onDecision(req.id, 'approve')}
                                className="flex-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-medium transition-colors"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => onDecision(req.id, 'reject')}
                                className="flex-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium transition-colors"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyApartments;

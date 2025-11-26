import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { leaseAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const LeaseRequests = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        status: '',
        type: '',
        q: ''
    });

    const canApprove = ['admin', 'building_manager'].includes(user?.role?.name);
    const isOwner = (req) => req?.apartment?.ownerId === user?.id;

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data } = await leaseAPI.list({
                status: filters.status || undefined,
                type: filters.type || undefined,
                q: filters.q || undefined,
                limit: 50
            });
            setRequests(data.data || []);
        } catch (error) {
            console.error('Failed to load lease requests', error);
            toast.error('Failed to load lease requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.status, filters.type]);

    const handleDecision = async (id, decision) => {
        try {
            await leaseAPI.decide(id, decision);
            toast.success(decision === 'approve' ? 'Approved' : 'Rejected');
            fetchData();
        } catch (error) {
            console.error('Decision failed', error);
            toast.error(error.response?.data?.message || 'Decision failed');
        }
    };

    const handleOwnerDecision = async (id, decision) => {
        try {
            await leaseAPI.ownerDecision(id, decision);
            toast.success(decision === 'approve' ? 'Owner approved' : 'Owner rejected');
            fetchData();
        } catch (error) {
            console.error('Owner decision failed', error);
            toast.error(error.response?.data?.message || 'Owner decision failed');
        }
    };

    const handleCancel = async (id) => {
        try {
            await leaseAPI.cancel(id);
            toast.success('Cancelled');
            fetchData();
        } catch (error) {
            console.error('Cancel failed', error);
            toast.error(error.response?.data?.message || 'Cancel failed');
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Lease / Purchase Requests</h1>
                    <p className="text-sm text-gray-500">Theo dõi và phê duyệt yêu cầu thuê/mua căn hộ.</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                        className="border rounded-lg px-3 py-2 text-sm"
                        placeholder="Search note..."
                        value={filters.q}
                        onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                        onKeyDown={(e) => { if (e.key === 'Enter') fetchData(); }}
                    />
                    <select
                        className="border rounded-lg px-3 py-2 text-sm"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                        <option value="">All status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <select
                        className="border rounded-lg px-3 py-2 text-sm"
                        value={filters.type}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    >
                        <option value="">All types</option>
                        <option value="rent">Rent</option>
                        <option value="buy">Buy</option>
                    </select>
                    <button
                        onClick={fetchData}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Apartment</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Requester</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Note</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {requests.map((req) => (
                                <tr key={req.id}>
                                    <td className="px-4 py-2 text-sm text-gray-900">
                                        {req.apartment?.apartmentNumber} • {req.apartment?.floor?.building?.buildingCode}
                                    </td>
                                    <td className="px-4 py-2 text-sm capitalize">{req.type}</td>
                                    <td className="px-4 py-2 text-sm text-gray-700">
                                        {req.requester?.firstName} {req.requester?.lastName}
                                        <div className="text-xs text-gray-500">{req.requester?.email}</div>
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-700">
                                        {req.type === 'rent'
                                            ? (req.monthlyRent || req.apartment?.monthlyRent ? `${req.monthlyRent || req.apartment?.monthlyRent}₫/th` : '-')
                                            : (req.totalPrice || req.apartment?.salePrice ? `${req.totalPrice || req.apartment?.salePrice}₫` : '-')
                                        }
                                    </td>
                                    <td className="px-4 py-2 text-sm">
                                        <span className={`px-2 py-1 rounded text-xs ${
                                            req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                req.status?.startsWith('pending') ? 'bg-yellow-100 text-yellow-700' :
                                                    req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-600'
                                        }`}>{req.status}</span>
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-600">{req.note || '-'}</td>
                                    <td className="px-4 py-2 text-sm space-x-2">
                                        {req.status === 'pending_manager' && (
                                            <>
                                                {canApprove && (
                                                    <>
                                                        <button
                                                            onClick={() => handleDecision(req.id, 'approve')}
                                                            className="px-3 py-1 bg-green-600 text-white rounded text-xs"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleDecision(req.id, 'reject')}
                                                            className="px-3 py-1 bg-red-600 text-white rounded text-xs"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {!canApprove && req.userId === user?.id && (
                                                    <button
                                                        onClick={() => handleCancel(req.id)}
                                                        className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-xs"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </>
                                        )}
                                        {req.status === 'pending_owner' && isOwner(req) && (
                                            <>
                                                <button
                                                    onClick={() => handleOwnerDecision(req.id, 'approve')}
                                                    className="px-3 py-1 bg-green-600 text-white rounded text-xs"
                                                >
                                                    Owner approve
                                                </button>
                                                <button
                                                    onClick={() => handleOwnerDecision(req.id, 'reject')}
                                                    className="px-3 py-1 bg-red-600 text-white rounded text-xs"
                                                >
                                                    Owner reject
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {!loading && requests.length === 0 && (
                                <tr>
                                    <td className="px-4 py-3 text-sm text-gray-500" colSpan={6}>No requests found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {loading && (
                    <div className="py-3 text-center text-sm text-gray-500">Loading...</div>
                )}
            </div>
        </div>
    );
};

export default LeaseRequests;

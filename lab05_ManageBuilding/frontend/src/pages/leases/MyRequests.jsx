import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { leaseAPI } from '../../services/api';

const MyRequests = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const load = async () => {
        try {
            setLoading(true);
            const { data } = await leaseAPI.list({ limit: 100 });
            setItems(data.data || []);
        } catch (error) {
            console.error('Load my requests failed', error);
            toast.error('Load failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const cancel = async (id) => {
        try {
            await leaseAPI.cancel(id);
            toast.success('Cancelled');
            load();
        } catch (error) {
            console.error('Cancel failed', error);
            toast.error(error.response?.data?.message || 'Cancel failed');
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">My Requests</h1>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Apartment</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Note</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {items.map((req) => (
                                <tr key={req.id}>
                                    <td className="px-4 py-2 text-sm text-gray-800">
                                        #{req.apartment?.apartmentNumber} • {req.apartment?.floor?.building?.buildingCode}
                                    </td>
                                    <td className="px-4 py-2 text-sm capitalize">{req.type}</td>
                                    <td className="px-4 py-2 text-sm">
                                        <span className={`px-2 py-1 rounded text-xs ${
                                            req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                req.status?.startsWith('pending') ? 'bg-yellow-100 text-yellow-700' :
                                                    req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-600'
                                        }`}>{req.status}</span>
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-600">{req.note || '-'}</td>
                                    <td className="px-4 py-2 text-sm">
                                        {req.status?.startsWith('pending') && (
                                            <button
                                                onClick={() => cancel(req.id)}
                                                className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-xs"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {!loading && items.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-3 text-sm text-gray-500">No requests.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {loading && <div className="py-3 text-center text-sm text-gray-500">Loading...</div>}
            </div>
        </div>
    );
};

export default MyRequests;

import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { searchAPI, leaseAPI } from '../../services/api';
import api from '../../services/api';

const MyApartments = () => {
    const [apartments, setApartments] = useState([]);
    const [loading, setLoading] = useState(false);

    const load = async () => {
        try {
            setLoading(true);
            const { data } = await searchAPI.searchApartments({ limit: 100 }); // fetch all; filter owner client side
            const myApts = (data.data || []).filter((a) => a.ownerId);
            setApartments(myApts);
        } catch (error) {
            console.error('Load my apartments failed', error);
            toast.error('Load failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const updateListing = async (aptId, type, enable) => {
        try {
            const payload = {};
            if (type === 'rent') {
                payload.isListedForRent = enable;
                if (enable) {
                    const price = window.prompt('Nhập giá thuê / tháng', '');
                    if (!price) return;
                    payload.monthlyRent = Number(price);
                }
            } else {
                payload.isListedForSale = enable;
                if (enable) {
                    const price = window.prompt('Nhập giá bán', '');
                    if (!price) return;
                    payload.salePrice = Number(price);
                }
            }
            await api.put(`/apartments/${aptId}`, payload);
            toast.success('Cập nhật listing thành công');
            load();
        } catch (error) {
            console.error('Update listing failed', error);
            toast.error(error.response?.data?.message || 'Update failed');
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

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">Căn hộ của tôi</h1>
            {loading && <div className="text-sm text-gray-500">Loading...</div>}
            <div className="space-y-4">
                {apartments.map((apt) => (
                    <div key={apt.id} className="border border-gray-200 rounded-lg bg-white shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">#{apt.apartmentNumber}</h3>
                                <p className="text-xs text-gray-500">Tầng {apt.floor?.floorNumber} • {apt.floor?.building?.buildingCode}</p>
                            </div>
                            <div className="flex gap-2 text-xs">
                                {apt.isListedForRent && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">Rent</span>}
                                {apt.isListedForSale && <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded">Sale</span>}
                            </div>
                        </div>
                        <div className="text-sm text-gray-700 mt-2">
                            Giá thuê: {apt.monthlyRent || '-'} • Giá bán: {apt.salePrice || '-'}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <button
                                onClick={() => updateListing(apt.id, 'rent', !apt.isListedForRent)}
                                className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                            >
                                {apt.isListedForRent ? 'Ẩn cho thuê' : 'Rao cho thuê'}
                            </button>
                            <button
                                onClick={() => updateListing(apt.id, 'sale', !apt.isListedForSale)}
                                className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                            >
                                {apt.isListedForSale ? 'Ẩn bán' : 'Rao bán'}
                            </button>
                        </div>

                        {/* Pending owner requests */}
                        <PendingRequests apartmentId={apt.id} onDecision={ownerDecision} />
                    </div>
                ))}
            </div>
            {!loading && apartments.length === 0 && (
                <div className="text-sm text-gray-500 mt-3">Không có căn hộ.</div>
            )}
        </div>
    );
};

const PendingRequests = ({ apartmentId, onDecision }) => {
    const [items, setItems] = useState([]);

    useEffect(() => {
        const loadPending = async () => {
            try {
                const { data } = await leaseAPI.list({ apartmentId, status: 'pending_owner', limit: 50 });
                setItems(data.data || []);
            } catch (error) {
                console.error('Load pending owner failed', error);
            }
        };
        loadPending();
    }, [apartmentId]);

    if (!items.length) return null;

    return (
        <div className="mt-4 border-t border-gray-100 pt-3">
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Yêu cầu chờ chủ nhà duyệt</h4>
            <div className="space-y-2">
                {items.map((req) => (
                    <div key={req.id} className="flex items-center justify-between text-sm bg-gray-50 rounded p-2">
                        <div>
                            <div className="font-semibold capitalize">{req.type} • {req.requester?.email}</div>
                            <div className="text-xs text-gray-500">{req.note || '-'}</div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onDecision(req.id, 'approve')}
                                className="px-3 py-1 bg-green-600 text-white rounded text-xs"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => onDecision(req.id, 'reject')}
                                className="px-3 py-1 bg-red-600 text-white rounded text-xs"
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

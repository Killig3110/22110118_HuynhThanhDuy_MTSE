import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { searchAPI, leaseAPI, apartmentAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Marketplace = () => {
    const { user } = useAuth();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        q: '',
        type: 'all',
        listing: 'rent' // rent | sale | all
    });

    const load = async () => {
        try {
            setLoading(true);
            const params = {
                q: filters.q || undefined,
                limit: 50,
                isListedForRent: filters.listing === 'rent' ? 'true' : undefined,
                isListedForSale: filters.listing === 'sale' ? 'true' : undefined
            };
            if (filters.listing === 'all') {
                delete params.isListedForRent;
                delete params.isListedForSale;
            }
            const { data } = await searchAPI.searchApartments(params);
            setListings(data.data || []);
        } catch (error) {
            console.error('Load listings failed', error);
            toast.error('Load listings failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.listing]);

    const request = async (apt, mode) => {
        let payload = {
            apartmentId: apt.id,
            type: mode,
            note: ''
        };

        // guest flow: collect contact info
        if (!user) {
            const contactName = window.prompt('Nhập họ tên liên hệ');
            const contactEmail = window.prompt('Nhập email liên hệ');
            const contactPhone = window.prompt('Nhập số điện thoại liên hệ');
            if (!contactName || !contactEmail || !contactPhone) {
                toast.error('Vui lòng nhập đầy đủ thông tin liên hệ');
                return;
            }
            payload = { ...payload, contactName, contactEmail, contactPhone };
        } else if (user?.role?.name !== 'resident') {
            toast.error('Only residents can submit rent/buy requests');
            return;
        }

        try {
            if (mode === 'rent') payload.monthlyRent = apt.monthlyRent;
            if (mode === 'buy') payload.totalPrice = apt.salePrice;
            await leaseAPI.create(payload);
            toast.success('Request sent');
        } catch (error) {
            console.error('Request failed', error);
            toast.error(error.response?.data?.message || 'Request failed');
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Marketplace</h1>
                    <p className="text-sm text-gray-500">Danh sách căn đang rao thuê/bán.</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 flex flex-wrap gap-3">
                <input
                    className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]"
                    placeholder="Search..."
                    value={filters.q}
                    onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') load(); }}
                />
                <select
                    className="border rounded-lg px-3 py-2 text-sm"
                    value={filters.listing}
                    onChange={(e) => setFilters({ ...filters, listing: e.target.value })}
                >
                    <option value="rent">For rent</option>
                    <option value="sale">For sale</option>
                    <option value="all">All</option>
                </select>
                <button
                    onClick={load}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg"
                >
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {listings.map((apt) => (
                    <div key={apt.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">#{apt.apartmentNumber}</h3>
                                <p className="text-xs text-gray-500">
                                    {apt.floor?.building?.buildingCode} • Tầng {apt.floor?.floorNumber}
                                </p>
                            </div>
                            <div className="flex gap-2 text-xs">
                                {apt.isListedForRent && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">Rent</span>}
                                {apt.isListedForSale && <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded">Sale</span>}
                            </div>
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                            {apt.type} • {apt.area} m² • {apt.bedrooms} BR / {apt.bathrooms} BA
                        </div>
                        <div className="mt-2 text-sm font-semibold text-gray-800">
                            {apt.isListedForRent && `Thuê: ${apt.monthlyRent || '-'}₫/tháng`}
                            {apt.isListedForRent && apt.isListedForSale && ' • '}
                            {apt.isListedForSale && `Bán: ${apt.salePrice || '-'}₫`}
                        </div>
                        <div className="mt-3 flex gap-2">
                            {apt.isListedForRent && (
                                <button
                                    onClick={() => request(apt, 'rent')}
                                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                                    disabled={user?.role?.name !== 'resident'}
                                >
                                    Request Rent
                                </button>
                            )}
                            {apt.isListedForSale && (
                                <button
                                    onClick={() => request(apt, 'buy')}
                                    className="flex-1 px-3 py-2 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 disabled:opacity-50"
                                    disabled={user?.role?.name !== 'resident'}
                                >
                                    Request Buy
                                </button>
                            )}
                        </div>
                        {user?.role?.name !== 'resident' && (
                            <p className="mt-2 text-xs text-amber-600">Chỉ cư dân mới có thể gửi yêu cầu.</p>
                        )}
                    </div>
                ))}
            </div>

            {loading && (
                <div className="text-center text-sm text-gray-500 mt-4">Loading...</div>
            )}
            {!loading && listings.length === 0 && (
                <div className="text-center text-sm text-gray-500 mt-4">No listings.</div>
            )}
        </div>
    );
};

export default Marketplace;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { searchAPI, leaseAPI, apartmentAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { ShoppingCart, Eye, Heart } from 'lucide-react';

const Marketplace = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sortBy, setSortBy] = useState('newest'); // newest | price-low | price-high
    const [filters, setFilters] = useState({
        q: '',
        type: 'all',
        listing: 'rent' // rent | sale | all
    });
    const [contactModal, setContactModal] = useState({
        open: false,
        mode: 'rent',
        apartment: null,
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        note: ''
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

    const handleAddToCart = async (apt, mode) => {
        if (!user) {
            toast.error('Please login to add to cart');
            navigate('/login');
            return;
        }

        const result = await addToCart(apt.id, mode, mode === 'rent' ? 12 : null);
        if (result.success) {
            toast.success('Added to cart!');
        }
    };

    const openContactModal = (apt, mode) => {
        // For guests and users without contact info filled, show modal
        setContactModal({
            open: true,
            mode,
            apartment: apt,
            contactName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
            contactEmail: user?.email || '',
            contactPhone: user?.phone || '',
            note: ''
        });
    };

    const submitRequest = async (apt, mode, contact) => {
        try {
            let payload = {
                apartmentId: apt.id,
                type: mode,
                note: contact.note || '',
                ...contact
            };

            if (mode === 'rent') payload.monthlyRent = apt.monthlyRent;
            if (mode === 'buy') payload.totalPrice = apt.salePrice;

            await leaseAPI.create(payload);
            toast.success('Request sent');
            setContactModal({
                open: false,
                mode: 'rent',
                apartment: null,
                contactName: '',
                contactEmail: '',
                contactPhone: '',
                note: ''
            });
        } catch (error) {
            console.error('Request failed', error);
            toast.error(error.response?.data?.message || 'Request failed');
        }
    };

    const handleModalSubmit = () => {
        const { apartment, mode, contactName, contactEmail, contactPhone, note } = contactModal;
        if (!contactName || !contactEmail || !contactPhone) {
            toast.error('Vui lòng nhập đầy đủ thông tin liên hệ');
            return;
        }
        submitRequest(apartment, mode, { contactName, contactEmail, contactPhone, note });
    };

    // Sort listings
    const sortedListings = [...listings].sort((a, b) => {
        if (sortBy === 'price-low') {
            const priceA = a.monthlyRent || a.salePrice || 0;
            const priceB = b.monthlyRent || b.salePrice || 0;
            return priceA - priceB;
        } else if (sortBy === 'price-high') {
            const priceA = a.monthlyRent || a.salePrice || 0;
            const priceB = b.monthlyRent || b.salePrice || 0;
            return priceB - priceA;
        } else {
            // newest
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
    });

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
                    <option value="rent">For Rent</option>
                    <option value="sale">For Sale</option>
                    <option value="all">All</option>
                </select>
                <select
                    className="border rounded-lg px-3 py-2 text-sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                </select>
                <button
                    onClick={load}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedListings.map((apt) => {
                    // Check if apartment is actually available for rent/buy
                    const isAvailable = ['for_rent', 'for_sale'].includes(apt.status) && apt.isActive;
                    const canRent = apt.status === 'for_rent' && apt.isListedForRent;
                    const canBuy = apt.status === 'for_sale' && apt.isListedForSale;

                    return (
                        <div key={apt.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">#{apt.apartmentNumber}</h3>
                                    <p className="text-xs text-gray-500">
                                        {apt.floor?.building?.buildingCode} • Floor {apt.floor?.floorNumber}
                                    </p>
                                </div>
                                <div className="flex gap-2 text-xs">
                                    {apt.isListedForRent && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">Rent</span>}
                                    {apt.isListedForSale && <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded">Sale</span>}
                                    {!isAvailable && <span className="px-2 py-1 bg-red-100 text-red-700 rounded">Not Available</span>}
                                </div>
                            </div>

                            <div className="text-sm text-gray-600 mt-2">
                                {apt.type} • {apt.area} m² • {apt.bedrooms} BR / {apt.bathrooms} BA
                            </div>

                            <div className="mt-2 text-sm font-semibold text-gray-800">
                                {apt.isListedForRent && (
                                    <div>Rent: {Number(apt.monthlyRent).toLocaleString()}₫/month</div>
                                )}
                                {apt.isListedForSale && (
                                    <div>Sale: {Number(apt.salePrice).toLocaleString()}₫</div>
                                )}
                            </div>

                            <div className="mt-4 flex flex-col gap-2">
                                <button
                                    onClick={() => navigate(`/apartments/${apt.id}`)}
                                    className="w-full px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 flex items-center justify-center gap-1"
                                >
                                    <Eye className="h-4 w-4" />
                                    View Details
                                </button>

                                {/* Show availability message if not available */}
                                {!isAvailable && (
                                    <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700">
                                        This apartment is currently not available
                                    </div>
                                )}

                                {/* Guest/User: Show request buttons ONLY if available */}
                                {isAvailable && (!user || user.role?.name === 'user') && (
                                    <div className="flex gap-2">
                                        {canRent && (
                                            <button
                                                onClick={() => openContactModal(apt, 'rent')}
                                                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center justify-center gap-1"
                                                title="Request to Rent"
                                            >
                                                Request Rent
                                            </button>
                                        )}
                                        {canBuy && (
                                            <button
                                                onClick={() => openContactModal(apt, 'buy')}
                                                className="flex-1 px-3 py-2 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 flex items-center justify-center gap-1"
                                                title="Request to Buy"
                                            >
                                                Request Buy
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Logged-in User: Show add to cart buttons ONLY if available */}
                                {isAvailable && user && user.role?.name === 'user' && (
                                    <div className="flex gap-2">
                                        {canRent && (
                                            <button
                                                onClick={() => handleAddToCart(apt, 'rent')}
                                                className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 flex items-center justify-center gap-1"
                                                title="Add to Cart (Rent)"
                                            >
                                                <ShoppingCart className="h-4 w-4" />
                                                Cart (Rent)
                                            </button>
                                        )}
                                        {canBuy && (
                                            <button
                                                onClick={() => handleAddToCart(apt, 'buy')}
                                                className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 flex items-center justify-center gap-1"
                                                title="Add to Cart (Buy)"
                                            >
                                                <ShoppingCart className="h-4 w-4" />
                                                Cart (Buy)
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {loading && (
                <div className="text-center text-sm text-gray-500 mt-4">Loading...</div>
            )}
            {!loading && listings.length === 0 && (
                <div className="text-center text-sm text-gray-500 mt-4">No listings.</div>
            )}

            {/* Contact Modal */}
            {contactModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="text-sm text-gray-500">Gửi yêu cầu</div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    #{contactModal.apartment?.apartmentNumber} • {contactModal.apartment?.floor?.building?.buildingCode}
                                </h3>
                                <div className="text-xs text-gray-500">
                                    {contactModal.mode === 'rent' ? 'Thuê căn hộ' : 'Mua căn hộ'}
                                </div>
                            </div>
                            <button
                                className="text-gray-400 hover:text-gray-600"
                                onClick={() => setContactModal({ open: false, mode: 'rent', apartment: null, contactName: '', contactEmail: '', contactPhone: '', note: '' })}
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-3">
                            <input
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                placeholder="Họ và tên"
                                value={contactModal.contactName}
                                onChange={(e) => setContactModal((prev) => ({ ...prev, contactName: e.target.value }))}
                            />
                            <input
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                placeholder="Email"
                                value={contactModal.contactEmail}
                                onChange={(e) => setContactModal((prev) => ({ ...prev, contactEmail: e.target.value }))}
                            />
                            <input
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                placeholder="Số điện thoại"
                                value={contactModal.contactPhone}
                                onChange={(e) => setContactModal((prev) => ({ ...prev, contactPhone: e.target.value }))}
                            />
                            <textarea
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                rows={3}
                                placeholder="Ghi chú thêm (tùy chọn)"
                                value={contactModal.note}
                                onChange={(e) => setContactModal((prev) => ({ ...prev, note: e.target.value }))}
                            />
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                className="px-4 py-2 text-sm rounded-lg border"
                                onClick={() => setContactModal({ open: false, mode: 'rent', apartment: null, contactName: '', contactEmail: '', contactPhone: '', note: '' })}
                            >
                                Hủy
                            </button>
                            <button
                                className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                                onClick={handleModalSubmit}
                            >
                                Gửi yêu cầu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Marketplace;

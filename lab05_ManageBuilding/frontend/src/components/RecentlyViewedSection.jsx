import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClockIcon } from '@heroicons/react/24/outline';
import { apartmentAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const RecentlyViewedSection = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [apartments, setApartments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchRecentlyViewed();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchRecentlyViewed = async () => {
        try {
            const response = await apartmentAPI.getRecentlyViewed(10);
            setApartments(response.data.data);
        } catch (error) {
            console.error('Error fetching recently viewed:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        if (price >= 1000000000) {
            return `${(price / 1000000000).toFixed(2)} tỷ`;
        }
        return `${(price / 1000000).toFixed(1)} tr`;
    };

    if (!user || loading) return null;
    if (apartments.length === 0) return null;

    return (
        <div className="my-8">
            <div className="flex items-center gap-2 mb-4">
                <ClockIcon className="w-6 h-6 text-gray-600" />
                <h3 className="text-xl font-semibold">Đã xem gần đây</h3>
            </div>

            <div className="overflow-x-auto pb-4">
                <div className="flex gap-4" style={{ minWidth: 'min-content' }}>
                    {apartments.map((item) => (
                        <div
                            key={item.apartment.id}
                            onClick={() => navigate(`/apartments/${item.apartment.id}`)}
                            className="flex-shrink-0 w-64 bg-white rounded-lg shadow hover:shadow-lg cursor-pointer transition-all"
                        >
                            <div className="relative h-40 overflow-hidden rounded-t-lg">
                                <img
                                    src={item.apartment.images && item.apartment.images[0]
                                        ? item.apartment.images[0]
                                        : 'https://via.placeholder.com/300x200?text=No+Image'}
                                    alt={`Căn hộ ${item.apartment.code}`}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                                    {item.apartment.mode === 'rent' ? 'Thuê' : 'Bán'}
                                </div>
                            </div>

                            <div className="p-3">
                                <h4 className="font-semibold mb-1">
                                    Căn {item.apartment.code}
                                </h4>
                                <p className="text-sm text-gray-600 mb-2">
                                    {item.apartment.type.toUpperCase()} • {item.apartment.area}m²
                                </p>
                                <p className="text-lg font-bold text-blue-600">
                                    {formatPrice(item.apartment.price)}
                                    {item.apartment.mode === 'rent' && <span className="text-xs font-normal">/th</span>}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RecentlyViewedSection;

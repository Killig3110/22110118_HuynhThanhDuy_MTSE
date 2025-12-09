import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apartmentAPI } from '../services/api';
import toast from 'react-hot-toast';

const SimilarApartments = ({ apartmentId, currentType }) => {
    const navigate = useNavigate();
    const [apartments, setApartments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSimilarApartments();
    }, [apartmentId]);

    const fetchSimilarApartments = async () => {
        setLoading(true);
        try {
            const response = await apartmentAPI.getSimilar(apartmentId, 6);
            setApartments(response.data.data);
        } catch (error) {
            console.error('Error fetching similar apartments:', error);
            toast.error('Không thể tải căn hộ tương tự');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        if (price >= 1000000000) {
            return `${(price / 1000000000).toFixed(2)} tỷ`;
        }
        return `${(price / 1000000).toFixed(1)} triệu`;
    };

    if (loading) {
        return (
            <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Căn hộ tương tự</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-48 bg-gray-200 rounded-lg mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (apartments.length === 0) {
        return null;
    }

    return (
        <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Căn hộ tương tự</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {apartments.map((apt) => (
                    <div
                        key={apt.id}
                        onClick={() => navigate(`/apartments/${apt.id}`)}
                        className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105 hover:shadow-lg"
                    >
                        {/* Image */}
                        <div className="relative h-48 overflow-hidden">
                            <img
                                src={apt.images && apt.images[0] ? apt.images[0] : 'https://via.placeholder.com/400x300?text=No+Image'}
                                alt={`Căn hộ ${apt.code}`}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                {apt.mode === 'rent' ? 'Cho thuê' : 'Bán'}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            <h4 className="font-semibold text-lg mb-2">
                                Căn hộ {apt.code}
                            </h4>

                            <p className="text-sm text-gray-600 mb-2">
                                {apt.block} - {apt.building} - Tầng {apt.floor}
                            </p>

                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                <span>{apt.area}m²</span>
                                <span>•</span>
                                <span>{apt.bedrooms} PN</span>
                                <span>•</span>
                                <span>{apt.bathrooms} WC</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-xl font-bold text-blue-600">
                                    {formatPrice(apt.price)}
                                    {apt.mode === 'rent' && <span className="text-sm font-normal">/tháng</span>}
                                </span>
                                <span className="text-sm px-2 py-1 bg-gray-100 rounded">
                                    {apt.type.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SimilarApartments;

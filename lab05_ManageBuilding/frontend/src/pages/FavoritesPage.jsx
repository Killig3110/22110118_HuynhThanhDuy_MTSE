import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline';
import { favoriteAPI } from '../services/api';
import FavoriteButton from '../components/FavoriteButton';
import toast from 'react-hot-toast';

const FavoritesPage = () => {
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchFavorites();
    }, [page]);

    const fetchFavorites = async () => {
        setLoading(true);
        try {
            const response = await favoriteAPI.getAll(page, 20);
            setFavorites(response.data.data);
            setTotalPages(response.data.pagination.totalPages);
        } catch (error) {
            console.error('Error fetching favorites:', error);
            toast.error('Không thể tải danh sách yêu thích');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFavorite = (apartmentId, isFavorite) => {
        if (!isFavorite) {
            // Removed from favorites, refresh list
            fetchFavorites();
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
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Căn hộ yêu thích</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (favorites.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Căn hộ yêu thích</h1>
                <div className="text-center py-12">
                    <HeartIconOutline className="w-24 h-24 mx-auto text-gray-300 mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                        Chưa có căn hộ yêu thích
                    </h2>
                    <p className="text-gray-500 mb-6">
                        Hãy khám phá và lưu lại những căn hộ bạn thích
                    </p>
                    <button
                        onClick={() => navigate('/marketplace')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Khám phá căn hộ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Căn hộ yêu thích ({favorites.length})</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((fav) => {
                    const apt = fav.apartment;
                    if (!apt) return null;

                    return (
                        <div
                            key={fav.id}
                            className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 hover:shadow-lg"
                        >
                            <div className="relative">
                                <img
                                    src={apt.images && apt.images[0] ? apt.images[0] : 'https://via.placeholder.com/400x300?text=No+Image'}
                                    alt={`Căn hộ ${apt.code}`}
                                    onClick={() => navigate(`/apartments/${apt.id}`)}
                                    className="w-full h-64 object-cover cursor-pointer"
                                />
                                <div className="absolute top-2 right-2">
                                    <FavoriteButton
                                        apartmentId={apt.id}
                                        initialFavorite={true}
                                        onToggle={(isFav) => handleToggleFavorite(apt.id, isFav)}
                                        size="lg"
                                    />
                                </div>
                                <div className="absolute top-2 left-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                    {apt.mode === 'rent' ? 'Cho thuê' : 'Bán'}
                                </div>
                            </div>

                            <div className="p-4">
                                <h3
                                    onClick={() => navigate(`/apartments/${apt.id}`)}
                                    className="font-semibold text-lg mb-2 cursor-pointer hover:text-blue-600"
                                >
                                    Căn hộ {apt.code}
                                </h3>

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
                                    <span className="text-2xl font-bold text-blue-600">
                                        {formatPrice(apt.price)}
                                        {apt.mode === 'rent' && <span className="text-sm font-normal">/tháng</span>}
                                    </span>
                                    <button
                                        onClick={() => navigate(`/apartments/${apt.id}`)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Xem chi tiết
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Trước
                    </button>
                    <span className="px-4 py-2">
                        Trang {page} / {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Sau
                    </button>
                </div>
            )}
        </div>
    );
};

export default FavoritesPage;

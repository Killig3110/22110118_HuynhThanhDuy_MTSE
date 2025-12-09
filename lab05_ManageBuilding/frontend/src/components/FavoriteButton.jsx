import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const FavoriteButton = ({ apartmentId, initialFavorite = false, onToggle, size = 'md' }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isFavorite, setIsFavorite] = useState(initialFavorite);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setIsFavorite(initialFavorite);
    }, [initialFavorite]);

    const handleToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            toast.error('Vui lòng đăng nhập để thêm yêu thích');
            navigate('/login');
            return;
        }

        setLoading(true);

        // Optimistic UI update
        const previousState = isFavorite;
        setIsFavorite(!isFavorite);

        try {
            if (isFavorite) {
                await api.delete(`/favorites/${apartmentId}`);
                toast.success('Đã xóa khỏi danh sách yêu thích');
            } else {
                await api.post(`/favorites/${apartmentId}`);
                toast.success('Đã thêm vào danh sách yêu thích');
            }

            // Notify parent component
            if (onToggle) {
                onToggle(!isFavorite);
            }
        } catch (error) {
            // Revert optimistic update on error
            setIsFavorite(previousState);
            console.error('Error toggling favorite:', error);
            toast.error(
                error.response?.data?.message ||
                'Không thể cập nhật yêu thích. Vui lòng thử lại.'
            );
        } finally {
            setLoading(false);
        }
    };

    const sizeClasses = {
        sm: 'w-5 h-5',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`
                p-2 rounded-full transition-all duration-200
                hover:bg-gray-100 active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed
                ${loading ? 'animate-pulse' : ''}
            `}
            title={isFavorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
            {isFavorite ? (
                <HeartIconSolid
                    className={`${sizeClasses[size]} text-red-500`}
                />
            ) : (
                <HeartIcon
                    className={`${sizeClasses[size]} text-gray-600 hover:text-red-500`}
                />
            )}
        </button>
    );
};

export default FavoriteButton;

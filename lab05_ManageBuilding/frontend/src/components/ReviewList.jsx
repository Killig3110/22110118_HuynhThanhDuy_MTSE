import { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { reviewAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ReviewList = ({ apartmentId }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [editingReview, setEditingReview] = useState(null);
    const [editRating, setEditRating] = useState(0);
    const [editComment, setEditComment] = useState('');

    useEffect(() => {
        fetchReviews();
    }, [apartmentId, page]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const response = await reviewAPI.getByApartment(apartmentId, page);
            setReviews(response.data.data.reviews);
            setAvgRating(response.data.data.avgRating);
            setTotalReviews(response.data.data.totalReviews);
            setTotalPages(response.data.pagination.totalPages);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            toast.error('Không thể tải đánh giá');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (review) => {
        setEditingReview(review.id);
        setEditRating(review.rating);
        setEditComment(review.comment || '');
    };

    const handleCancelEdit = () => {
        setEditingReview(null);
        setEditRating(0);
        setEditComment('');
    };

    const handleUpdateReview = async (reviewId) => {
        if (editRating === 0) {
            toast.error('Vui lòng chọn số sao');
            return;
        }

        try {
            await reviewAPI.update(reviewId, { rating: editRating, comment: editComment });
            toast.success('Đã cập nhật đánh giá');
            setEditingReview(null);
            fetchReviews();
        } catch (error) {
            console.error('Error updating review:', error);
            toast.error('Không thể cập nhật đánh giá');
        }
    };

    const handleDelete = async (reviewId) => {
        if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;

        try {
            await reviewAPI.delete(reviewId);
            toast.success('Đã xóa đánh giá');
            fetchReviews();
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error('Không thể xóa đánh giá');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            {/* Summary */}
            <div className="mb-6 pb-6 border-b">
                <h3 className="text-lg font-semibold mb-2">Đánh giá từ cư dân</h3>
                {totalReviews > 0 ? (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center">
                            <StarIcon className="w-6 h-6 text-yellow-400 mr-1" />
                            <span className="text-2xl font-bold">{avgRating}</span>
                            <span className="text-gray-500 ml-1">/5</span>
                        </div>
                        <span className="text-gray-600">
                            ({totalReviews} đánh giá)
                        </span>
                    </div>
                ) : (
                    <p className="text-gray-500">Chưa có đánh giá nào</p>
                )}
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
                {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                        {editingReview === review.id ? (
                            /* Edit Mode */
                            <div className="space-y-3">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setEditRating(star)}
                                            className="focus:outline-none"
                                        >
                                            <StarIcon
                                                className={`w-6 h-6 ${star <= editRating ? 'text-yellow-400' : 'text-gray-300'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={editComment}
                                    onChange={(e) => setEditComment(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleUpdateReview(review.id)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Lưu
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* View Mode */
                            <>
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={review.user?.avatar || `https://ui-avatars.com/api/?name=${review.user?.firstName}+${review.user?.lastName}&background=random`}
                                            alt={`${review.user?.firstName} ${review.user?.lastName}`}
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <div>
                                            <p className="font-medium">
                                                {review.user?.firstName} {review.user?.lastName}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <StarIcon
                                                            key={i}
                                                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-sm text-gray-500">
                                                    {formatDate(review.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Edit/Delete buttons for own reviews */}
                                    {user && user.id === review.userId && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(review)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                title="Chỉnh sửa"
                                            >
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(review.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                title="Xóa"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {review.comment && (
                                    <p className="text-gray-700 mt-2">{review.comment}</p>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
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

export default ReviewList;

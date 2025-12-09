import { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { reviewAPI } from '../services/api';

const ReviewForm = ({ apartmentId, onReviewSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hoveredRating, setHoveredRating] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error('Vui lòng chọn số sao đánh giá');
            return;
        }

        if (comment.trim().length < 10) {
            toast.error('Nhận xét phải có ít nhất 10 ký tự');
            return;
        }

        setLoading(true);

        try {
            const response = await reviewAPI.create(apartmentId, { rating, comment });
            toast.success('Đã gửi đánh giá thành công!');

            // Reset form
            setRating(0);
            setComment('');

            // Notify parent
            if (onReviewSubmitted) {
                onReviewSubmitted(response.data.data);
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error(
                error.response?.data?.message ||
                'Không thể gửi đánh giá. Vui lòng thử lại.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Đánh giá căn hộ</h3>

            <form onSubmit={handleSubmit}>
                {/* Star Rating */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Đánh giá của bạn <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="focus:outline-none transition-transform hover:scale-110"
                            >
                                {star <= (hoveredRating || rating) ? (
                                    <StarIcon className="w-8 h-8 text-yellow-400" />
                                ) : (
                                    <StarIconOutline className="w-8 h-8 text-gray-300" />
                                )}
                            </button>
                        ))}
                        {rating > 0 && (
                            <span className="ml-2 text-sm text-gray-600 self-center">
                                {rating} sao
                            </span>
                        )}
                    </div>
                </div>

                {/* Comment */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nhận xét của bạn <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Chia sẻ trải nghiệm của bạn về căn hộ này..."
                        rows={4}
                        maxLength={2000}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                        {comment.length}/2000 ký tự (tối thiểu 10)
                    </p>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading || rating === 0 || comment.trim().length < 10}
                    className={`
                        w-full py-2 px-4 rounded-lg font-medium transition-colors
                        ${loading || rating === 0 || comment.trim().length < 10
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }
                    `}
                >
                    {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
            </form>
        </div>
    );
};

export default ReviewForm;

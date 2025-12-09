import { UserGroupIcon, StarIcon, EyeIcon, HeartIcon } from '@heroicons/react/24/outline';

const ApartmentStats = ({ stats }) => {
    if (!stats) return null;

    const formatNumber = (num) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    };

    const statItems = [
        {
            icon: UserGroupIcon,
            label: 'Đã thuê/mua',
            value: stats.buyerCount,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            icon: StarIcon,
            label: 'Đánh giá',
            value: stats.reviewCount > 0 ? `${stats.avgRating}★ (${stats.reviewCount})` : 'Chưa có',
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            hideZero: false
        },
        {
            icon: EyeIcon,
            label: 'Lượt xem',
            value: formatNumber(stats.viewCount),
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            icon: HeartIcon,
            label: 'Yêu thích',
            value: stats.favoriteCount,
            color: 'text-red-600',
            bgColor: 'bg-red-50'
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
            {statItems.map((item, index) => {
                const Icon = item.icon;
                const displayValue = typeof item.value === 'number' && item.hideZero !== false
                    ? (item.value || 0)
                    : item.value;

                return (
                    <div
                        key={index}
                        className={`${item.bgColor} rounded-lg p-4 transition-transform hover:scale-105`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`${item.color}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">{item.label}</p>
                                <p className={`text-lg font-semibold ${item.color}`}>
                                    {displayValue}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ApartmentStats;

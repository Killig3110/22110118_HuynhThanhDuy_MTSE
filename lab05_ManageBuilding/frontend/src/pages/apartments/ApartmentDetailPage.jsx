import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { apartmentAPI, leaseAPI, favoriteAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import AddToCartModal from '../../components/cart/AddToCartModal';
import GuestLeaseRequestModal from '../../components/leases/GuestLeaseRequestModal';
import FavoriteButton from '../../components/FavoriteButton';
import ApartmentStats from '../../components/ApartmentStats';
import ReviewForm from '../../components/ReviewForm';
import ReviewList from '../../components/ReviewList';
import SimilarApartments from '../../components/SimilarApartments';
import {
    Home, MapPin, Maximize, Bed, Bath, Car, Calendar,
    DollarSign, CheckCircle, XCircle, Heart, Share2,
    ChevronLeft, ChevronRight, Building2, Layers
} from 'lucide-react';

const ApartmentDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart } = useCart();

    const [apartment, setApartment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [addToCartModalOpen, setAddToCartModalOpen] = useState(false);
    const [guestRequestModalOpen, setGuestRequestModalOpen] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [stats, setStats] = useState(null);
    const [canReview, setCanReview] = useState(false);
    const [reviewsKey, setReviewsKey] = useState(0);

    useEffect(() => {
        loadApartment();
        trackView();
        checkFavoriteStatus();
        loadStats();
        checkReviewEligibility();
    }, [id, user]);

    const loadApartment = async () => {
        try {
            setLoading(true);
            const { data } = await apartmentAPI.getById(id);
            setApartment(data.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load apartment details');
            toast.error('Failed to load apartment');
        } finally {
            setLoading(false);
        }
    };

    const trackView = async () => {
        try {
            await apartmentAPI.trackView(id);
            // Refresh stats after tracking view
            setTimeout(() => {
                loadStats();
            }, 500);
        } catch (error) {
            console.error('Error tracking view:', error);
        }
    };

    const checkFavoriteStatus = async () => {
        if (!user) return;
        try {
            const response = await favoriteAPI.check(id);
            setIsFavorite(response.data.isFavorite);
        } catch (error) {
            console.error('Error checking favorite:', error);
        }
    };

    const loadStats = async () => {
        try {
            const response = await apartmentAPI.getStats(id);
            setStats(response.data.data);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const checkReviewEligibility = async () => {
        // Only authenticated users who are tenants/owners can review
        // This will be validated by backend, but we can add UI hint
        if (user) {
            setCanReview(true); // Backend will do actual validation
        }
    };

    const handleAddToCart = () => {
        if (!user) {
            toast.error('Please login to add to cart');
            navigate('/login');
            return;
        }
        setAddToCartModalOpen(true);
    };

    const handleRequestLease = () => {
        if (!user) {
            setGuestRequestModalOpen(true);
        } else {
            // Authenticated user - direct request
            navigate('/my-requests'); // Or open authenticated request modal
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Apartment ${apartment.apartmentNumber}`,
                    text: `Check out this apartment - ${apartment.type}, ${apartment.area}m²`,
                    url: url
                });
            } catch (err) {
                console.log('Share failed:', err);
            }
        } else {
            navigator.clipboard.writeText(url);
            toast.success('Link copied to clipboard!');
        }
    };

    const handleToggleFavorite = (newFavoriteState) => {
        setIsFavorite(newFavoriteState);
    };

    const handleReviewSubmitted = () => {
        loadStats(); // Refresh stats after new review
        setReviewsKey(prev => prev + 1); // Force ReviewList to re-fetch
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !apartment) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <XCircle className="h-16 w-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Apartment Not Found</h2>
                <p className="text-gray-600 mb-4">{error || 'The apartment you are looking for does not exist.'}</p>
                <button
                    onClick={() => navigate('/marketplace')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Back to Marketplace
                </button>
            </div>
        );
    }

    // Mock images - replace with actual apartment.images
    const images = apartment.images?.length > 0
        ? apartment.images
        : [
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
        ];

    const amenities = [
        { name: 'Parking', available: apartment.parkingSlots > 0, icon: Car },
        { name: 'Balcony', available: apartment.balconies > 0, icon: Home },
        { name: 'Elevator', available: true, icon: Layers },
        { name: 'Security', available: true, icon: CheckCircle }
    ];

    const isAvailable = ['for_rent', 'for_sale'].includes(apartment.status) && (apartment.isListedForRent || apartment.isListedForSale);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex items-center space-x-2 text-sm text-gray-600">
                        <Link to="/" className="hover:text-blue-600">Home</Link>
                        <span>/</span>
                        <Link to="/marketplace" className="hover:text-blue-600">Marketplace</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">Apartment {apartment.apartmentNumber}</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Gallery Section */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                        {/* Main Image */}
                        <div className="relative aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden">
                            <img
                                src={images[selectedImageIndex]}
                                alt={`Apartment ${apartment.apartmentNumber}`}
                                className="w-full h-full object-cover"
                            />
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
                                    >
                                        <ChevronLeft className="h-6 w-6" />
                                    </button>
                                    <button
                                        onClick={() => setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
                                    >
                                        <ChevronRight className="h-6 w-6" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnail Grid */}
                        <div className="grid grid-cols-3 gap-2">
                            {images.slice(0, 6).map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImageIndex(idx)}
                                    className={`aspect-[4/3] rounded-lg overflow-hidden ${selectedImageIndex === idx ? 'ring-2 ring-blue-600' : ''
                                        }`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Overview */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                        Apartment {apartment.apartmentNumber}
                                    </h1>
                                    <div className="flex items-center text-gray-600 space-x-4">
                                        <span className="flex items-center">
                                            <Building2 className="h-4 w-4 mr-1" />
                                            {apartment.floor?.building?.name}
                                        </span>
                                        <span className="flex items-center">
                                            <Layers className="h-4 w-4 mr-1" />
                                            Floor {apartment.floor?.floorNumber}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <FavoriteButton
                                        apartmentId={id}
                                        initialFavorite={isFavorite}
                                        onToggle={handleToggleFavorite}
                                        size="lg"
                                    />
                                    <button
                                        onClick={handleShare}
                                        className="p-2 rounded-full hover:bg-gray-100"
                                    >
                                        <Share2 className="h-6 w-6 text-gray-400" />
                                    </button>
                                </div>
                            </div>

                            {/* Apartment Stats */}
                            {stats && <ApartmentStats stats={stats} />}

                            {/* Status Badge */}
                            <div className="flex items-center space-x-2 mb-6">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${['for_rent', 'for_sale'].includes(apartment.status)
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}>
                                    {['for_rent', 'for_sale'].includes(apartment.status) ? 'Available' : 'Not Available'}
                                </span>
                                {apartment.isListedForRent && (
                                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                        For Rent
                                    </span>
                                )}
                                {apartment.isListedForSale && (
                                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                        For Sale
                                    </span>
                                )}
                            </div>

                            {/* Key Features */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="flex items-center space-x-3">
                                    <Maximize className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Area</p>
                                        <p className="font-semibold">{apartment.area} m²</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Bed className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Bedrooms</p>
                                        <p className="font-semibold">{apartment.bedrooms}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Bath className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Bathrooms</p>
                                        <p className="font-semibold">{apartment.bathrooms}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Car className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Parking</p>
                                        <p className="font-semibold">{apartment.parkingSlots}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Description</h3>
                                <p className="text-gray-600">
                                    {apartment.description || `Beautiful ${apartment.type} apartment with ${apartment.bedrooms} bedrooms and ${apartment.bathrooms} bathrooms. Located on floor ${apartment.floor?.floorNumber} of ${apartment.floor?.building?.name}. Perfect for families or professionals looking for a comfortable living space.`}
                                </p>
                            </div>
                        </div>

                        {/* Amenities */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold mb-4">Amenities</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {amenities.map((amenity) => (
                                    <div
                                        key={amenity.name}
                                        className={`flex items-center space-x-2 ${amenity.available ? 'text-green-600' : 'text-gray-400'
                                            }`}
                                    >
                                        {amenity.available ? (
                                            <CheckCircle className="h-5 w-5" />
                                        ) : (
                                            <XCircle className="h-5 w-5" />
                                        )}
                                        <span>{amenity.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Location */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                                <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                                Location
                            </h3>
                            <div className="space-y-2">
                                <p className="text-gray-600">
                                    <span className="font-medium">Block:</span> {apartment.floor?.building?.block?.name}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">Building:</span> {apartment.floor?.building?.name}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">Floor:</span> {apartment.floor?.floorNumber}
                                </p>
                            </div>
                        </div>

                        {/* Reviews Section */}
                        <div className="space-y-6">
                            {canReview && user && (
                                <ReviewForm
                                    apartmentId={id}
                                    onReviewSubmitted={handleReviewSubmitted}
                                />
                            )}
                            <ReviewList key={reviewsKey} apartmentId={id} />
                        </div>
                    </div>

                    {/* Right Column - Pricing & Actions */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
                            {/* Pricing */}
                            <div className="mb-6">
                                {apartment.isListedForRent && apartment.monthlyRent && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600 mb-1">Monthly Rent</p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            ${apartment.monthlyRent.toLocaleString()}
                                            <span className="text-lg text-gray-600">/mo</span>
                                        </p>
                                    </div>
                                )}
                                {apartment.isListedForSale && apartment.price && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600 mb-1">Sale Price</p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            ${apartment.price.toLocaleString()}
                                        </p>
                                    </div>
                                )}
                                {apartment.maintenanceFee && (
                                    <div className="text-sm text-gray-600">
                                        Maintenance: ${apartment.maintenanceFee}/mo
                                    </div>
                                )}
                                {apartment.deposit && (
                                    <div className="text-sm text-gray-600">
                                        Deposit: ${apartment.deposit}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="space-y-3">
                                {isAvailable && (
                                    <>
                                        {/* Guest or User: Show request and cart options */}
                                        {(!user || user.role?.name === 'user') && (
                                            <>
                                                <button
                                                    onClick={handleRequestLease}
                                                    className="w-full py-3 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium transition-colors"
                                                >
                                                    {user ? 'Request Lease' : 'Request as Guest'}
                                                </button>
                                                {user && (
                                                    <button
                                                        onClick={handleAddToCart}
                                                        className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
                                                    >
                                                        Add to Cart
                                                    </button>
                                                )}
                                            </>
                                        )}

                                        {/* Resident/Owner/Staff: Cannot request */}
                                        {user && ['resident', 'owner', 'admin', 'building_manager', 'security', 'technician', 'accountant'].includes(user.role?.name) && (
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-sm text-yellow-800">
                                                You cannot request apartments as a {user.role?.name}.
                                            </div>
                                        )}
                                    </>
                                )}

                                {!isAvailable && (
                                    <div className="bg-red-50 border border-red-200 rounded-md p-4 text-sm text-red-800">
                                        This apartment is currently not available for rent or sale.
                                    </div>
                                )}

                                <button
                                    onClick={() => navigate('/buildings/map')}
                                    className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium transition-colors"
                                >
                                    View on Map
                                </button>
                            </div>

                            {/* Contact Info */}
                            <div className="mt-6 pt-6 border-t">
                                <h4 className="font-semibold mb-3">Need Help?</h4>
                                <p className="text-sm text-gray-600 mb-2">
                                    Contact our team for more information
                                </p>
                                <a
                                    href="tel:+1234567890"
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                    +1 (234) 567-890
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Similar Apartments */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                <SimilarApartments apartmentId={id} currentType={apartment?.type} />
            </div>

            {/* Modals */}
            {user && (
                <AddToCartModal
                    isOpen={addToCartModalOpen}
                    onClose={() => setAddToCartModalOpen(false)}
                    apartment={apartment}
                />
            )}

            <GuestLeaseRequestModal
                isOpen={guestRequestModalOpen}
                onClose={() => setGuestRequestModalOpen(false)}
                apartment={apartment}
            />
        </div>
    );
};

export default ApartmentDetailPage;

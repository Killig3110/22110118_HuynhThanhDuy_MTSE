import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import OrderSummary from '../../components/checkout/OrderSummary';
import PaymentMethodSelector from '../../components/checkout/PaymentMethodSelector';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cartItems, isLoading, checkout } = useCart();
    const [paymentMethod, setPaymentMethod] = useState('credit_card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);

    const selectedItems = cartItems.filter(item => item.selected);

    useEffect(() => {
        // Redirect if no items selected
        if (!isLoading && selectedItems.length === 0) {
            toast.error('No items selected for checkout');
            navigate('/cart');
        }
    }, [selectedItems.length, isLoading, navigate]);

    const handleCheckout = async () => {
        if (!paymentMethod) {
            toast.error('Please select a payment method');
            return;
        }

        setIsProcessing(true);

        try {
            const result = await checkout();
            
            if (result.success) {
                setOrderComplete(true);
                toast.success(`Successfully created ${result.data.count} lease request(s)!`);
            } else {
                toast.error(result.error || 'Failed to process checkout');
                setIsProcessing(false);
            }

        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('Failed to process checkout. Please try again.');
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading checkout...</p>
                </div>
            </div>
        );
    }

    if (orderComplete) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                        <div className="mb-6">
                            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Order Placed Successfully!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Your order has been received and is being processed.
                            You will receive a confirmation email shortly.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                Go to Dashboard
                            </button>
                            <button
                                onClick={() => navigate('/buildings/map')}
                                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            >
                                Browse More Apartments
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/cart')}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back to Cart
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
                    <p className="text-gray-600 mt-2">
                        Review your order and complete payment
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left side - Payment & Billing */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Customer Information */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={`${user?.firstName || ''} ${user?.lastName || ''}`}
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={user?.phoneNumber || ''}
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date of Birth
                                    </label>
                                    <input
                                        type="text"
                                        value={user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'N/A'}
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <PaymentMethodSelector
                                selectedMethod={paymentMethod}
                                onMethodChange={setPaymentMethod}
                            />
                        </div>

                        {/* Terms and Conditions */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-start">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    defaultChecked
                                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="terms" className="ml-3 text-sm text-gray-700">
                                    I agree to the{' '}
                                    <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                                        Terms and Conditions
                                    </a>{' '}
                                    and{' '}
                                    <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                                        Privacy Policy
                                    </a>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            <OrderSummary cartItems={cartItems} />

                            {/* Checkout Button */}
                            <button
                                onClick={handleCheckout}
                                disabled={isProcessing || !paymentMethod}
                                className="w-full mt-6 px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    'Complete Checkout'
                                )}
                            </button>

                            <p className="text-xs text-gray-500 text-center mt-4">
                                🔒 Your payment information is secure and encrypted
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;

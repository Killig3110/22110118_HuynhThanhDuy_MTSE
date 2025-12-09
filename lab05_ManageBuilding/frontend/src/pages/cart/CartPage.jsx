import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { CartItemCard, PaymentBreakdown } from 'lab07_cartcomponent';
import 'lab07_cartcomponent/src/styles.css';
import toast from 'react-hot-toast';

const CartPage = () => {
    const navigate = useNavigate();
    const {
        cartItems,
        isLoading,
        error,
        removeFromCart,
        updateCartItem,
        toggleSelection,
        selectAll,
        clearCart,
        calculateTotals
    } = useCart();

    const totals = calculateTotals();

    // Handle remove item
    const handleRemove = async (itemId) => {
        if (window.confirm('Are you sure you want to remove this item from cart?')) {
            await removeFromCart(itemId);
        }
    };

    // Handle update lease term
    const handleUpdateMonths = async (itemId, newMonths) => {
        await updateCartItem(itemId, { months: newMonths });
    };

    // Handle select/deselect item
    const handleToggleSelect = async (itemId) => {
        await toggleSelection(itemId);
    };

    // Handle select all
    const handleSelectAll = async () => {
        const allSelected = cartItems.every(item => item.selected);
        await selectAll(!allSelected);
    };

    // Handle clear cart
    const handleClearCart = async () => {
        if (window.confirm('Are you sure you want to clear all items from cart?')) {
            await clearCart();
        }
    };

    // Handle checkout - navigate to checkout page
    const handleCheckout = () => {
        const selectedItems = cartItems.filter(item => item.selected);
        if (selectedItems.length === 0) {
            toast.error('Please select at least one item to checkout');
            return;
        }
        navigate('/checkout');
    };

    if (isLoading && cartItems.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading cart...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Error: {error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Invoice</h1>
                    <p className="text-gray-600">
                        {totals.totalItems} approved {totals.totalItems === 1 ? 'apartment' : 'apartments'} ready for payment
                    </p>
                </div>

                {cartItems.length === 0 ? (
                    // Empty cart
                    <div className="text-center py-16">
                        <div className="mb-4">
                            <svg
                                className="mx-auto h-24 w-24 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No pending payments</h3>
                        <p className="text-gray-600 mb-6">Submit a lease request to get started!</p>
                        <a
                            href="/marketplace"
                            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Browse Marketplace
                        </a>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Select All */}
                            <div className="bg-white rounded-lg shadow-sm p-4">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={cartItems.length > 0 && cartItems.every(item => item.selected)}
                                        onChange={handleSelectAll}
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <span className="ml-3 text-gray-700 font-medium">
                                        Select All ({totals.selectedItems}/{totals.totalItems})
                                    </span>
                                </label>
                            </div>

                            {/* Cart Items using lab07 CartItemCard */}
                            {cartItems.map((item) => {
                                // Use the nested apartment object from API response
                                const apartment = item.apartment || {};

                                return (
                                    <div key={item.id} className="relative">
                                        <CartItemCard
                                            // Selection
                                            selectable={true}
                                            selected={item.selected}
                                            onSelectToggle={() => handleToggleSelect(item.id)}

                                            // Basic info - use apartment data from API
                                            code={apartment.apartmentNumber || item.code || 'N/A'}
                                            title={item.title || `${item.type?.toUpperCase()} Apartment`}
                                            type={apartment.type || item.type}
                                            mode={item.mode}

                                            // Location hierarchy - use flattened fields from API
                                            block={item.block}
                                            building={item.building}
                                            floor={item.floor}

                                            // Apartment details
                                            bedrooms={apartment.bedrooms || item.bedrooms}
                                            bathrooms={apartment.bathrooms || item.bathrooms}
                                            balconies={apartment.balconies || item.balconies}
                                            parkingSlots={apartment.parkingSlots || item.parkingSlots}

                                            // Area - use numeric value from API
                                            area={apartment.area || item.area}

                                            // Amenities
                                            amenities={apartment.amenities || item.amenities || []}

                                            // Financial - already parsed in backend
                                            price={item.price || 0}
                                            deposit={item.deposit || 0}
                                            maintenanceFee={item.maintenanceFee || 0}

                                            // Lease term
                                            months={item.months}
                                            minLeaseTerm={6}
                                            maxLeaseTerm={36}
                                            onMonthsChange={(newMonths) => handleUpdateMonths(item.id, newMonths)}

                                            // Status
                                            status={apartment.status || item.status}

                                            // Note
                                            note={item.note}

                                            // Image - use first image from apartment images array
                                            image={apartment.images?.[0] || null}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Payment Summary */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-8">
                                <PaymentBreakdown
                                    items={cartItems.map(item => ({
                                        ...item,
                                        price: item.price || 0,
                                        deposit: item.deposit || 0,
                                        maintenanceFee: item.maintenanceFee || 0
                                    }))}
                                    showDeposit={true}
                                    showMaintenance={true}
                                    showTaxes={false}
                                    taxRate={0.1}
                                    onCheckout={handleCheckout}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;

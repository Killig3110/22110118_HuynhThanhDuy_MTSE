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

    // Handle checkout
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
                    <p className="text-gray-600">
                        {totals.totalItems} {totals.totalItems === 1 ? 'item' : 'items'} in cart
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
                                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                        <p className="text-gray-600 mb-6">Start adding apartments to your cart!</p>
                        <a
                            href="/apartments"
                            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Browse Apartments
                        </a>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Select All & Clear */}
                            <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
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
                                <button
                                    onClick={handleClearCart}
                                    className="text-red-600 hover:text-red-700 font-medium"
                                >
                                    Clear Cart
                                </button>
                            </div>

                            {/* Cart Items using lab07 CartItemCard */}
                            {cartItems.map((item) => {
                                const apartment = item.apartment || {};
                                const floor = apartment.floor || {};
                                const building = floor.building || {};
                                const block = building.block || {};

                                return (
                                    <div key={item.id} className="relative">
                                        <CartItemCard
                                            // Selection
                                            selected={item.selected}
                                            onSelect={() => handleToggleSelect(item.id)}

                                            // Basic info
                                            title={`Apartment ${apartment.number}`}
                                            mode={item.mode}

                                            // Location hierarchy
                                            block={block.name || 'N/A'}
                                            building={building.name || 'N/A'}
                                            floor={floor.number || 'N/A'}

                                            // Apartment details
                                            bedrooms={apartment.bedrooms || 0}
                                            bathrooms={apartment.bathrooms || 0}
                                            balconies={apartment.balconies || 0}
                                            parkingSpots={apartment.parkingSpots || 0}

                                            // Area
                                            area={apartment.area ? `${apartment.area} m²` : 'N/A'}

                                            // Amenities
                                            amenities={apartment.amenities || []}

                                            // Financial
                                            price={parseFloat(item.priceSnapshot) || 0}
                                            deposit={parseFloat(item.depositSnapshot) || 0}
                                            maintenanceFee={parseFloat(item.maintenanceFeeSnapshot) || 0}

                                            // Lease term
                                            months={item.months}
                                            minMonths={6}
                                            maxMonths={36}
                                            onMonthsChange={(newMonths) => handleUpdateMonths(item.id, newMonths)}

                                            // Actions
                                            onRemove={() => handleRemove(item.id)}

                                            // Status
                                            status={apartment.status}

                                            // Note
                                            note={item.note}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Payment Summary */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-8">
                                <PaymentBreakdown
                                    rentItems={cartItems.filter(item => item.selected && item.mode === 'rent').map(item => ({
                                        name: `Apartment ${item.apartment?.number || 'N/A'}`,
                                        monthlyRent: parseFloat(item.priceSnapshot) || 0,
                                        deposit: parseFloat(item.depositSnapshot) || 0,
                                        maintenanceFee: parseFloat(item.maintenanceFeeSnapshot) || 0,
                                        months: item.months
                                    }))}
                                    buyItems={cartItems.filter(item => item.selected && item.mode === 'buy').map(item => ({
                                        name: `Apartment ${item.apartment?.number || 'N/A'}`,
                                        price: parseFloat(item.priceSnapshot) || 0,
                                        maintenanceFee: parseFloat(item.maintenanceFeeSnapshot) || 0
                                    }))}
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

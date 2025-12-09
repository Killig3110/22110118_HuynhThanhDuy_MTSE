import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { CartItemCard } from 'lab07_cartcomponent';
import 'lab07_cartcomponent/src/styles.css';
import toast from 'react-hot-toast';
import { Filter, SortAsc, Trash2, CheckSquare, Square, ArrowLeft } from 'lucide-react';

const CartManagement = () => {
    const navigate = useNavigate();
    const {
        cartItems,
        isLoading,
        removeFromCart,
        updateCartItem,
        toggleSelection,
        selectAll,
        clearCart,
    } = useCart();

    const [filterMode, setFilterMode] = useState('all'); // all, rent, buy
    const [sortBy, setSortBy] = useState('date'); // date, price, name
    const [showFilters, setShowFilters] = useState(false);

    // Filter cart items
    const filteredItems = cartItems.filter(item => {
        if (filterMode === 'all') return true;
        return item.mode === filterMode;
    });

    // Sort cart items
    const sortedItems = [...filteredItems].sort((a, b) => {
        switch (sortBy) {
            case 'date':
                return new Date(b.addedAt) - new Date(a.addedAt);
            case 'price':
                return parseFloat(b.priceSnapshot) - parseFloat(a.priceSnapshot);
            case 'name':
                return (a.apartment?.number || '').localeCompare(b.apartment?.number || '');
            default:
                return 0;
        }
    });

    const handleBulkDelete = async () => {
        const selectedItems = cartItems.filter(item => item.selected);
        if (selectedItems.length === 0) {
            toast.error('No items selected');
            return;
        }

        if (window.confirm(`Delete ${selectedItems.length} selected items?`)) {
            for (const item of selectedItems) {
                await removeFromCart(item.id);
            }
        }
    };

    const handleRemove = async (itemId) => {
        if (window.confirm('Remove this item from cart?')) {
            await removeFromCart(itemId);
        }
    };

    const handleUpdateMonths = async (itemId, newMonths) => {
        await updateCartItem(itemId, { months: newMonths });
    };

    const handleToggleSelect = async (itemId) => {
        await toggleSelection(itemId);
    };

    const handleSelectAll = async () => {
        const allSelected = filteredItems.every(item => item.selected);
        // Only toggle selection for filtered items
        for (const item of filteredItems) {
            if (item.selected === allSelected) {
                await toggleSelection(item.id);
            }
        }
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

    const selectedCount = filteredItems.filter(item => item.selected).length;

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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Cart Management</h1>
                    <p className="text-gray-600">
                        Advanced cart management with filters and bulk actions
                    </p>
                </div>

                {/* Toolbar */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        {/* Left side - Filters & Sort */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                <Filter className="h-4 w-4" />
                                Filters
                            </button>

                            <select
                                value={filterMode}
                                onChange={(e) => setFilterMode(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Items ({cartItems.length})</option>
                                <option value="rent">Rent Only ({cartItems.filter(i => i.mode === 'rent').length})</option>
                                <option value="buy">Buy Only ({cartItems.filter(i => i.mode === 'buy').length})</option>
                            </select>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="date">Sort by Date</option>
                                <option value="price">Sort by Price</option>
                                <option value="name">Sort by Name</option>
                            </select>
                        </div>

                        {/* Right side - Bulk Actions */}
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">
                                {selectedCount} of {filteredItems.length} selected
                            </span>
                            <button
                                onClick={handleSelectAll}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                {filteredItems.every(item => item.selected) ? (
                                    <CheckSquare className="h-4 w-4" />
                                ) : (
                                    <Square className="h-4 w-4" />
                                )}
                                Select All
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                disabled={selectedCount === 0}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete Selected
                            </button>
                        </div>
                    </div>

                    {/* Expandable Filters */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Price Range
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                        <span>-</span>
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Lease Term (Months)
                                    </label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                        <option>All</option>
                                        <option>6 months</option>
                                        <option>12 months</option>
                                        <option>24 months</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                        <option>All</option>
                                        <option>Available</option>
                                        <option>Pending</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Cart Items */}
                {sortedItems.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <p className="text-gray-500">No items match your filters</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sortedItems.map((item) => {
                            const apartment = item.apartment || {};
                            const floor = apartment.floor || {};
                            const building = floor.building || {};
                            const block = building.block || {};

                            return (
                                <div key={item.id} className="relative">
                                    <CartItemCard
                                        selected={item.selected}
                                        onSelect={() => handleToggleSelect(item.id)}
                                        title={`Apartment ${apartment.number}`}
                                        mode={item.mode}
                                        block={block.name || 'N/A'}
                                        building={building.name || 'N/A'}
                                        floor={floor.number || 'N/A'}
                                        bedrooms={apartment.bedrooms || 0}
                                        bathrooms={apartment.bathrooms || 0}
                                        balconies={apartment.balconies || 0}
                                        parkingSpots={apartment.parkingSpots || 0}
                                        area={apartment.area ? `${apartment.area} m²` : 'N/A'}
                                        amenities={apartment.amenities || []}
                                        price={parseFloat(item.priceSnapshot) || 0}
                                        deposit={parseFloat(item.depositSnapshot) || 0}
                                        maintenanceFee={parseFloat(item.maintenanceFeeSnapshot) || 0}
                                        months={item.months}
                                        minMonths={6}
                                        maxMonths={36}
                                        onMonthsChange={(newMonths) => handleUpdateMonths(item.id, newMonths)}
                                        onRemove={() => handleRemove(item.id)}
                                        status={apartment.status}
                                        note={item.note}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartManagement;

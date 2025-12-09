import React, { useState, useEffect } from 'react';
import { LeaseTermSelector } from 'lab07_cartcomponent';
import 'lab07_cartcomponent/src/styles.css';
import { X } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import toast from 'react-hot-toast';

const AddToCartModal = ({ isOpen, onClose, apartment }) => {
    const { addToCart, isLoading } = useCart();
    const [mode, setMode] = useState('rent');
    const [months, setMonths] = useState(12);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setMode('rent');
            setMonths(12);
        }
    }, [isOpen]);

    if (!isOpen || !apartment) return null;

    const handleAddToCart = async () => {
        const result = await addToCart(apartment.id, mode, mode === 'rent' ? months : null);

        if (result.success) {
            onClose();
        }
    };

    const monthlyRent = parseFloat(apartment.monthlyRent) || 0;
    const purchasePrice = parseFloat(apartment.purchasePrice) || 0;
    const deposit = monthlyRent * 2;
    const maintenanceFee = parseFloat(apartment.maintenanceFee) || 0;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    {/* Header */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Add to Cart
                        </h2>
                        <p className="text-gray-600">
                            Apartment {apartment.number} - {apartment.area} m²
                        </p>
                    </div>

                    {/* Mode Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Select Mode
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setMode('rent')}
                                className={`p-4 border-2 rounded-lg text-center transition-all ${mode === 'rent'
                                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="font-semibold mb-1">Rent</div>
                                <div className="text-2xl font-bold">
                                    ${monthlyRent.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-600">per month</div>
                            </button>

                            <button
                                onClick={() => setMode('buy')}
                                className={`p-4 border-2 rounded-lg text-center transition-all ${mode === 'buy'
                                        ? 'border-green-600 bg-green-50 text-green-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="font-semibold mb-1">Buy</div>
                                <div className="text-2xl font-bold">
                                    ${purchasePrice.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-600">one-time</div>
                            </button>
                        </div>
                    </div>

                    {/* Lease Term Selector (only for rent) */}
                    {mode === 'rent' && (
                        <div className="mb-6">
                            <LeaseTermSelector
                                months={months}
                                minMonths={6}
                                maxMonths={36}
                                monthlyRent={monthlyRent}
                                deposit={deposit}
                                onChange={setMonths}
                            />
                        </div>
                    )}

                    {/* Price Breakdown */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-3">Price Summary</h3>
                        <div className="space-y-2 text-sm">
                            {mode === 'rent' ? (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Monthly Rent × {months} months</span>
                                        <span className="font-medium">${(monthlyRent * months).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Security Deposit</span>
                                        <span className="font-medium">${deposit.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Maintenance Fee × {months} months</span>
                                        <span className="font-medium">${(maintenanceFee * months).toLocaleString()}</span>
                                    </div>
                                    <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between font-bold text-base">
                                        <span>Total</span>
                                        <span className="text-blue-600">
                                            ${((monthlyRent * months) + deposit + (maintenanceFee * months)).toLocaleString()}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Purchase Price</span>
                                        <span className="font-medium">${purchasePrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">First Year Maintenance</span>
                                        <span className="font-medium">${(maintenanceFee * 12).toLocaleString()}</span>
                                    </div>
                                    <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between font-bold text-base">
                                        <span>Total</span>
                                        <span className="text-green-600">
                                            ${(purchasePrice + (maintenanceFee * 12)).toLocaleString()}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddToCart}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Adding...
                                </span>
                            ) : (
                                'Add to Cart'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddToCartModal;

import React from 'react';
import { Home, Calendar, DollarSign } from 'lucide-react';

const OrderSummary = ({ cartItems = [] }) => {
    const selectedItems = cartItems.filter(item => item.selected);

    const calculateTotals = () => {
        let rentTotal = 0;
        let buyTotal = 0;
        let depositTotal = 0;
        let maintenanceTotal = 0;

        selectedItems.forEach(item => {
            const price = parseFloat(item.priceSnapshot) || 0;
            const deposit = parseFloat(item.depositSnapshot) || 0;
            const maintenance = parseFloat(item.maintenanceFeeSnapshot) || 0;

            if (item.mode === 'rent') {
                rentTotal += price * item.months;
                depositTotal += deposit;
                maintenanceTotal += maintenance * item.months;
            } else {
                buyTotal += price;
                maintenanceTotal += maintenance * 12; // 1 year maintenance for purchase
            }
        });

        const subtotal = rentTotal + buyTotal + depositTotal + maintenanceTotal;
        const tax = subtotal * 0.1;
        const total = subtotal + tax;

        return {
            rentTotal,
            buyTotal,
            depositTotal,
            maintenanceTotal,
            subtotal,
            tax,
            total
        };
    };

    const totals = calculateTotals();

    if (selectedItems.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <p className="text-gray-500">No items selected</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
                <p className="text-sm text-gray-600 mt-1">
                    {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'} selected
                </p>
            </div>

            {/* Items List */}
            <div className="p-6 border-b border-gray-200 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                    {selectedItems.map((item) => {
                        const apartment = item.apartment || {};
                        const floor = apartment.floor || {};
                        const building = floor.building || {};
                        const block = building.block || {};

                        return (
                            <div key={item.id} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0">
                                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Home className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900">
                                        Apartment {apartment.number}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        {block.name} → {building.name} → Floor {floor.number}
                                    </p>
                                    <div className="flex items-center mt-2 text-sm">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${item.mode === 'rent'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-green-100 text-green-800'
                                            }`}>
                                            {item.mode === 'rent' ? 'RENT' : 'BUY'}
                                        </span>
                                        {item.mode === 'rent' && (
                                            <span className="ml-2 flex items-center text-gray-600">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                {item.months} months
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-shrink-0 text-right">
                                    <p className="font-bold text-gray-900">
                                        ${parseFloat(item.priceSnapshot).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        {item.mode === 'rent' ? '/month' : 'total'}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-6 space-y-3">
                {totals.rentTotal > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Rent Total</span>
                        <span className="font-medium text-gray-900">
                            ${totals.rentTotal.toLocaleString()}
                        </span>
                    </div>
                )}

                {totals.buyTotal > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Purchase Total</span>
                        <span className="font-medium text-gray-900">
                            ${totals.buyTotal.toLocaleString()}
                        </span>
                    </div>
                )}

                {totals.depositTotal > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Security Deposit</span>
                        <span className="font-medium text-gray-900">
                            ${totals.depositTotal.toLocaleString()}
                        </span>
                    </div>
                )}

                {totals.maintenanceTotal > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Maintenance Fees</span>
                        <span className="font-medium text-gray-900">
                            ${totals.maintenanceTotal.toLocaleString()}
                        </span>
                    </div>
                )}

                <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium text-gray-900">
                            ${totals.subtotal.toLocaleString()}
                        </span>
                    </div>
                </div>

                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (10%)</span>
                    <span className="font-medium text-gray-900">
                        ${totals.tax.toLocaleString()}
                    </span>
                </div>

                <div className="border-t-2 border-gray-300 pt-3">
                    <div className="flex justify-between">
                        <span className="text-lg font-bold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-blue-600">
                            ${totals.total.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Info Message */}
            <div className="p-6 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                <div className="flex items-start space-x-2">
                    <DollarSign className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">
                        By proceeding with checkout, you agree to our terms and conditions.
                        A confirmation email will be sent to your registered address.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;

import React from 'react';
import { CreditCard, Building2, Banknote } from 'lucide-react';

const PaymentMethodSelector = ({ selectedMethod, onMethodChange }) => {
    const paymentMethods = [
        {
            id: 'credit_card',
            name: 'Credit Card',
            description: 'Pay securely with your credit or debit card',
            icon: CreditCard,
            color: 'blue'
        },
        {
            id: 'bank_transfer',
            name: 'Bank Transfer',
            description: 'Direct transfer from your bank account',
            icon: Building2,
            color: 'green'
        },
        {
            id: 'cash',
            name: 'Cash Payment',
            description: 'Pay in cash at our office',
            icon: Banknote,
            color: 'orange'
        }
    ];

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    const isSelected = selectedMethod === method.id;

                    return (
                        <button
                            key={method.id}
                            onClick={() => onMethodChange(method.id)}
                            className={`relative p-6 border-2 rounded-lg text-left transition-all ${isSelected
                                    ? `border-${method.color}-600 bg-${method.color}-50`
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                        >
                            <div className="flex items-start">
                                <div className={`p-3 rounded-lg ${isSelected ? `bg-${method.color}-600` : 'bg-gray-100'
                                    }`}>
                                    <Icon className={`h-6 w-6 ${isSelected ? 'text-white' : 'text-gray-600'
                                        }`} />
                                </div>
                                <div className="ml-4 flex-1">
                                    <h4 className={`font-semibold mb-1 ${isSelected ? `text-${method.color}-900` : 'text-gray-900'
                                        }`}>
                                        {method.name}
                                    </h4>
                                    <p className="text-sm text-gray-600">{method.description}</p>
                                </div>
                            </div>

                            {/* Selected indicator */}
                            {isSelected && (
                                <div className="absolute top-4 right-4">
                                    <div className={`w-6 h-6 rounded-full bg-${method.color}-600 flex items-center justify-center`}>
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Additional payment details based on selected method */}
            {selectedMethod === 'credit_card' && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-3">Credit Card Details</h4>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Card Number
                            </label>
                            <input
                                type="text"
                                placeholder="1234 5678 9012 3456"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Expiry Date
                                </label>
                                <input
                                    type="text"
                                    placeholder="MM/YY"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    CVV
                                </label>
                                <input
                                    type="text"
                                    placeholder="123"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {selectedMethod === 'bank_transfer' && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-3">Bank Transfer Instructions</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                        <p><strong>Bank Name:</strong> Building Management Bank</p>
                        <p><strong>Account Number:</strong> 1234567890</p>
                        <p><strong>Account Name:</strong> Building Management Co.</p>
                        <p><strong>Reference:</strong> Use your order number as reference</p>
                        <p className="text-green-700 font-medium mt-3">
                            ⚠️ Please complete the transfer within 24 hours to confirm your order.
                        </p>
                    </div>
                </div>
            )}

            {selectedMethod === 'cash' && (
                <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-3">Cash Payment Details</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                        <p><strong>Office Address:</strong> 123 Building Management Street</p>
                        <p><strong>Office Hours:</strong> Monday - Friday, 9:00 AM - 5:00 PM</p>
                        <p><strong>Contact:</strong> +1 234 567 8900</p>
                        <p className="text-orange-700 font-medium mt-3">
                            ⚠️ Please bring your order confirmation when visiting our office.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentMethodSelector;

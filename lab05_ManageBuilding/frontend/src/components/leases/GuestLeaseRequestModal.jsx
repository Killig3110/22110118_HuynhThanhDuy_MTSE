import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { leaseAPI } from '../../services/api';
import { X, Mail, Phone, User as UserIcon, MessageSquare } from 'lucide-react';

const GuestLeaseRequestModal = ({ isOpen, onClose, apartment }) => {
    const [formData, setFormData] = useState({
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        type: 'rent',
        note: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    if (!isOpen || !apartment) return null;

    const validateForm = () => {
        const newErrors = {};

        if (!formData.contactName || formData.contactName.trim().length < 2) {
            newErrors.contactName = 'Please enter your full name (at least 2 characters)';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.contactEmail || !emailRegex.test(formData.contactEmail)) {
            newErrors.contactEmail = 'Please enter a valid email address';
        }

        const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
        if (!formData.contactPhone || !phoneRegex.test(formData.contactPhone)) {
            newErrors.contactPhone = 'Please enter a valid phone number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the validation errors');
            return;
        }

        try {
            setLoading(true);

            const payload = {
                apartmentId: apartment.id,
                type: formData.type,
                contactName: formData.contactName.trim(),
                contactEmail: formData.contactEmail.trim(),
                contactPhone: formData.contactPhone.trim(),
                note: formData.note.trim() || null,
                monthlyRent: formData.type === 'rent' ? apartment.monthlyRent : null,
                totalPrice: formData.type === 'buy' ? apartment.price : null
            };

            const { data } = await leaseAPI.create(payload);

            toast.success(
                <div>
                    <p className="font-semibold">Request Submitted Successfully!</p>
                    <p className="text-sm">We'll contact you at {formData.contactEmail}</p>
                </div>,
                { duration: 5000 }
            );

            // Reset form
            setFormData({
                contactName: '',
                contactEmail: '',
                contactPhone: '',
                type: 'rent',
                note: ''
            });

            onClose();
        } catch (error) {
            console.error('Failed to submit request:', error);
            toast.error(
                error.response?.data?.message ||
                error.response?.data?.error?.message ||
                'Failed to submit request. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Request Apartment
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Apartment {apartment.apartmentNumber} - {apartment.type}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="space-y-4">
                            {/* Request Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Request Type *
                                </label>
                                <div className="flex space-x-4">
                                    {apartment.isListedForRent && (
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="rent"
                                                checked={formData.type === 'rent'}
                                                onChange={handleChange}
                                                className="mr-2"
                                            />
                                            <span>Rent (${apartment.monthlyRent?.toLocaleString()}/mo)</span>
                                        </label>
                                    )}
                                    {apartment.isListedForSale && (
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="buy"
                                                checked={formData.type === 'buy'}
                                                onChange={handleChange}
                                                className="mr-2"
                                            />
                                            <span>Buy (${apartment.price?.toLocaleString()})</span>
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Contact Name */}
                            <div>
                                <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name *
                                </label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        id="contactName"
                                        name="contactName"
                                        value={formData.contactName}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.contactName ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="John Doe"
                                    />
                                </div>
                                {errors.contactName && (
                                    <p className="mt-1 text-sm text-red-600">{errors.contactName}</p>
                                )}
                            </div>

                            {/* Contact Email */}
                            <div>
                                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address *
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="email"
                                        id="contactEmail"
                                        name="contactEmail"
                                        value={formData.contactEmail}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.contactEmail ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="john@example.com"
                                    />
                                </div>
                                {errors.contactEmail && (
                                    <p className="mt-1 text-sm text-red-600">{errors.contactEmail}</p>
                                )}
                            </div>

                            {/* Contact Phone */}
                            <div>
                                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number *
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="tel"
                                        id="contactPhone"
                                        name="contactPhone"
                                        value={formData.contactPhone}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.contactPhone ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="+1 (234) 567-8900"
                                    />
                                </div>
                                {errors.contactPhone && (
                                    <p className="mt-1 text-sm text-red-600">{errors.contactPhone}</p>
                                )}
                            </div>

                            {/* Note */}
                            <div>
                                <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                                    Additional Message (Optional)
                                </label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <textarea
                                        id="note"
                                        name="note"
                                        value={formData.note}
                                        onChange={handleChange}
                                        rows="4"
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Any special requirements or questions..."
                                        maxLength="500"
                                    />
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                    {formData.note.length}/500 characters
                                </p>
                            </div>

                            {/* Info Box */}
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• You'll receive a confirmation email</li>
                                    <li>• Our team will review your request</li>
                                    <li>• We'll contact you within 24-48 hours</li>
                                    <li>• You can track your request status via email</li>
                                </ul>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Request'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default GuestLeaseRequestModal;

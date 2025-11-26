import React from 'react';
import { XMarkIcon, HomeIcon } from '@heroicons/react/24/outline';

const ApartmentDetailsModal = ({ apartment, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className={`p-6 text-white ${apartment.status === 'occupied' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                apartment.status === 'vacant' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                    'bg-gradient-to-r from-yellow-500 to-yellow-600'
                }`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Apartment {apartment.apartmentNumber}</h2>
                        <p className="opacity-90">{apartment.type.toUpperCase()} • {apartment.area}m²</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-800 mb-3">Basic Information</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Status:</span>
                                <span className={`font-semibold ${apartment.status === 'occupied' ? 'text-red-600' :
                                    apartment.status === 'vacant' ? 'text-green-600' : 'text-yellow-600'
                                    }`}>
                                    {apartment.status.charAt(0).toUpperCase() + apartment.status.slice(1)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Type:</span>
                                <span className="font-semibold">{apartment.type.toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Area:</span>
                                <span className="font-semibold">{apartment.area} m²</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Bedrooms:</span>
                                <span className="font-semibold">{apartment.bedrooms}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Bathrooms:</span>
                                <span className="font-semibold">{apartment.bathrooms}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-800 mb-3">Features & Amenities</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Balconies:</span>
                                <span className="font-semibold">{apartment.balconies || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Parking Slots:</span>
                                <span className="font-semibold">{apartment.parkingSlots || 0}</span>
                            </div>
                            {apartment.monthlyRent && (
                                <div className="flex justify-between">
                                    <span>Monthly Rent:</span>
                                    <span className="font-semibold text-green-600">
                                        ${apartment.monthlyRent.toLocaleString()}
                                    </span>
                                </div>
                            )}
                            {apartment.maintenanceFee && (
                                <div className="flex justify-between">
                                    <span>Maintenance Fee:</span>
                                    <span className="font-semibold">
                                        ${apartment.maintenanceFee.toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-gray-800 mb-3">Apartment Layout</h3>
                    <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <div className="text-gray-500">
                            <HomeIcon className="w-12 h-12 mx-auto mb-2" />
                            <p>Floor plan visualization</p>
                            <p className="text-sm">Interactive floor plan coming soon</p>
                        </div>
                    </div>
                </div>

                {apartment.status === 'occupied' && apartment.householdMembers && apartment.householdMembers.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-gray-800 mb-3">Household Members</h3>
                        <div className="space-y-2">
                            {apartment.householdMembers.map((member, index) => (
                                <div key={index} className="flex items-center justify-between bg-white rounded p-3">
                                    <div>
                                        <div className="font-medium">{member.firstName} {member.lastName}</div>
                                        <div className="text-sm text-gray-500">{member.relationship}</div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {member.phoneNumber}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                    <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        View Full Details
                    </button>
                    <button className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                        Schedule Visit
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    </div>
);

export default ApartmentDetailsModal;

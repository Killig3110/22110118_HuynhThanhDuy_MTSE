import React, { useState } from 'react';

const ApartmentCard = ({ apartment, onClick, canEdit, onEdit, onDelete, onContextMenu }) => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div
            className={`rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:scale-105 ${apartment.status === 'occupied'
                ? 'bg-gradient-to-r from-red-500 to-pink-600'
                : apartment.status === 'vacant'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                    : 'bg-gradient-to-r from-yellow-500 to-orange-600'
                } text-white relative overflow-hidden`}
            onClick={onClick}
            onContextMenu={(e) => { e.preventDefault(); onContextMenu?.(e, 'apartment', apartment); }}
        >
            {canEdit && (
                <div className="absolute top-2 right-2 z-10">
                    <button
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                        className="px-2 py-1 text-xs bg-white/80 text-gray-800 rounded"
                    >
                        ⋮
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 mt-1 w-36 bg-white text-gray-800 rounded shadow-lg border border-gray-200 text-xs">
                            <button
                                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit?.(apartment); }}
                                className="w-full text-left px-3 py-2 hover:bg-gray-100"
                            >
                                Edit
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete?.(apartment); }}
                                className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100"
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            )}
            <div className="absolute inset-0 opacity-10">
                <div className="w-full h-full bg-gradient-to-br from-white to-transparent"></div>
            </div>
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-bold">{apartment.apartmentNumber}</h4>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${apartment.status === 'occupied' ? 'bg-red-700' :
                        apartment.status === 'vacant' ? 'bg-green-700' : 'bg-yellow-700'
                        }`}>
                        {apartment.status.toUpperCase()}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center bg-white bg-opacity-20 rounded-lg p-2">
                        <div className="text-lg font-bold">{apartment.type.toUpperCase()}</div>
                        <div className="text-xs opacity-80">Type</div>
                    </div>
                    <div className="text-center bg-white bg-opacity-20 rounded-lg p-2">
                        <div className="text-lg font-bold">{apartment.area}m²</div>
                        <div className="text-xs opacity-80">Area</div>
                    </div>
                    <div className="text-center bg-white bg-opacity-20 rounded-lg p-2">
                        <div className="text-lg font-bold">{apartment.bedrooms}</div>
                        <div className="text-xs opacity-80">Bedrooms</div>
                    </div>
                    <div className="text-center bg-white bg-opacity-20 rounded-lg p-2">
                        <div className="text-lg font-bold">{apartment.bathrooms}</div>
                        <div className="text-xs opacity-80">Bathrooms</div>
                    </div>
                </div>
                <div className="space-y-2 text-sm opacity-90">
                    {apartment.balconies > 0 && (
                        <div>🏖️ {apartment.balconies} Balcon{apartment.balconies > 1 ? 'ies' : 'y'}</div>
                    )}
                    {apartment.parkingSlots > 0 && (
                        <div>🚗 {apartment.parkingSlots} Parking Slot{apartment.parkingSlots > 1 ? 's' : ''}</div>
                    )}
                    {apartment.monthlyRent && (
                        <div className="font-semibold">💰 ${apartment.monthlyRent.toLocaleString()}/month</div>
                    )}
                </div>
                <div className="mt-4 text-center text-xs opacity-70">
                    Click for detailed information
                </div>
            </div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-10 rounded-full transform translate-x-8 -translate-y-8"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white opacity-5 rounded-full transform -translate-x-10 translate-y-10"></div>
        </div>
    );
};

export default ApartmentCard;

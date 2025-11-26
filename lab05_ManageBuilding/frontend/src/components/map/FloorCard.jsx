import React, { useState } from 'react';
import { HomeIcon } from '@heroicons/react/24/outline';

const FloorCard = ({ floor, onSelect, canEdit, onEdit, onDelete, onAddApartment }) => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div
            className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl text-center relative"
            onClick={() => onSelect?.(floor)}
        >
            {canEdit && (
                <div className="absolute top-2 right-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                        className="px-2 py-1 text-xs bg-white/70 text-gray-800 rounded"
                    >
                        ⋮
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 mt-1 w-36 bg-white text-gray-800 rounded shadow-lg border border-gray-200 text-xs">
                            <button
                                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onAddApartment?.(floor); }}
                                className="w-full text-left px-3 py-2 hover:bg-gray-100"
                            >
                                Add Apartment
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit?.(floor); }}
                                className="w-full text-left px-3 py-2 hover:bg-gray-100"
                            >
                                Edit
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete?.(floor); }}
                                className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100"
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            )}

            <HomeIcon className="w-8 h-8 mx-auto mb-2" />
            <div className="font-semibold mb-1">Floor {floor.floorNumber}</div>
            <div className="text-sm text-green-100">{floor.totalApartments} units</div>
        </div>
    );
};

export default FloorCard;

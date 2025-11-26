import React, { useState } from 'react';
import { MapIcon, BuildingOfficeIcon, ChevronRightIcon, MapPinIcon } from '@heroicons/react/24/outline';

const BlockCard = ({ block, onSelect, canEdit, onEdit, onDelete, onAddBuilding }) => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden group relative"
            onClick={() => onSelect?.(block)}
        >
            {canEdit && (
                <div className="absolute top-3 right-3 z-20">
                    <button
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                        className="px-2 py-1 text-sm border border-white/60 bg-white/80 rounded hover:bg-white"
                    >
                        ⋮
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded shadow-lg text-sm">
                            <button
                                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onAddBuilding?.(block); }}
                                className="w-full text-left px-3 py-2 hover:bg-gray-100"
                            >
                                Add Building
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit?.(block); }}
                                className="w-full text-left px-3 py-2 hover:bg-gray-100"
                            >
                                Edit
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete?.(block); }}
                                className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100"
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-white opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <MapIcon className="w-10 h-10" />
                        <span className="text-2xl font-bold">{block.blockCode}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{block.name}</h3>
                    <p className="text-blue-100 text-sm opacity-90">{block.description}</p>
                </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center bg-blue-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-blue-600">{block.totalBuildings}</div>
                        <div className="text-xs text-blue-500">Buildings</div>
                    </div>
                    <div className="text-center bg-green-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-green-600">{block.totalBuildings * 20 * 4}</div>
                        <div className="text-xs text-green-500">Est. Units</div>
                    </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{block.location}</span>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Click to explore buildings</span>
                    <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
            </div>
        </div>
    );
};

export default BlockCard;

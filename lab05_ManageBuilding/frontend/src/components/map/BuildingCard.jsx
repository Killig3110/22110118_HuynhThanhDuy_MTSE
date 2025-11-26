import React, { useState } from 'react';
import { BuildingOffice2Icon, ChevronRightIcon } from '@heroicons/react/24/outline';

const BuildingCard = ({ building, onSelect, canEdit, onEdit, onDelete, onAddFloor }) => {
    const buildingImage = `https://picsum.photos/300/200?random=${building.id}&blur=1`;
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden relative"
            onClick={() => onSelect?.(building)}
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
                                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onAddFloor?.(building); }}
                                className="w-full text-left px-3 py-2 hover:bg-gray-100"
                            >
                                Add Floor
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit?.(building); }}
                                className="w-full text-left px-3 py-2 hover:bg-gray-100"
                            >
                                Edit
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete?.(building); }}
                                className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100"
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-400">
                <img
                    src={buildingImage}
                    alt={building.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.src = `data:image/svg+xml;base64,${btoa(`
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200">
                                <rect width="300" height="200" fill="#e5e7eb"/>
                                <rect x="50" y="40" width="200" height="120" fill="#9ca3af" rx="8"/>
                                <rect x="70" y="60" width="30" height="20" fill="#fbbf24"/>
                                <rect x="110" y="60" width="30" height="20" fill="#fbbf24"/>
                                <rect x="150" y="60" width="30" height="20" fill="#fbbf24"/>
                                <rect x="190" y="60" width="30" height="20" fill="#fbbf24"/>
                                <rect x="70" y="90" width="30" height="20" fill="#fbbf24"/>
                                <rect x="110" y="90" width="30" height="20" fill="#fbbf24"/>
                                <rect x="150" y="90" width="30" height="20" fill="#fbbf24"/>
                                <rect x="190" y="90" width="30" height="20" fill="#fbbf24"/>
                                <text x="150" y="130" text-anchor="middle" font-family="Arial" font-size="14" fill="#374151">${building.buildingCode}</text>
                                <text x="150" y="180" text-anchor="middle" font-family="Arial" font-size="12" fill="#6b7280">${building.name}</text>
                            </svg>
                        `)}`;
                    }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>

                <div className="absolute top-3 right-3 bg-white bg-opacity-90 px-3 py-1 rounded-full">
                    <span className="text-sm font-bold text-gray-800">{building.buildingCode}</span>
                </div>
                <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold ${building.status === 'active' ? 'bg-green-500 text-white' :
                    building.status === 'maintenance' ? 'bg-yellow-500 text-white' : 'bg-gray-500 text-white'
                    }`}>
                    {building.status}
                </div>
            </div>

            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{building.name}</h3>

                <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="text-center bg-blue-50 rounded-lg p-2">
                        <div className="text-lg font-bold text-blue-600">{building.totalFloors}</div>
                        <div className="text-xs text-blue-500">Floors</div>
                    </div>
                    <div className="text-center bg-green-50 rounded-lg p-2">
                        <div className="text-lg font-bold text-green-600">{building.totalFloors * 4}</div>
                        <div className="text-xs text-green-500">Units</div>
                    </div>
                    <div className="text-center bg-purple-50 rounded-lg p-2">
                        <div className="text-lg font-bold text-purple-600">{building.constructionYear || 'N/A'}</div>
                        <div className="text-xs text-purple-500">Built</div>
                    </div>
                </div>

                {building.amenities && building.amenities.length > 0 && (
                    <div className="mb-3">
                        <div className="text-xs text-gray-500 mb-1">Amenities:</div>
                        <div className="flex flex-wrap gap-1">
                            {building.amenities.slice(0, 3).map((amenity, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    {amenity}
                                </span>
                            ))}
                            {building.amenities.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    +{building.amenities.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Click to explore floors</span>
                    <ChevronRightIcon className="w-4 h-4" />
                </div>
            </div>
        </div>
    );
};

export default BuildingCard;

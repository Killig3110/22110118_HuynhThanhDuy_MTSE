import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { searchAPI } from '../services/api';
import {
    Search as SearchIcon,
    Loader2,
    Building2,
    Home,
    Layers,
    Users,
    Database
} from 'lucide-react';

const TYPE_OPTIONS = [
    { key: 'blocks', label: 'Blocks', icon: Building2 },
    { key: 'buildings', label: 'Buildings', icon: Home },
    { key: 'floors', label: 'Floors', icon: Layers },
    { key: 'apartments', label: 'Apartments', icon: Home },
    { key: 'residents', label: 'Residents', icon: Users },
];

const emptyResults = {
    blocks: [],
    buildings: [],
    floors: [],
    apartments: [],
    residents: []
};

const SearchPage = () => {
    const [query, setQuery] = useState('');
    const [selectedTypes, setSelectedTypes] = useState(TYPE_OPTIONS.map((o) => o.key));
    const [results, setResults] = useState(emptyResults);
    const [loading, setLoading] = useState(false);

    const activeTypesLabel = useMemo(
        () => TYPE_OPTIONS.filter((o) => selectedTypes.includes(o.key)).map((o) => o.label).join(', '),
        [selectedTypes]
    );

    const toggleType = (key) => {
        setSelectedTypes((prev) =>
            prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]
        );
    };

    const performSearch = async () => {
        if (!query.trim()) {
            setResults(emptyResults);
            return;
        }

        try {
            setLoading(true);
            const params = {
                q: query,
                types: selectedTypes.join(','),
                limit: 6
            };

            const { data } = await searchAPI.searchAll(params);
            setResults({ ...emptyResults, ...data.data });
        } catch (error) {
            console.error('Search failed', error);
            toast.error(error.response?.data?.message || 'Search failed');
        } finally {
            setLoading(false);
        }
    };

    // Debounce query input
    useEffect(() => {
        const handler = setTimeout(() => {
            performSearch();
        }, 350);

        return () => clearTimeout(handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, selectedTypes]);

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Database className="h-6 w-6 text-blue-600" />
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Global Search</h1>
                        <p className="text-sm text-gray-500">
                            Tìm kiếm fuzzy/elastic across blocks, buildings, floors, apartments và residents.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
                    <div className="lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search text</label>
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Ví dụ: S.01, 0201, Trần Thị, block A, vacant..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {loading && (
                                <Loader2 className="h-5 w-5 text-blue-600 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Kết quả hiển thị: {activeTypesLabel || 'Chọn ít nhất 1 loại thực thể'}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mt-1 mb-2">Entities</label>
                        <div className="grid grid-cols-2 gap-2">
                            {TYPE_OPTIONS.map((type) => {
                                const Icon = type.icon;
                                const active = selectedTypes.includes(type.key);
                                return (
                                    <button
                                        key={type.key}
                                        onClick={() => toggleType(type.key)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${active
                                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                                            : 'bg-white border-gray-200 text-gray-700'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {type.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderSection('Blocks', results.blocks, (block) => (
                        <div>
                            <p className="text-sm font-semibold text-gray-900">{block.name}</p>
                            <p className="text-xs text-blue-600">Code: {block.blockCode}</p>
                            <p className="text-xs text-gray-500">{block.location}</p>
                        </div>
                    ))}

                    {renderSection('Buildings', results.buildings, (building) => (
                        <div>
                            <p className="text-sm font-semibold text-gray-900">{building.name}</p>
                            <p className="text-xs text-blue-600">Code: {building.buildingCode}</p>
                            <p className="text-xs text-gray-500">{building.address}</p>
                            {building.block && (
                                <p className="text-[11px] text-gray-500 mt-1">Block: {building.block.blockCode}</p>
                            )}
                        </div>
                    ))}

                    {renderSection('Floors', results.floors, (floor) => (
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Tầng {floor.floorNumber}</p>
                            <p className="text-xs text-gray-600">Tòa: {floor.building?.buildingCode}</p>
                            <p className="text-xs text-gray-500">Căn hộ/tầng: {floor.totalApartments}</p>
                        </div>
                    ))}

                    {renderSection('Apartments', results.apartments, (apt) => (
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Căn {apt.apartmentNumber}</p>
                            <p className="text-xs text-gray-600">
                                Tầng {apt.floor?.floorNumber} • {apt.floor?.building?.buildingCode}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                                {apt.type} • {apt.area} m² • {apt.status}
                            </p>
                        </div>
                    ))}

                    {renderSection('Residents', results.residents, (resident) => (
                        <div>
                            <p className="text-sm font-semibold text-gray-900">
                                {resident.firstName} {resident.lastName}
                            </p>
                            <p className="text-xs text-gray-600">{resident.email}</p>
                            <p className="text-xs text-gray-500">{resident.phone}</p>
                        </div>
                    ))}
                </div>

                {!loading && !query && (
                    <div className="text-center text-sm text-gray-500 mt-6">
                        Nhập từ khóa để bắt đầu tìm kiếm.
                    </div>
                )}
            </div>
        </div>
    );
};

const renderSection = (title, items = [], renderItem) => {
    if (!items || items.length === 0) {
        return (
            <div className="border border-dashed border-gray-200 rounded-lg p-4 text-sm text-gray-400">
                {title}: Không có kết quả
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
                <span className="text-xs text-gray-500">{items.length} kết quả</span>
            </div>
            <div className="space-y-3">
                {items.map((item) => (
                    <div
                        key={`${title}-${item.id}`}
                        className="border border-gray-200 rounded-lg p-3 hover:border-blue-400 transition-colors"
                    >
                        {renderItem(item)}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchPage;

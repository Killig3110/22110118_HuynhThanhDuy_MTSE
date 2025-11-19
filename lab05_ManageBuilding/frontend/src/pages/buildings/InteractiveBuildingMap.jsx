import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
    MapIcon,
    BuildingOfficeIcon,
    BuildingOffice2Icon,
    HomeIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronDownIcon,
    EyeIcon,
    CubeIcon,
    MapPinIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    PhotoIcon,
    XMarkIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import '../../styles/InteractiveBuildingMap.css';

// Add CSS styles for 3D effects
const styles = `
    .perspective-1000 { perspective: 1000px; }
    .transform-style-preserve-3d { transform-style: preserve-3d; }
    .rotate-x-12 { transform: rotateX(12deg); }
    .rotate-y-12 { transform: rotateY(12deg); }
    .rotateX-90 { transform: rotateX(90deg); }
    .rotateY-90 { transform: rotateY(90deg); }
    .translate-z-10 { transform: translateZ(10px); }
    .translate-z-20 { transform: translateZ(20px); }
    
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
    }
    
    .animate-float { animation: float 3s ease-in-out infinite; }
    
    .glass-effect {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
    }
`;

// Inject styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

const InteractiveBuildingMap = () => {
    const [blocks, setBlocks] = useState([]);
    const [selectedBlock, setSelectedBlock] = useState(null);
    const [selectedBuilding, setSelectedBuilding] = useState(null);
    const [selectedFloor, setSelectedFloor] = useState(null);
    const [buildings, setBuildings] = useState([]);
    const [floors, setFloors] = useState([]);
    const [apartments, setApartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('2d'); // '2d', '3d', 'list'
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedApartmentDetails, setSelectedApartmentDetails] = useState(null);

    // Fetch blocks on component mount
    useEffect(() => {
        fetchBlocks();
    }, []);

    const fetchBlocks = async () => {
        try {
            setLoading(true);
            console.log('Fetching blocks...');
            const token = localStorage.getItem('token');

            const response = await fetch('http://localhost:5001/api/blocks', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Blocks response status:', response.status);
            const data = await response.json();
            console.log('Blocks data:', data);

            if (data.success && data.data) {
                setBlocks(data.data);
                console.log('Blocks set successfully:', data.data.length);
            } else {
                console.error('Failed to fetch blocks:', data);
                toast.error('Failed to fetch blocks');
            }
        } catch (error) {
            console.error('Network error while fetching blocks:', error);
            toast.error('Network error while fetching blocks');
        } finally {
            setLoading(false);
        }
    };

    const fetchBuildingsByBlock = async (blockId) => {
        try {
            setLoading(true);
            console.log('Fetching buildings for block:', blockId);
            const token = localStorage.getItem('token');

            const response = await fetch(`http://localhost:5001/api/blocks/${blockId}/buildings`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Buildings response status:', response.status);
            const data = await response.json();
            console.log('Buildings data:', data);

            if (data.success && data.data) {
                setBuildings(data.data);
                console.log('Buildings set successfully:', data.data.length);
            } else {
                console.error('Failed to fetch buildings:', data);
                toast.error('Failed to fetch buildings');
            }
        } catch (error) {
            console.error('Network error while fetching buildings:', error);
            toast.error('Network error while fetching buildings');
        } finally {
            setLoading(false);
        }
    };

    const fetchFloorsByBuilding = async (buildingId) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`http://localhost:5001/api/buildings/${buildingId}/floors`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                setFloors(data.data);
            } else {
                toast.error('Failed to fetch floors');
            }
        } catch (error) {
            toast.error('Network error while fetching floors');
        } finally {
            setLoading(false);
        }
    };

    const fetchApartmentsByFloor = async (floorId) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`http://localhost:5001/api/floors/${floorId}/apartments`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                setApartments(data.data);
            } else {
                toast.error('Failed to fetch apartments');
            }
        } catch (error) {
            toast.error('Network error while fetching apartments');
        } finally {
            setLoading(false);
        }
    };

    const handleBlockSelect = (block) => {
        setSelectedBlock(block);
        setSelectedBuilding(null);
        setSelectedFloor(null);
        setBuildings([]);
        setFloors([]);
        setApartments([]);
        fetchBuildingsByBlock(block.id);
    };

    const handleBuildingSelect = (building) => {
        setSelectedBuilding(building);
        setSelectedFloor(null);
        setFloors([]);
        setApartments([]);
        fetchFloorsByBuilding(building.id);
    };

    const handleFloorSelect = (floor) => {
        setSelectedFloor(floor);
        setApartments([]);
        fetchApartmentsByFloor(floor.id);
    };

    const renderBreadcrumbs = () => (
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <button
                onClick={() => {
                    setSelectedBlock(null);
                    setSelectedBuilding(null);
                    setSelectedFloor(null);
                    setBuildings([]);
                    setFloors([]);
                    setApartments([]);
                }}
                className="text-blue-600 hover:text-blue-800"
            >
                All Blocks
            </button>

            {selectedBlock && (
                <>
                    <ChevronRightIcon className="w-4 h-4" />
                    <button
                        onClick={() => {
                            setSelectedBuilding(null);
                            setSelectedFloor(null);
                            setFloors([]);
                            setApartments([]);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        {selectedBlock.name}
                    </button>
                </>
            )}

            {selectedBuilding && (
                <>
                    <ChevronRightIcon className="w-4 h-4" />
                    <button
                        onClick={() => {
                            setSelectedFloor(null);
                            setApartments([]);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        {selectedBuilding.name}
                    </button>
                </>
            )}

            {selectedFloor && (
                <>
                    <ChevronRightIcon className="w-4 h-4" />
                    <span className="text-gray-800">Floor {selectedFloor.floorNumber}</span>
                </>
            )}
        </div>
    );

    const renderSearchAndFilters = () => (
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search buildings, apartments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                        <XMarkIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center space-x-2 px-3 py-2 border rounded-lg ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    <FunnelIcon className="h-4 w-4" />
                    <span>Filters</span>
                </button>

                <div className="flex rounded-lg border border-gray-300 bg-white">
                    <button
                        onClick={() => setViewMode('2d')}
                        className={`flex items-center space-x-1 px-3 py-2 text-sm rounded-l-lg ${viewMode === '2d'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <MapIcon className="h-4 w-4" />
                        <span>2D</span>
                    </button>
                    <button
                        onClick={() => setViewMode('3d')}
                        className={`flex items-center space-x-1 px-3 py-2 text-sm border-l border-gray-300 ${viewMode === '3d'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <CubeIcon className="h-4 w-4" />
                        <span>3D</span>
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center space-x-1 px-3 py-2 text-sm rounded-r-lg border-l border-gray-300 ${viewMode === 'list'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <PhotoIcon className="h-4 w-4" />
                        <span>List</span>
                    </button>
                </div>
            </div>
        </div>
    );

    const renderFilterPanel = () => showFilters && (
        <div className="bg-white border border-gray-300 rounded-lg p-4 mb-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="occupied">Occupied</option>
                        <option value="vacant">Vacant</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="reserved">Reserved</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Apartment Type</label>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Types</option>
                        <option value="studio">Studio</option>
                        <option value="1bhk">1 BHK</option>
                        <option value="2bhk">2 BHK</option>
                        <option value="3bhk">3 BHK</option>
                        <option value="4bhk">4 BHK</option>
                        <option value="penthouse">Penthouse</option>
                    </select>
                </div>

                <div className="flex items-end">
                    <button
                        onClick={() => {
                            setFilterStatus('all');
                            setFilterType('all');
                            setSearchQuery('');
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <ArrowPathIcon className="h-4 w-4" />
                        <span>Reset</span>
                    </button>
                </div>
            </div>
        </div>
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'occupied': return 'bg-red-500';
            case 'vacant': return 'bg-green-500';
            case 'maintenance': return 'bg-yellow-500';
            default: return 'bg-gray-400';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Interactive Building Management
                    </h1>
                    <p className="text-gray-600">
                        Navigate through blocks, buildings, floors, and apartments with interactive maps
                    </p>
                </div>

                {/* Breadcrumbs */}
                {renderBreadcrumbs()}

                {/* Search and Filters */}
                {(selectedBlock || selectedBuilding || selectedFloor) && renderSearchAndFilters()}
                {renderFilterPanel()}

                {/* Loading Spinner */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {/* Main Content */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {!selectedBlock && (
                        <BlocksView
                            blocks={blocks || []}
                            onBlockSelect={handleBlockSelect}
                            viewMode={viewMode}
                        />
                    )}

                    {selectedBlock && !selectedBuilding && (
                        <BuildingsView
                            buildings={buildings || []}
                            selectedBlock={selectedBlock}
                            onBuildingSelect={handleBuildingSelect}
                            viewMode={viewMode}
                            searchQuery={searchQuery}
                            filterStatus={filterStatus}
                            filterType={filterType}
                        />
                    )}

                    {selectedBuilding && !selectedFloor && (
                        <FloorsView
                            floors={floors || []}
                            selectedBuilding={selectedBuilding}
                            onFloorSelect={handleFloorSelect}
                            viewMode={viewMode}
                            searchQuery={searchQuery}
                            filterStatus={filterStatus}
                            filterType={filterType}
                        />
                    )}

                    {selectedFloor && (
                        <ApartmentsView
                            apartments={apartments || []}
                            selectedFloor={selectedFloor}
                            viewMode={viewMode}
                            searchQuery={searchQuery}
                            filterStatus={filterStatus}
                            filterType={filterType}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

// Enhanced Blocks View Component
const BlocksView = ({ blocks = [], onBlockSelect, viewMode }) => {
    console.log('BlocksView render with blocks:', blocks, 'viewMode:', viewMode);

    if (!blocks || blocks.length === 0) {
        return (
            <div className="p-6 text-center">
                <BuildingOfficeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-600 mb-2">No Blocks Available</h2>
                <p className="text-gray-500">There are no blocks in the system yet.</p>
            </div>
        );
    }

    if (viewMode === 'list') {
        return (
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">Select a Block</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blocks.map(block => (
                        <EnhancedBlockCard key={block.id} block={block} onSelect={onBlockSelect} />
                    ))}
                </div>
            </div>
        );
    }

    if (viewMode === '3d') {
        return (
            <div className="p-6">
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">🏙️ 3D Campus Universe</h2>
                <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-2xl p-8 min-h-[500px] overflow-hidden shadow-2xl">
                    {/* Animated Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-pulse"></div>
                    <div className="absolute inset-0 opacity-30" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='50' cy='50' r='2'/%3E%3Ccircle cx='10' cy='10' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        animation: 'pulse 4s ease-in-out infinite'
                    }}></div>

                    {/* 3D Campus Environment */}
                    <div className="relative z-10 perspective-1500 transform-style-preserve-3d">
                        <div className="relative h-96 transform-gpu transition-all duration-1000 hover:rotate-x-8 hover:rotate-y-8" style={{ transform: 'rotateX(15deg) rotateY(10deg)' }}>
                            {blocks.map((block, index) => {
                                const colors = ['from-blue-400 to-blue-600', 'from-purple-400 to-purple-600', 'from-pink-400 to-pink-600', 'from-green-400 to-green-600', 'from-orange-400 to-orange-600'];
                                const blockColor = colors[index % colors.length];

                                return (
                                    <div
                                        key={block.id}
                                        className="absolute cursor-pointer group"
                                        style={{
                                            left: `${20 + (index * 15)}%`,
                                            top: `${30 + (Math.sin(index * 0.8) * 25)}%`,
                                            transform: `translateZ(${index * 30}px) rotateY(${index * 12}deg)`,
                                            animation: `float 4s ease-in-out infinite`,
                                            animationDelay: `${index * 0.8}s`
                                        }}
                                        onClick={() => onBlockSelect(block)}
                                    >
                                        <div className="relative transform-gpu transition-all duration-500 hover:scale-125 hover:-translate-y-4 hover:rotate-y-12">
                                            {/* Enhanced Shadow with blur */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-black/60 rounded-2xl transform translate-y-6 translate-x-4 scale-110 blur-lg group-hover:scale-125 group-hover:translate-y-8 transition-all duration-500"></div>

                                            {/* Main Block Structure with gradient */}
                                            <div className={`relative bg-gradient-to-br ${blockColor} rounded-2xl shadow-2xl border border-white/20 backdrop-blur-sm overflow-hidden group-hover:shadow-3xl transition-all duration-500`}>
                                                {/* Shine effect */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                                {/* Content */}
                                                <div className="relative z-10 p-6 text-center">
                                                    <div className="bg-white/20 rounded-full p-3 mx-auto mb-3 backdrop-blur-sm">
                                                        <BuildingOfficeIcon className="w-8 h-8 text-white mx-auto" />
                                                    </div>
                                                    <div className="text-sm font-bold text-white mb-1">{block.name}</div>
                                                    <div className="text-xs text-white/80">{block.totalBuildings} buildings</div>

                                                    {/* Glowing border */}
                                                    <div className="absolute inset-0 rounded-2xl border-2 border-white/0 group-hover:border-white/50 transition-all duration-500"></div>
                                                </div>
                                            </div>

                                            {/* Enhanced Floating Info Panel */}
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 scale-95 group-hover:scale-100">
                                                <div className="bg-white/95 backdrop-blur-md text-gray-800 text-sm rounded-xl px-6 py-4 shadow-2xl border border-white/50 min-w-max">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                                        <div className="font-bold text-base">{block.name}</div>
                                                    </div>
                                                    <div className="text-gray-600 mb-2 max-w-48">{block.description}</div>
                                                    <div className="flex items-center gap-2">
                                                        <BuildingOfficeIcon className="w-4 h-4 text-blue-500" />
                                                        <span className="text-blue-600 font-medium">{block.totalBuildings} Buildings</span>
                                                    </div>
                                                    {/* Arrow */}
                                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                                                        <div className="w-0 h-0 border-l-6 border-r-6 border-t-8 border-l-transparent border-r-transparent border-t-white/95"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Enhanced Campus Elements */}
                    <div className="absolute bottom-6 left-4 right-4">
                        {/* Ground plane with grid */}
                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/10 to-transparent rounded-b-2xl border-t border-white/20"></div>

                        {/* Animated Trees and Elements */}
                        <div className="flex justify-between items-end relative z-10">
                            {Array.from({ length: 8 }).map((_, i) => {
                                const isTree = i % 2 === 0;
                                return (
                                    <div key={i} className={`transform transition-all duration-1000 ${isTree ? 'animate-pulse' : ''}`} style={{ animationDelay: `${i * 0.2}s` }}>
                                        {isTree ? (
                                            <div className="relative">
                                                <div className="w-4 h-10 bg-gradient-to-t from-green-400 to-green-600 rounded-full mx-auto shadow-lg"></div>
                                                <div className="w-2 h-6 bg-gradient-to-t from-amber-600 to-amber-400 mx-auto -mt-2 rounded-sm shadow-md"></div>
                                                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-black/20 rounded-full blur-sm"></div>
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <div className="w-3 h-8 bg-gradient-to-t from-blue-400 to-blue-600 rounded-sm mx-auto shadow-lg"></div>
                                                <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-300 rounded-full animate-ping"></div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Enhanced Legend with glassmorphism */}
                    <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-xl">
                        <h4 className="text-sm font-bold mb-3 text-white flex items-center gap-2">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                            3D Campus Control
                        </h4>
                        <div className="space-y-2 text-xs text-white/90">
                            <div className="flex items-center gap-2">
                                <BuildingOfficeIcon className="w-4 h-4 text-cyan-400" />
                                <span>Interactive Blocks</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                <span>Campus Elements</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
                                <span>Infrastructure</span>
                            </div>
                        </div>

                        {/* Control hints */}
                        <div className="mt-3 pt-3 border-t border-white/20 text-xs text-white/70">
                            <div>🖱️ Click to explore</div>
                            <div>🎯 Hover for details</div>
                        </div>
                    </div>

                    {/* Ambient lighting effects */}
                    <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-radial from-blue-400/30 to-transparent rounded-full animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-radial from-purple-400/20 to-transparent rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Campus Map View</h2>
            <div className="relative bg-gradient-to-b from-green-100 to-green-200 rounded-lg p-8 min-h-96">
                {/* Campus Background */}
                <div className="absolute inset-0 opacity-20 bg-cover bg-center rounded-lg"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.1'%3E%3Ccircle cx='50' cy='50' r='4'/%3E%3Ccircle cx='10' cy='10' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}>
                </div>

                {/* Blocks positioned on map */}
                <div className="relative z-10 h-80">
                    {blocks.map((block, index) => (
                        <div
                            key={block.id}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                            style={{
                                left: `${30 + (index * 20)}%`,
                                top: `${40 + (Math.sin(index) * 20)}%`
                            }}
                            onClick={() => onBlockSelect(block)}
                        >
                            <div className="group">
                                <div className="bg-white rounded-lg shadow-lg p-4 border-2 border-blue-500 hover:border-blue-700 transition-all duration-200 transform hover:scale-105">
                                    <BuildingOfficeIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                    <div className="text-sm font-semibold text-center">{block.name}</div>
                                    <div className="text-xs text-gray-500 text-center">{block.totalBuildings} buildings</div>
                                </div>

                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                                        {block.description}
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="absolute bottom-4 right-4 bg-white rounded-lg p-3 shadow-lg">
                    <h4 className="text-sm font-semibold mb-2">Legend</h4>
                    <div className="flex items-center text-xs text-gray-600">
                        <BuildingOfficeIcon className="w-4 h-4 text-blue-600 mr-2" />
                        <span>Block</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Enhanced Block Card Component
const EnhancedBlockCard = ({ block, onSelect }) => (
    <div
        className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden group"
        onClick={() => onSelect(block)}
    >
        {/* Block Header with Gradient */}
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

        {/* Block Content */}
        <div className="p-6">
            {/* Stats Grid */}
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

            {/* Location Info */}
            <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                    <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{block.location}</span>
                </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Click to explore buildings</span>
                <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
        </div>
    </div>
);// Buildings View Component with Enhanced Visuals
const BuildingsView = ({ buildings = [], selectedBlock, onBuildingSelect, viewMode, searchQuery = '', filterStatus = 'all', filterType = 'all' }) => {
    console.log('BuildingsView render with buildings:', buildings, 'selectedBlock:', selectedBlock);

    if (!buildings || buildings.length === 0) {
        return (
            <div className="p-6 text-center">
                <BuildingOffice2Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-600 mb-2">No Buildings Available</h2>
                <p className="text-gray-500">There are no buildings in {selectedBlock?.name || 'this block'} yet.</p>
            </div>
        );
    }

    const filteredBuildings = buildings.filter(building => {
        if (searchQuery) {
            return building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                building.buildingCode.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
    });

    if (viewMode === 'list') {
        return (
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">Buildings in {selectedBlock.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBuildings.map(building => (
                        <EnhancedBuildingCard key={building.id} building={building} onSelect={onBuildingSelect} />
                    ))}
                </div>
            </div>
        );
    }

    if (viewMode === '3d') {
        return (
            <div className="p-6">
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    🏢 Block {selectedBlock.name} - 3D Skyline
                </h2>
                <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-2xl p-8 min-h-[600px] overflow-hidden shadow-2xl">
                    {/* Dynamic Sky Background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-400/20 via-purple-500/10 to-orange-300/20 animate-pulse"></div>
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='0.03'%3E%3Cpath d='M20 20h10v10H20zM40 40h10v10H40zM60 20h10v10H60zM80 40h10v10H80z'/%3E%3C/g%3E%3C/svg%3E")`,
                        animation: 'pulse 8s ease-in-out infinite'
                    }}></div>

                    {/* 3D Cityscape */}
                    <div className="relative z-10 perspective-1500 transform-style-preserve-3d">
                        <div className="relative h-[400px] transform-gpu transition-all duration-1000 hover:rotate-x-5 hover:rotate-y-5" style={{ transform: 'rotateX(10deg) rotateY(5deg)' }}>
                            {filteredBuildings.map((building, index) => {
                                const buildingHeight = Math.max(100, building.totalFloors * 15 + 50);
                                const buildingColors = [
                                    'from-slate-600 to-slate-800',
                                    'from-blue-600 to-blue-800',
                                    'from-indigo-600 to-indigo-800',
                                    'from-purple-600 to-purple-800',
                                    'from-cyan-600 to-cyan-800'
                                ];
                                const colorClass = buildingColors[index % buildingColors.length];

                                return (
                                    <div
                                        key={building.id}
                                        className="absolute cursor-pointer group transform-gpu transition-all duration-500 hover:scale-105 hover:-translate-y-4"
                                        onClick={() => onBuildingSelect(building)}
                                        style={{
                                            left: `${10 + (index % 5) * 18}%`,
                                            bottom: '10%',
                                            transform: `translateZ(${index * 15}px) rotateY(${(index % 3) * 5}deg)`,
                                            height: `${buildingHeight}px`,
                                            width: '60px',
                                            animation: `float 4s ease-in-out infinite`,
                                            animationDelay: `${index * 0.5}s`
                                        }}
                                    >
                                        {/* Enhanced Building Shadow */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/70 rounded-lg transform translate-y-4 translate-x-4 scale-110 blur-md group-hover:scale-125 group-hover:translate-y-6 transition-all duration-500"></div>

                                        {/* Main Building Structure */}
                                        <div className={`relative bg-gradient-to-t ${colorClass} rounded-lg shadow-2xl h-full border border-white/20 overflow-hidden group-hover:shadow-3xl transition-all duration-500`}>
                                            {/* Building Shine Effect */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                            {/* Animated Windows Grid */}
                                            <div className="absolute inset-2 grid grid-cols-2 gap-[2px] z-10">
                                                {Array.from({ length: Math.min(building.totalFloors * 2, 24) }).map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`rounded-sm border border-yellow-400/50 transition-all duration-300 ${Math.random() > 0.3
                                                                ? 'bg-gradient-to-br from-yellow-200 to-yellow-400 shadow-sm'
                                                                : 'bg-gray-700/50'
                                                            }`}
                                                        style={{
                                                            height: '6px',
                                                            animation: Math.random() > 0.7 ? `pulse 2s infinite ${Math.random() * 2}s` : 'none'
                                                        }}
                                                    ></div>
                                                ))}
                                            </div>

                                            {/* Building Info Panel */}
                                            <div className="absolute bottom-2 left-1 right-1 bg-black/80 backdrop-blur-sm rounded text-center py-1 z-20">
                                                <div className="text-xs font-bold text-white">{building.buildingCode}</div>
                                                <div className="text-xs text-cyan-300">{building.totalFloors}F</div>
                                            </div>

                                            {/* Rooftop with antenna */}
                                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                                                <div className="w-full h-3 bg-gradient-to-t from-red-600 to-red-400 rounded-t-lg border border-red-500 shadow-lg"></div>
                                                {/* Antenna */}
                                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-1 h-4 bg-gray-300 rounded-full"></div>
                                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                                            </div>

                                            {/* Glowing border effect */}
                                            <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-cyan-400/50 group-hover:shadow-cyan-400/25 group-hover:shadow-lg transition-all duration-500"></div>
                                        </div>

                                        {/* Enhanced Info Tooltip */}
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0 scale-95 group-hover:scale-100 z-30">
                                            <div className="bg-black/90 backdrop-blur-md text-white text-xs rounded-xl px-4 py-3 shadow-2xl border border-white/20 min-w-max">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                                    <span className="font-bold">{building.name}</span>
                                                </div>
                                                <div className="space-y-1 text-white/80">
                                                    <div>📍 Code: {building.buildingCode}</div>
                                                    <div>🏢 Floors: {building.totalFloors}</div>
                                                    <div>🏠 Status: {building.status}</div>
                                                </div>
                                                {/* Tooltip Arrow */}
                                                <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                                                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent border-t-black/90"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Enhanced Legend Panel */}
                    <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-xl">
                        <h4 className="text-sm font-bold mb-3 text-white flex items-center gap-2">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                            3D Skyline Controls
                        </h4>
                        <div className="space-y-2 text-xs text-white/90">
                            <div className="flex items-center gap-2">
                                <BuildingOffice2Icon className="w-4 h-4 text-cyan-400" />
                                <span>Interactive Buildings</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-400 rounded-sm animate-pulse"></div>
                                <span>Active Windows</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-400 rounded-sm"></div>
                                <span>Rooftop Elements</span>
                            </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-white/20 text-xs text-white/70">
                            <div>🖱️ Click to explore floors</div>
                            <div>🎯 Hover for building info</div>
                            <div>🌃 Dynamic city view</div>
                        </div>
                    </div>

                    {/* City Atmosphere Effects */}
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-yellow-300/20 via-orange-200/10 to-transparent"></div>
                    <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-radial from-cyan-400/20 to-transparent rounded-full animate-pulse"></div>
                    <div className="absolute top-1/3 right-0 w-32 h-32 bg-gradient-radial from-purple-400/15 to-transparent rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Block {selectedBlock.name} - Building Layout</h2>
            <div className="relative bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg p-8 min-h-96">
                {/* Buildings arranged in a grid */}
                <div className="grid grid-cols-5 gap-6 h-80">
                    {filteredBuildings.map((building, index) => (
                        <div
                            key={building.id}
                            className="relative cursor-pointer group"
                            onClick={() => onBuildingSelect(building)}
                        >
                            <div className="bg-white rounded-lg shadow-lg p-4 border-2 border-gray-300 hover:border-indigo-500 transition-all duration-200 transform hover:scale-105 h-full flex flex-col justify-center items-center">
                                <BuildingOffice2Icon className="w-12 h-12 text-indigo-600 mb-2" />
                                <div className="text-sm font-semibold text-center">{building.buildingCode}</div>
                                <div className="text-xs text-gray-500 text-center">{building.totalFloors} floors</div>
                            </div>

                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                                <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                                    {building.name}
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Enhanced Building Card Component with Photos
const EnhancedBuildingCard = ({ building, onSelect }) => {
    const buildingImage = `https://picsum.photos/300/200?random=${building.id}&blur=1`;

    return (
        <div
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden"
            onClick={() => onSelect(building)}
        >
            {/* Building Photo */}
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

                {/* Building Code Badge */}
                <div className="absolute top-3 right-3 bg-white bg-opacity-90 px-3 py-1 rounded-full">
                    <span className="text-sm font-bold text-gray-800">{building.buildingCode}</span>
                </div>

                {/* Status Indicator */}
                <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold ${building.status === 'active' ? 'bg-green-500 text-white' :
                    building.status === 'maintenance' ? 'bg-yellow-500 text-white' :
                        'bg-gray-500 text-white'
                    }`}>
                    {building.status}
                </div>
            </div>

            {/* Building Info */}
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{building.name}</h3>

                {/* Quick Stats */}
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

                {/* Amenities */}
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

// Floors View Component with Enhanced 3D
const FloorsView = ({ floors = [], selectedBuilding, onFloorSelect, viewMode, searchQuery = '', filterStatus = 'all', filterType = 'all' }) => {
    console.log('FloorsView render with floors:', floors, 'selectedBuilding:', selectedBuilding);

    if (!floors || floors.length === 0) {
        return (
            <div className="p-6 text-center">
                <HomeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-600 mb-2">No Floors Available</h2>
                <p className="text-gray-500">There are no floors in {selectedBuilding?.name || 'this building'} yet.</p>
            </div>
        );
    }
    if (viewMode === 'list') {
        return (
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">Floors in {selectedBuilding.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {floors.map(floor => (
                        <FloorCard key={floor.id} floor={floor} onSelect={onFloorSelect} />
                    ))}
                </div>
            </div>
        );
    }

    if (viewMode === '3d') {
        return (
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">{selectedBuilding.name} - 3D Building View</h2>
                <div className="relative bg-gradient-to-b from-slate-900 to-slate-600 rounded-lg p-8 min-h-96 overflow-hidden">
                    {/* 3D Building Cross-section */}
                    <div className="relative flex flex-col-reverse space-y-reverse space-y-1 h-80 justify-center items-center">
                        {floors.map((floor, index) => (
                            <div
                                key={floor.id}
                                className="relative cursor-pointer group w-64"
                                onClick={() => onFloorSelect(floor)}
                                style={{
                                    zIndex: floors.length - index,
                                    transform: `perspective(1000px) rotateX(-10deg) translateZ(${index * 2}px)`,
                                }}
                            >
                                {/* Floor Shadow */}
                                <div className="absolute inset-0 bg-black opacity-30 rounded-lg transform translate-y-1 translate-x-1"></div>

                                {/* Floor Structure */}
                                <div className="relative bg-gradient-to-r from-gray-300 to-gray-100 rounded-lg shadow-lg border-2 border-gray-400 hover:border-blue-500 transition-all duration-200 transform hover:scale-105 p-3">
                                    {/* Floor Pattern */}
                                    <div className="absolute inset-2 grid grid-cols-8 gap-px">
                                        {Array.from({ length: 32 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-2 rounded-sm ${Math.random() > 0.3 ? 'bg-yellow-300 border border-yellow-400' : 'bg-gray-200'
                                                    }`}
                                            ></div>
                                        ))}
                                    </div>

                                    {/* Floor Info Overlay */}
                                    <div className="relative z-10 bg-white bg-opacity-90 rounded p-2 flex items-center justify-between">
                                        <div>
                                            <div className="font-semibold text-gray-800">Floor {floor.floorNumber}</div>
                                            <div className="text-sm text-gray-600">{floor.totalApartments} apartments</div>
                                        </div>
                                        <div className="text-right">
                                            <HomeIcon className="w-6 h-6 text-blue-600 mb-1" />
                                            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </div>

                                    {/* Elevator Shaft */}
                                    <div className="absolute right-1 top-1 bottom-1 w-2 bg-gray-600 rounded-sm">
                                        <div className="w-full h-4 bg-red-400 rounded-sm mt-1"></div>
                                    </div>
                                </div>

                                {/* Hover Glow */}
                                <div className="absolute inset-0 bg-blue-400 opacity-0 group-hover:opacity-20 rounded-lg transition-opacity duration-200"></div>

                                {/* Floor Number Label */}
                                <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 bg-slate-800 text-white px-2 py-1 rounded text-sm font-bold">
                                    {floor.floorNumber}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Building Base */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-72 h-4 bg-gray-800 rounded-lg shadow-xl">
                        <div className="w-full h-2 bg-gray-600 rounded-t-lg"></div>
                    </div>

                    {/* Building Info Panel */}
                    <div className="absolute top-4 right-4 bg-slate-800 bg-opacity-90 text-white rounded-lg p-4 max-w-xs">
                        <h3 className="font-bold mb-2">{selectedBuilding.name}</h3>
                        <div className="text-sm space-y-1">
                            <div>📍 {selectedBuilding.buildingCode}</div>
                            <div>🏢 {floors.length} floors</div>
                            <div>🏠 {floors.reduce((sum, f) => sum + f.totalApartments, 0)} total units</div>
                            <div className="mt-2 text-xs text-gray-300">
                                Click any floor to view apartments
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">{selectedBuilding.name} - Floor Plan</h2>
            <div className="relative bg-gradient-to-b from-slate-100 to-slate-200 rounded-lg p-8">
                {/* 2D Building Side View */}
                <div className="flex flex-col-reverse space-y-reverse space-y-2 max-h-96 overflow-y-auto">
                    {floors.map((floor, index) => (
                        <div
                            key={floor.id}
                            className="relative cursor-pointer group"
                            onClick={() => onFloorSelect(floor)}
                            style={{ zIndex: floors.length - index }}
                        >
                            <div className="bg-white rounded-lg shadow-lg border-2 border-gray-300 hover:border-green-500 transition-all duration-200 transform hover:scale-105 p-4 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-green-100 rounded-lg p-2">
                                        <HomeIcon className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">Floor {floor.floorNumber}</div>
                                        <div className="text-sm text-gray-500">{floor.totalApartments} apartments</div>
                                    </div>
                                </div>
                                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Floor Card Component
const FloorCard = ({ floor, onSelect }) => (
    <div
        className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl text-center"
        onClick={() => onSelect(floor)}
    >
        <HomeIcon className="w-8 h-8 mx-auto mb-2" />
        <div className="font-semibold mb-1">Floor {floor.floorNumber}</div>
        <div className="text-sm text-green-100">{floor.totalApartments} units</div>
    </div>
);

// Enhanced Apartments View Component with Filtering
const ApartmentsView = ({ apartments = [], selectedFloor, viewMode, searchQuery = '', filterStatus = 'all', filterType = 'all' }) => {
    console.log('ApartmentsView render with apartments:', apartments, 'selectedFloor:', selectedFloor);

    if (!apartments || apartments.length === 0) {
        return (
            <div className="p-6 text-center">
                <HomeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-600 mb-2">No Apartments Available</h2>
                <p className="text-gray-500">There are no apartments on {selectedFloor?.name || 'this floor'} yet.</p>
            </div>
        );
    }
    const filteredApartments = apartments.filter(apartment => {
        if (filterStatus !== 'all' && apartment.status !== filterStatus) return false;
        if (filterType !== 'all' && apartment.type !== filterType) return false;
        if (searchQuery) {
            return apartment.apartmentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                apartment.type.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
    });

    const handleApartmentClick = (apartment) => {
        if (viewMode === 'list') {
            setSelectedApartmentDetails(apartment);
        }
    };

    if (viewMode === 'list') {
        return (
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">Apartments on Floor {selectedFloor.floorNumber}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredApartments.map(apartment => (
                        <EnhancedApartmentCard
                            key={apartment.id}
                            apartment={apartment}
                            onClick={() => handleApartmentClick(apartment)}
                        />
                    ))}
                </div>
                {/* Apartment Details Modal */}
                {selectedApartmentDetails && (
                    <ApartmentDetailsModal
                        apartment={selectedApartmentDetails}
                        onClose={() => setSelectedApartmentDetails(null)}
                    />
                )}
            </div>
        );
    }

    if (viewMode === '3d') {
        return (
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">Floor {selectedFloor.floorNumber} - 3D Apartment View</h2>
                <div className="relative bg-gradient-to-br from-indigo-100 to-purple-200 rounded-lg p-8 min-h-96">
                    {/* 3D Apartment Layout */}
                    <div className="grid grid-cols-4 gap-6 h-80 perspective-1000">
                        {filteredApartments.map((apartment, index) => (
                            <div
                                key={apartment.id}
                                className="group cursor-pointer transform transition-all duration-300 hover:scale-110"
                                style={{
                                    transform: `rotateY(${index % 2 === 0 ? '5deg' : '-5deg'}) rotateX(10deg)`,
                                }}
                                onClick={() => handleApartmentClick(apartment)}
                            >
                                {/* Apartment 3D Box */}
                                <div className="relative transform-style-preserve-3d">
                                    {/* Front Face */}
                                    <div className={`relative w-full h-24 rounded-lg shadow-xl border-2 transition-all duration-200 ${apartment.status === 'occupied'
                                        ? 'bg-gradient-to-br from-red-400 to-red-600 border-red-500'
                                        : apartment.status === 'vacant'
                                            ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-500'
                                            : 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-500'
                                        }`}>
                                        {/* Windows */}
                                        <div className="absolute inset-2 grid grid-cols-3 gap-1">
                                            {Array.from({ length: 6 }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="bg-blue-200 opacity-80 rounded-sm border border-blue-300"
                                                ></div>
                                            ))}
                                        </div>

                                        {/* Door */}
                                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-6 bg-amber-700 rounded-t-sm"></div>

                                        {/* Apartment Label */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-bold text-gray-800">
                                                {apartment.apartmentNumber}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Side Face */}
                                    <div className={`absolute top-0 left-full w-4 h-24 transform origin-left rotateY-90 ${apartment.status === 'occupied' ? 'bg-red-500' :
                                        apartment.status === 'vacant' ? 'bg-green-500' : 'bg-yellow-500'
                                        } rounded-r-lg`}></div>

                                    {/* Top Face */}
                                    <div className={`absolute top-0 left-0 w-full h-4 transform origin-top rotateX-90 ${apartment.status === 'occupied' ? 'bg-red-300' :
                                        apartment.status === 'vacant' ? 'bg-green-300' : 'bg-yellow-300'
                                        } rounded-t-lg`}></div>
                                </div>

                                {/* Hover Info */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                                    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                                        <div className="font-semibold">{apartment.apartmentNumber}</div>
                                        <div>{apartment.type} • {apartment.area}m²</div>
                                        <div>Status: {apartment.status}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 3D View Info */}
                    <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg p-3">
                        <h4 className="text-sm font-semibold mb-2">3D Floor Plan</h4>
                        <div className="text-xs text-gray-600 space-y-1">
                            <div>🟢 Vacant • 🔴 Occupied • 🟡 Maintenance</div>
                            <div>Click apartment for details</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Floor {selectedFloor.floorNumber} - Apartment Layout</h2>
            <div className="relative bg-gradient-to-b from-amber-50 to-amber-100 rounded-lg p-8">
                {/* Floor Plan Grid */}
                <div className="grid grid-cols-4 gap-4 max-w-4xl mx-auto">
                    {filteredApartments.map((apartment, index) => (
                        <div
                            key={apartment.id}
                            className="group cursor-pointer"
                            onClick={() => handleApartmentClick(apartment)}
                        >
                            <div className={`rounded-lg p-4 border-2 transition-all duration-200 transform hover:scale-105 ${apartment.status === 'occupied'
                                ? 'bg-red-100 border-red-300 hover:border-red-500'
                                : apartment.status === 'vacant'
                                    ? 'bg-green-100 border-green-300 hover:border-green-500'
                                    : 'bg-yellow-100 border-yellow-300 hover:border-yellow-500'
                                }`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold">{apartment.apartmentNumber}</span>
                                    <div className={`w-3 h-3 rounded-full ${apartment.status === 'occupied' ? 'bg-red-500' :
                                        apartment.status === 'vacant' ? 'bg-green-500' : 'bg-yellow-500'
                                        }`}></div>
                                </div>
                                <div className="text-xs text-gray-600">
                                    {apartment.type} • {apartment.area}m²
                                </div>
                                <div className="text-xs text-gray-500">
                                    {apartment.bedrooms}BR • {apartment.bathrooms}BA
                                </div>
                            </div>

                            {/* Apartment Details Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                                <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                                    <div className="font-semibold">{apartment.apartmentNumber}</div>
                                    <div>Status: {apartment.status}</div>
                                    <div>Rent: ${apartment.monthlyRent?.toLocaleString()}/month</div>
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Status Legend */}
                <div className="mt-8 bg-white rounded-lg p-4 shadow-lg">
                    <h4 className="text-sm font-semibold mb-3">Apartment Status</h4>
                    <div className="flex flex-wrap gap-4 text-xs">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                            <span>Occupied ({filteredApartments.filter(a => a.status === 'occupied').length})</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <span>Vacant ({filteredApartments.filter(a => a.status === 'vacant').length})</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                            <span>Maintenance ({filteredApartments.filter(a => a.status === 'maintenance').length})</span>
                        </div>
                    </div>
                    {filteredApartments.length < apartments.length && (
                        <div className="mt-2 text-xs text-gray-500">
                            Showing {filteredApartments.length} of {apartments.length} apartments
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Enhanced Apartment Card Component
const EnhancedApartmentCard = ({ apartment, onClick }) => (
    <div
        className={`rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:scale-105 ${apartment.status === 'occupied'
            ? 'bg-gradient-to-r from-red-500 to-pink-600'
            : apartment.status === 'vacant'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                : 'bg-gradient-to-r from-yellow-500 to-orange-600'
            } text-white relative overflow-hidden`}
        onClick={onClick}
    >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-gradient-to-br from-white to-transparent"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-bold">{apartment.apartmentNumber}</h4>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${apartment.status === 'occupied' ? 'bg-red-700' :
                    apartment.status === 'vacant' ? 'bg-green-700' : 'bg-yellow-700'
                    }`}>
                    {apartment.status.toUpperCase()}
                </div>
            </div>

            {/* Apartment Details Grid */}
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

            {/* Additional Info */}
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

            {/* Click Indicator */}
            <div className="mt-4 text-center text-xs opacity-70">
                Click for detailed information
            </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-10 rounded-full transform translate-x-8 -translate-y-8"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white opacity-5 rounded-full transform -translate-x-10 translate-y-10"></div>
    </div>
);

// Apartment Details Modal Component
const ApartmentDetailsModal = ({ apartment, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
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

            {/* Modal Content */}
            <div className="p-6">
                {/* Status and Basic Info */}
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

                {/* Floor Plan Preview */}
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

                {/* Household Members (if occupied) */}
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

                {/* Action Buttons */}
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

export default InteractiveBuildingMap;
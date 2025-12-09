import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';

const badgeColor = (status) => {
    switch (status) {
        case 'vacant': return '#10b981';
        case 'for_rent': return '#3b82f6';
        case 'for_sale': return '#8b5cf6';
        case 'occupied': return '#f59e0b';
        case 'under_renovation': return '#ef4444';
        default: return '#6b7280';
    }
};

const formatPrice = (value) => value?.toLocaleString('vi-VN') || '0';

const ApartmentDetailCard = ({
    apartment,
    onAddToCart,
    userRole = 'Guest',
    className = ''
}) => {
    const [selectedMode, setSelectedMode] = useState(apartment?.isListedForRent ? 'rent' : 'buy');
    const [months, setMonths] = useState(apartment?.minLeaseTerm || 6);

    if (!apartment) {
        return (
            <Card title="Apartment Details" className={className}>
                <div style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>
                    No apartment selected
                </div>
            </Card>
        );
    }

    const {
        apartmentNumber,
        type,
        area,
        bedrooms,
        bathrooms,
        balconies,
        parkingSlots,
        monthlyRent,
        salePrice,
        isListedForRent,
        isListedForSale,
        maintenanceFee,
        status,
        description,
        amenities = [],
        floor,
        building,
        block,
        images = []
    } = apartment;

    const canAddToCart = (isListedForRent || isListedForSale) &&
        (status === 'vacant' || status === 'for_rent' || status === 'for_sale');

    const handleAddToCart = () => {
        if (!canAddToCart) return;

        const cartItem = {
            apartmentId: apartment.id,
            code: apartmentNumber,
            title: `${type?.toUpperCase()} Apartment`,
            type,
            area,
            price: selectedMode === 'rent' ? monthlyRent : salePrice,
            mode: selectedMode,
            months: selectedMode === 'rent' ? months : 1,
            status,
            block: block?.blockCode || block?.name,
            building: building?.buildingCode || building?.name,
            floor: floor?.floorNumber ? `Floor ${floor.floorNumber}` : floor?.name,
            bedrooms,
            bathrooms,
            balconies,
            parkingSlots,
            amenities,
            maintenanceFee,
            deposit: selectedMode === 'rent' ? monthlyRent * 2 : 0,
            minLeaseTerm: apartment.minLeaseTerm || 6,
            maxLeaseTerm: apartment.maxLeaseTerm || 36,
            image: images[0]
        };

        onAddToCart?.(cartItem);
    };

    return (
        <Card
            title={`${apartmentNumber} - ${type?.toUpperCase()}`}
            className={`bm-apartment-detail ${className}`}
            actions={
                <span style={{
                    padding: '4px 12px',
                    borderRadius: 999,
                    background: '#f3f4f6',
                    color: badgeColor(status),
                    fontSize: 13,
                    fontWeight: 600,
                    border: `1px solid ${badgeColor(status)}33`
                }}>
                    {status}
                </span>
            }
        >
            {/* Image Gallery */}
            {images.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                    <img
                        src={images[0]}
                        alt={apartmentNumber}
                        style={{
                            width: '100%',
                            height: 240,
                            objectFit: 'cover',
                            borderRadius: 8,
                            border: '1px solid #e5e7eb'
                        }}
                    />
                    {images.length > 1 && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                            {images.slice(1, 5).map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt={`${apartmentNumber}-${idx}`}
                                    style={{
                                        width: 'calc(25% - 6px)',
                                        height: 60,
                                        objectFit: 'cover',
                                        borderRadius: 6,
                                        border: '1px solid #e5e7eb'
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Location Hierarchy */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: 12,
                background: '#f9fafb',
                borderRadius: 8,
                marginBottom: 16,
                fontSize: 14,
                color: '#4b5563'
            }}>
                <span>📍</span>
                <span>{[block?.blockCode || block?.name, building?.buildingCode || building?.name, floor?.floorNumber ? `Floor ${floor.floorNumber}` : floor?.name].filter(Boolean).join(' › ')}</span>
            </div>

            {/* Basic Details */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 16,
                marginBottom: 16
            }}>
                <div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Area</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>{area} m²</div>
                </div>
                <div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Type</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>{type?.toUpperCase()}</div>
                </div>
                <div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Bedrooms</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>🛏️ {bedrooms}</div>
                </div>
                <div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Bathrooms</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>🚿 {bathrooms}</div>
                </div>
                {balconies > 0 && (
                    <div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Balconies</div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>🌅 {balconies}</div>
                    </div>
                )}
                {parkingSlots > 0 && (
                    <div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Parking</div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>🚗 {parkingSlots}</div>
                    </div>
                )}
            </div>

            {/* Description */}
            {description && (
                <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 8 }}>
                        Description
                    </div>
                    <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                        {description}
                    </div>
                </div>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 8 }}>
                        Amenities
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {amenities.map((amenity, idx) => (
                            <span key={idx} style={{
                                padding: '6px 12px',
                                background: '#f3f4f6',
                                color: '#374151',
                                fontSize: 12,
                                borderRadius: 6,
                                border: '1px solid #e5e7eb'
                            }}>
                                {amenity}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Pricing Mode Selection */}
            {(isListedForRent || isListedForSale) && (
                <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 8 }}>
                        Select Mode
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {isListedForRent && (
                            <button
                                onClick={() => setSelectedMode('rent')}
                                style={{
                                    flex: 1,
                                    padding: 12,
                                    background: selectedMode === 'rent' ? '#3b82f6' : '#f3f4f6',
                                    color: selectedMode === 'rent' ? '#fff' : '#6b7280',
                                    border: selectedMode === 'rent' ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                                    borderRadius: 8,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Rent
                            </button>
                        )}
                        {isListedForSale && (
                            <button
                                onClick={() => setSelectedMode('buy')}
                                style={{
                                    flex: 1,
                                    padding: 12,
                                    background: selectedMode === 'buy' ? '#8b5cf6' : '#f3f4f6',
                                    color: selectedMode === 'buy' ? '#fff' : '#6b7280',
                                    border: selectedMode === 'buy' ? '2px solid #8b5cf6' : '1px solid #e5e7eb',
                                    borderRadius: 8,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Buy
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Lease Term (for rent) */}
            {selectedMode === 'rent' && isListedForRent && (
                <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 8 }}>
                        Lease Term: {months} months
                    </div>
                    <input
                        type="range"
                        min={apartment.minLeaseTerm || 6}
                        max={apartment.maxLeaseTerm || 36}
                        value={months}
                        onChange={(e) => setMonths(parseInt(e.target.value))}
                        style={{ width: '100%' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af' }}>
                        <span>{apartment.minLeaseTerm || 6} months</span>
                        <span>{apartment.maxLeaseTerm || 36} months</span>
                    </div>
                </div>
            )}

            {/* Price Breakdown */}
            <div style={{
                padding: 16,
                background: '#f9fafb',
                borderRadius: 8,
                marginBottom: 16
            }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 12 }}>
                    Price Breakdown
                </div>
                {selectedMode === 'rent' && isListedForRent ? (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontSize: 13, color: '#6b7280' }}>Monthly rent:</span>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{formatPrice(monthlyRent)} đ/mo</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontSize: 13, color: '#6b7280' }}>Duration:</span>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{months} months</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontSize: 13, color: '#6b7280' }}>Subtotal:</span>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{formatPrice(monthlyRent * months)} đ</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontSize: 13, color: '#6b7280' }}>Deposit (2 months):</span>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{formatPrice(monthlyRent * 2)} đ</span>
                        </div>
                        {maintenanceFee > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontSize: 13, color: '#6b7280' }}>Maintenance ({months}mo):</span>
                                <span style={{ fontSize: 13, fontWeight: 600 }}>{formatPrice(maintenanceFee * months)} đ</span>
                            </div>
                        )}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: 12,
                            paddingTop: 12,
                            borderTop: '2px solid #e5e7eb'
                        }}>
                            <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Total:</span>
                            <span style={{ fontSize: 15, fontWeight: 700, color: '#059669' }}>
                                {formatPrice(monthlyRent * months + monthlyRent * 2 + maintenanceFee * months)} đ
                            </span>
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontSize: 13, color: '#6b7280' }}>Sale price:</span>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{formatPrice(salePrice)} đ</span>
                        </div>
                        {maintenanceFee > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontSize: 13, color: '#6b7280' }}>Annual maintenance:</span>
                                <span style={{ fontSize: 13, fontWeight: 600 }}>{formatPrice(maintenanceFee * 12)} đ</span>
                            </div>
                        )}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: 12,
                            paddingTop: 12,
                            borderTop: '2px solid #e5e7eb'
                        }}>
                            <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Total:</span>
                            <span style={{ fontSize: 15, fontWeight: 700, color: '#059669' }}>
                                {formatPrice(salePrice + (maintenanceFee * 12))} đ
                            </span>
                        </div>
                    </>
                )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 8 }}>
                <Button
                    variant="primary"
                    fullWidth
                    disabled={!canAddToCart}
                    onClick={handleAddToCart}
                >
                    🛒 Add to Cart
                </Button>
            </div>

            {!canAddToCart && (
                <div style={{
                    marginTop: 12,
                    padding: 12,
                    background: '#fef3c7',
                    border: '1px solid #fde047',
                    borderRadius: 6,
                    fontSize: 12,
                    color: '#92400e',
                    textAlign: 'center'
                }}>
                    ⚠️ This apartment is not available for rent or sale
                </div>
            )}
        </Card>
    );
};

export default ApartmentDetailCard;

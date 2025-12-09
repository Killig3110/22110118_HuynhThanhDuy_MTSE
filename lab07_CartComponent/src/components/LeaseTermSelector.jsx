import React from 'react';

const LeaseTermSelector = ({
    minMonths = 6,
    maxMonths = 36,
    selectedMonths = 12,
    monthlyRent = 0,
    onSelect,
    disabled = false,
    className = ''
}) => {
    const formatPrice = (value) => value?.toLocaleString('vi-VN') || '0';

    const handleChange = (e) => {
        const value = parseInt(e.target.value);
        onSelect?.(value);
    };

    const totalRent = monthlyRent * selectedMonths;
    const deposit = monthlyRent * 2;

    return (
        <div className={`bm-lease-term-selector ${className}`} style={{
            padding: 16,
            background: '#f9fafb',
            borderRadius: 8,
            border: '1px solid #e5e7eb'
        }}>
            <div style={{ marginBottom: 12 }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8
                }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
                        Lease Term
                    </span>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#3b82f6' }}>
                        {selectedMonths} months
                    </span>
                </div>

                <input
                    type="range"
                    min={minMonths}
                    max={maxMonths}
                    value={selectedMonths}
                    onChange={handleChange}
                    disabled={disabled}
                    style={{
                        width: '100%',
                        height: 8,
                        borderRadius: 4,
                        background: disabled ? '#e5e7eb' : '#dbeafe',
                        outline: 'none',
                        cursor: disabled ? 'not-allowed' : 'pointer'
                    }}
                />

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 11,
                    color: '#9ca3af',
                    marginTop: 4
                }}>
                    <span>{minMonths} months</span>
                    <span>{maxMonths} months</span>
                </div>
            </div>

            {/* Quick Selection Buttons */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                {[6, 12, 24, 36].filter(m => m >= minMonths && m <= maxMonths).map(months => (
                    <button
                        key={months}
                        onClick={() => onSelect?.(months)}
                        disabled={disabled}
                        style={{
                            padding: '6px 12px',
                            background: selectedMonths === months ? '#3b82f6' : '#fff',
                            color: selectedMonths === months ? '#fff' : '#6b7280',
                            border: selectedMonths === months ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            opacity: disabled ? 0.5 : 1
                        }}
                    >
                        {months}m
                    </button>
                ))}
            </div>

            {/* Price Calculation */}
            <div style={{
                padding: 12,
                background: '#fff',
                borderRadius: 6,
                border: '1px solid #e5e7eb'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>Monthly rent:</span>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{formatPrice(monthlyRent)} đ</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>Duration:</span>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{selectedMonths} months</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>Rent total:</span>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{formatPrice(totalRent)} đ</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>Deposit (2mo):</span>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{formatPrice(deposit)} đ</span>
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: '1px solid #e5e7eb'
                }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Total:</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>
                        {formatPrice(totalRent + deposit)} đ
                    </span>
                </div>
            </div>

            {/* Info Message */}
            <div style={{
                marginTop: 12,
                padding: 8,
                background: '#dbeafe',
                borderRadius: 6,
                fontSize: 11,
                color: '#1e40af',
                lineHeight: 1.4
            }}>
                💡 Minimum lease term: {minMonths} months. Deposit equals 2 months rent.
            </div>
        </div>
    );
};

export default LeaseTermSelector;

import React from 'react';
import Card from './Card';
import Button from './Button';

const badgeColor = (status) => {
  switch (status) {
    case 'for_rent': return '#10b981';
    case 'for_sale': return '#3b82f6';
    case 'occupied': return '#f59e0b';
    default: return '#6b7280';
  }
};

const formatPrice = (value) => value?.toLocaleString('vi-VN') || '0';

const CartItemCard = ({
  code,
  title,
  type,
  area,
  price,
  mode = 'rent', // 'rent' | 'buy'
  months = 1,
  status = 'for_rent',
  onMonthsChange,
  onRemove,
  note,
  actions,
  image,
  selectable = false,
  selected = false,
  onSelectToggle,
  // NEW: Location hierarchy
  block,
  building,
  floor,
  // NEW: Apartment details
  bedrooms,
  bathrooms,
  balconies,
  parkingSlots,
  // NEW: Amenities
  amenities = [],
  // NEW: Financial details
  maintenanceFee = 0,
  deposit = 0,
  // NEW: Lease terms
  minLeaseTerm = 1,
  maxLeaseTerm = 36
}) => {
  const handleChange = (delta) => {
    const next = Math.max(minLeaseTerm, Math.min(maxLeaseTerm, months + delta));
    onMonthsChange?.(next);
  };

  const totalPrice = mode === 'rent' ? price * months : price;
  const totalDeposit = mode === 'rent' ? deposit : 0;
  const totalMaintenance = mode === 'rent' ? maintenanceFee * months : maintenanceFee * 12;
  const grandTotal = totalPrice + totalDeposit + totalMaintenance;

  return (
    <Card
      title={title || 'Apartment'}
      actions={actions}
      className="bm-cart-card"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div style={{ fontWeight: 600, color: '#111827' }}>
            {mode === 'rent'
              ? `${formatPrice(price)} đ/tháng x ${months} = ${formatPrice(price * months)} đ`
              : `${formatPrice(price)} đ`}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {mode === 'rent' && (
              <>
                <Button variant="secondary" size="sm" onClick={() => handleChange(-1)}>-</Button>
                <div style={{ minWidth: 40, textAlign: 'center', lineHeight: '32px', fontWeight: 600 }}>{months}m</div>
                <Button variant="secondary" size="sm" onClick={() => handleChange(1)}>+</Button>
              </>
            )}
            {onRemove && <Button variant="danger" size="sm" onClick={onRemove}>Remove</Button>}
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontWeight: 600, color: '#111827' }}>{code}</div>
        <span style={{
          padding: '4px 8px',
          borderRadius: 999,
          background: '#f3f4f6',
          color: badgeColor(status),
          fontSize: 12,
          border: `1px solid ${badgeColor(status)}33`
        }}>
          {status}
        </span>
      </div>

      {/* Location Hierarchy */}
      {(block || building || floor) && (
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>📍</span>
          <span>{[block, building, floor].filter(Boolean).join(' › ')}</span>
        </div>
      )}

      {/* Image and basic info */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 12, alignItems: 'flex-start' }}>
        {selectable && (
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelectToggle}
            style={{ marginTop: 4, width: 18, height: 18, cursor: 'pointer' }}
          />
        )}
        {image && (
          <img
            src={image}
            alt={title}
            style={{
              width: 180,
              height: 135,
              objectFit: 'cover',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              flexShrink: 0
            }}
          />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, color: '#4b5563', marginBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>{type?.toUpperCase()}</span>
            <span style={{ margin: '0 8px' }}>•</span>
            <span>{area} m²</span>
          </div>
        </div>
      </div>

      {/* Apartment Details */}
      {(bedrooms || bathrooms || balconies || parkingSlots) && (
        <div style={{ display: 'flex', gap: 20, fontSize: 13, color: '#4b5563', marginTop: 12, marginBottom: 8, flexWrap: 'wrap' }}>
          {bedrooms && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span>🛏️</span><span>{bedrooms} Bedrooms</span></span>}
          {bathrooms && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span>🚿</span><span>{bathrooms} Bathrooms</span></span>}
          {balconies > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span>🌅</span><span>{balconies} Balcony</span></span>}
          {parkingSlots > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span>🚗</span><span>{parkingSlots} Parking</span></span>}
        </div>
      )}

      {/* Amenities */}
      {amenities.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10, marginBottom: 10, flexWrap: 'wrap' }}>
          {amenities.slice(0, 6).map((amenity, idx) => (
            <span key={idx} style={{
              padding: '4px 12px',
              background: '#f3f4f6',
              color: '#4b5563',
              fontSize: 12,
              borderRadius: 6,
              border: '1px solid #e5e7eb',
              fontWeight: 500
            }}>
              {amenity}
            </span>
          ))}
          {amenities.length > 6 && (
            <span style={{ fontSize: 12, color: '#9ca3af', padding: '4px 8px' }}>+{amenities.length - 6} more</span>
          )}
        </div>
      )}

      {/* Financial Breakdown */}
      {(maintenanceFee > 0 || deposit > 0) && (
        <div style={{ marginTop: 14, padding: 12, background: '#f9fafb', borderRadius: 8, fontSize: 13, border: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: '#6b7280' }}>{mode === 'rent' ? 'Monthly rent' : 'Sale price'}:</span>
            <span style={{ fontWeight: 600, color: '#111827' }}>{formatPrice(price)} đ{mode === 'rent' ? '/mo' : ''}</span>
          </div>
          {mode === 'rent' && months > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: '#6b7280' }}>Duration:</span>
              <span style={{ fontWeight: 600 }}>{months} months</span>
            </div>
          )}
          {deposit > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: '#6b7280' }}>Deposit:</span>
              <span style={{ fontWeight: 600 }}>{formatPrice(totalDeposit)} đ</span>
            </div>
          )}
          {maintenanceFee > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: '#6b7280' }}>Maintenance:</span>
              <span style={{ fontWeight: 600 }}>{formatPrice(totalMaintenance)} đ</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: '1px solid #e5e7eb' }}>
            <span style={{ color: '#111827', fontWeight: 600 }}>Total:</span>
            <span style={{ color: '#059669', fontWeight: 700 }}>{formatPrice(grandTotal)} đ</span>
          </div>
        </div>
      )}

      {note && <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>{note}</div>}
    </Card>
  );
};

export default CartItemCard;

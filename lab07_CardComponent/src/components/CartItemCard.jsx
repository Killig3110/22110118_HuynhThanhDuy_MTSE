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
  onSelectToggle
}) => {
  const handleChange = (delta) => {
    const next = Math.max(1, months + delta);
    onMonthsChange?.(next);
  };

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
            <Button variant="danger" size="sm" onClick={onRemove}>Remove</Button>
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
      <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#4b5563', alignItems: 'center' }}>
        {selectable && (
          <input type="checkbox" checked={selected} onChange={onSelectToggle} />
        )}
        {image && (
          <img src={image} alt={title} style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} />
        )}
        <span>{type?.toUpperCase()}</span>
        <span>• {area} m²</span>
      </div>
      {note && <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>{note}</div>}
    </Card>
  );
};

export default CartItemCard;

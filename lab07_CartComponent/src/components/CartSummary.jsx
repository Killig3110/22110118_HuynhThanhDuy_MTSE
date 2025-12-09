import React, { useMemo } from 'react';
import Card from './Card';
import Button from './Button';

const formatPrice = (value) => value?.toLocaleString('vi-VN') || '0';

const CartSummary = ({ items = [], onCheckout, onSelectAll, onClear, className = '' }) => {
  const { rentTotal, buyTotal, selectedCount } = useMemo(() => {
    let rent = 0;
    let buy = 0;
    let count = 0;
    items.forEach((item) => {
      if (item.selected) {
        count += 1;
        if (item.mode === 'rent') rent += (item.price || 0) * (item.months || 1);
        if (item.mode === 'buy') buy += (item.price || 0);
      }
    });
    return { rentTotal: rent, buyTotal: buy, selectedCount: count };
  }, [items]);

  return (
    <Card
      title="Cart Summary"
      className={`bm-cart-summary ${className}`}
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          {onSelectAll && <Button variant="secondary" size="sm" onClick={onSelectAll}>Select all</Button>}
          {onClear && <Button variant="ghost" size="sm" onClick={onClear}>Clear</Button>}
        </div>
      }
    >
      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Items selected</span>
          <strong>{selectedCount}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Rent total</span>
          <strong>{formatPrice(rentTotal)} đ</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Buy total</span>
          <strong>{formatPrice(buyTotal)} đ</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: '1px solid #e5e7eb' }}>
          <span>Grand total</span>
          <strong>{formatPrice(rentTotal + buyTotal)} đ</strong>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <Button
          variant="primary"
          fullWidth
          disabled={selectedCount === 0}
          onClick={onCheckout}
        >
          Checkout {selectedCount > 0 ? `(${selectedCount})` : ''}
        </Button>
      </div>
    </Card>
  );
};

export default CartSummary;

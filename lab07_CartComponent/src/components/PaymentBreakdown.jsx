import React from 'react';
import Card from './Card';

const formatPrice = (value) => value?.toLocaleString('vi-VN') || '0';

const PaymentBreakdown = ({
    items = [],
    showDeposit = true,
    showMaintenance = true,
    showTaxes = false,
    taxRate = 0,
    className = ''
}) => {
    const calculateBreakdown = () => {
        let rentSubtotal = 0;
        let buySubtotal = 0;
        let depositTotal = 0;
        let maintenanceTotal = 0;
        let selectedCount = 0;

        items.forEach(item => {
            if (item.selected) {
                selectedCount++;

                if (item.mode === 'rent') {
                    const rent = (item.price || 0) * (item.months || 1);
                    rentSubtotal += rent;

                    if (showDeposit) {
                        depositTotal += item.deposit || 0;
                    }

                    if (showMaintenance) {
                        maintenanceTotal += (item.maintenanceFee || 0) * (item.months || 1);
                    }
                } else if (item.mode === 'buy') {
                    buySubtotal += item.price || 0;

                    if (showMaintenance) {
                        maintenanceTotal += (item.maintenanceFee || 0) * 12; // Annual maintenance
                    }
                }
            }
        });

        const subtotal = rentSubtotal + buySubtotal;
        const taxes = showTaxes ? subtotal * taxRate : 0;
        const grandTotal = subtotal + depositTotal + maintenanceTotal + taxes;

        return {
            rentSubtotal,
            buySubtotal,
            subtotal,
            depositTotal,
            maintenanceTotal,
            taxes,
            grandTotal,
            selectedCount
        };
    };

    const breakdown = calculateBreakdown();

    if (items.length === 0) {
        return (
            <Card title="Payment Breakdown" className={`bm-payment-breakdown ${className}`}>
                <div style={{ textAlign: 'center', color: '#9ca3af', padding: 24 }}>
                    Your cart is empty
                </div>
            </Card>
        );
    }

    return (
        <Card
            title="Payment Breakdown"
            className={`bm-payment-breakdown ${className}`}
            actions={
                breakdown.selectedCount > 0 && (
                    <span style={{
                        padding: '4px 12px',
                        background: '#dbeafe',
                        color: '#1e40af',
                        fontSize: 12,
                        fontWeight: 600,
                        borderRadius: 999
                    }}>
                        {breakdown.selectedCount} {breakdown.selectedCount === 1 ? 'item' : 'items'}
                    </span>
                )
            }
        >
            {breakdown.selectedCount === 0 ? (
                <div style={{ textAlign: 'center', color: '#9ca3af', padding: 24 }}>
                    No items selected
                </div>
            ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                    {/* Rent Items */}
                    {breakdown.rentSubtotal > 0 && (
                        <div style={{
                            padding: 12,
                            background: '#eff6ff',
                            borderRadius: 8,
                            border: '1px solid #dbeafe'
                        }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e40af', marginBottom: 8 }}>
                                🏠 Rental Items
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 13, color: '#3b82f6' }}>Rent total:</span>
                                <span style={{ fontSize: 14, fontWeight: 600, color: '#1e40af' }}>
                                    {formatPrice(breakdown.rentSubtotal)} đ
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Purchase Items */}
                    {breakdown.buySubtotal > 0 && (
                        <div style={{
                            padding: 12,
                            background: '#f5f3ff',
                            borderRadius: 8,
                            border: '1px solid #e9d5ff'
                        }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#7c3aed', marginBottom: 8 }}>
                                🏢 Purchase Items
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 13, color: '#8b5cf6' }}>Purchase total:</span>
                                <span style={{ fontSize: 14, fontWeight: 600, color: '#7c3aed' }}>
                                    {formatPrice(breakdown.buySubtotal)} đ
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Divider */}
                    <div style={{ borderTop: '1px solid #e5e7eb', margin: '4px 0' }} />

                    {/* Subtotal */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 14, color: '#6b7280' }}>Subtotal:</span>
                        <span style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>
                            {formatPrice(breakdown.subtotal)} đ
                        </span>
                    </div>

                    {/* Deposit */}
                    {showDeposit && breakdown.depositTotal > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 14, color: '#6b7280' }}>
                                Deposit (refundable):
                            </span>
                            <span style={{ fontSize: 15, fontWeight: 600, color: '#3b82f6' }}>
                                {formatPrice(breakdown.depositTotal)} đ
                            </span>
                        </div>
                    )}

                    {/* Maintenance */}
                    {showMaintenance && breakdown.maintenanceTotal > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 14, color: '#6b7280' }}>
                                Maintenance fees:
                            </span>
                            <span style={{ fontSize: 15, fontWeight: 600, color: '#f59e0b' }}>
                                {formatPrice(breakdown.maintenanceTotal)} đ
                            </span>
                        </div>
                    )}

                    {/* Taxes */}
                    {showTaxes && breakdown.taxes > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 14, color: '#6b7280' }}>
                                Taxes ({(taxRate * 100).toFixed(0)}%):
                            </span>
                            <span style={{ fontSize: 15, fontWeight: 600, color: '#ef4444' }}>
                                {formatPrice(breakdown.taxes)} đ
                            </span>
                        </div>
                    )}

                    {/* Grand Total */}
                    <div style={{
                        marginTop: 8,
                        paddingTop: 16,
                        borderTop: '2px solid #e5e7eb',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>
                            Grand Total:
                        </span>
                        <span style={{ fontSize: 20, fontWeight: 700, color: '#059669' }}>
                            {formatPrice(breakdown.grandTotal)} đ
                        </span>
                    </div>

                    {/* Info Messages */}
                    {breakdown.depositTotal > 0 && (
                        <div style={{
                            marginTop: 12,
                            padding: 10,
                            background: '#dbeafe',
                            borderRadius: 6,
                            fontSize: 12,
                            color: '#1e40af',
                            lineHeight: 1.5
                        }}>
                            💡 <strong>Deposit:</strong> Refundable security deposit will be returned at the end of lease term (minus any damages).
                        </div>
                    )}

                    {breakdown.maintenanceTotal > 0 && (
                        <div style={{
                            marginTop: 8,
                            padding: 10,
                            background: '#fef3c7',
                            borderRadius: 6,
                            fontSize: 12,
                            color: '#92400e',
                            lineHeight: 1.5
                        }}>
                            ⚠️ <strong>Maintenance:</strong> Covers building upkeep, security, amenities, and common area expenses.
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
};

export default PaymentBreakdown;

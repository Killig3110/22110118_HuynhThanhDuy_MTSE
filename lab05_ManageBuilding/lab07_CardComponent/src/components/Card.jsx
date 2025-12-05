import React from 'react';

const Card = ({ title, actions, children, footer, style = {}, bodyStyle = {}, className = '' }) => {
  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: 12,
      background: '#fff',
      boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
      overflow: 'hidden',
      transition: 'transform 120ms ease, box-shadow 120ms ease',
      ...style
    }}
      className={`bm-card ${className}`}
    >
      {(title || actions) && (
        <div style={{
          padding: '12px 14px',
          borderBottom: '1px solid #f3f4f6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8
        }}>
          <div style={{ fontWeight: 600, color: '#111827' }}>{title}</div>
          <div>{actions}</div>
        </div>
      )}
      <div style={{ padding: '12px 14px', ...bodyStyle }}>
        {children}
      </div>
      {footer && (
        <div style={{
          borderTop: '1px solid #f3f4f6',
          padding: '10px 14px',
          background: '#f9fafb'
        }}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;

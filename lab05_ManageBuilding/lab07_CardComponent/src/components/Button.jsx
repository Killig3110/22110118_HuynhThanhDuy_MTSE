import React from 'react';

const variants = {
  primary: {
    background: '#2563eb',
    color: '#fff',
    border: '1px solid #2563eb'
  },
  secondary: {
    background: '#e5e7eb',
    color: '#111827',
    border: '1px solid #d1d5db'
  },
  danger: {
    background: '#ef4444',
    color: '#fff',
    border: '1px solid #ef4444'
  },
  ghost: {
    background: 'transparent',
    color: '#111827',
    border: '1px solid #d1d5db'
  }
};

const sizes = {
  sm: { padding: '6px 10px', fontSize: 13 },
  md: { padding: '10px 14px', fontSize: 14 },
  lg: { padding: '12px 16px', fontSize: 15 }
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className = '',
  style = {},
  ...rest
}) => {
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;
  const mergedStyle = {
    ...v,
    padding: s.padding,
    fontSize: s.fontSize,
    borderRadius: 8,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    width: fullWidth ? '100%' : undefined,
    transition: 'all 0.15s ease',
    ...style
  };

  return (
    <button
      {...rest}
      disabled={disabled || loading}
      style={mergedStyle}
      className={`bm-btn ${className}`}
    >
      {loading ? (
        <span className="bm-btn__spinner" />
      ) : (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          {leftIcon && <span className="bm-btn__icon">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="bm-btn__icon">{rightIcon}</span>}
        </span>
      )}
    </button>
  );
};

export default Button;

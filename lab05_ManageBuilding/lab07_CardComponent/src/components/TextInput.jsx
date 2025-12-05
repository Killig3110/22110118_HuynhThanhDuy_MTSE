import React from 'react';

const TextInput = ({ label, error, help, prefix, suffix, className = '', style = {}, inputStyle = {}, ...rest }) => {
  return (
    <div style={{ marginBottom: 12, ...style }} className={`bm-input ${className}`}>
      {label && <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#374151' }}>{label}</label>}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        border: `1px solid ${error ? '#ef4444' : '#d1d5db'}`,
        borderRadius: 8,
        padding: '8px 10px',
        background: '#fff',
        gap: 6
      }}>
        {prefix && <span style={{ fontSize: 13, color: '#6b7280' }}>{prefix}</span>}
        <input
          {...rest}
          style={{
            border: 'none',
            outline: 'none',
            flex: 1,
            fontSize: 14,
            color: '#111827',
            ...inputStyle
          }}
        />
        {suffix && <span style={{ fontSize: 13, color: '#6b7280' }}>{suffix}</span>}
      </div>
      {help && !error && <p style={{ marginTop: 4, fontSize: 12, color: '#6b7280' }}>{help}</p>}
      {error && <p style={{ marginTop: 4, fontSize: 12, color: '#ef4444' }}>{error}</p>}
    </div>
  );
};

export default TextInput;

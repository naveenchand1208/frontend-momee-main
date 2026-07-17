'use client';
import React, { useState, useEffect } from 'react';
import './page.css';

export default function ColorInput({ defaultColor = '#5a03fc', onChange, label = '', required = false}) {
  const [color, setColor] = useState(defaultColor);

  useEffect(() => {
    setColor(defaultColor || '#5a03fc');
  }, [defaultColor]);

  const handleChange = (e) => {
    const selectedColor = e.target.value;
    setColor(selectedColor);
    if (onChange) {
      onChange(selectedColor);
    }
  };

  return (
    <div>
      {label && (
        <label
          htmlFor={name}
          style={{
            fontWeight: 500,
            fontSize: '13px',
            marginBottom: '4px',
          }}
        >
          {label} {required && <span style={{ color: 'red' }}>*</span>}
        </label>
      )}
      <div className="color-input-outside">
        <input
          type="color"
          value={color}
          onChange={handleChange}
          className="styled-color-input cursor"
        />
      </div>
    </div>
  );
}

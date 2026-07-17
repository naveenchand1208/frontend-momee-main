'use client';
import React from 'react';

export default function RadioGroup({
    name,
    options = [],
    selectedValue,
    onChange,
    label = '',
    required = false,
}) {
    return (
        <div style={{ marginTop: '10px' }}>
            {label && (
                <p style={{ fontWeight: '500', fontSize: '14px', marginBottom: '6px' }}>
                    {label} {required && <span style={{ color: 'red' }}>*</span>}
                </p>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {options.map((option) => (
                    <label className='cursor' key={option.value} style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                        <input
                            type="radio"
                            className='cursor'
                            name={name}
                            value={option.value}
                            checked={selectedValue === option.value}
                            onChange={onChange}
                            onClick={(e) => {
                                if (selectedValue === e.target.value) {
                                    onChange(e); // Force trigger
                                }
                            }}
                            required={required}
                            style={{ marginRight: '6px' }}
                        />
                        {option.label}
                    </label>
                ))}
            </div>
        </div>
    );
}

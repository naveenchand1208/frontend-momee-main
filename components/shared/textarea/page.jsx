'use client';
import './page.css';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Textarea({
    iconPath,
    placeholder,
    value,
    onChange,
    name,
    label = '',
    required = false,
    formSubmitted = false,
    disabled = false,
    rows = 8,
}) {
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        if (!value) {
            setTouched(false);
        }
    }, [value]);

    const hasError = required && !value && (touched || formSubmitted);

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {label !== '' && (
                <label
                    className='common-cursor'
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

            <div
                className="input-wrapper"
                style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <textarea
                    id={name}
                    name={name}
                    value={value}
                    placeholder={placeholder}
                    onChange={onChange}
                    disabled={disabled}
                    onBlur={() => setTouched(true)}
                    rows={rows}
                    style={{
                        width: '100%',
                        border: hasError ? '1px solid red' : '2px solid #DBDBDB',
                        borderRadius: '5px',
                        padding: '10px',
                        boxSizing: 'border-box',
                        fontSize: '14px',
                        resize: 'vertical',
                    }}
                />
                {iconPath && (
                    <div style={{ position: 'absolute', right: '10px', top: '10px' }}>
                        <Image src={iconPath} alt="icon" width={20} height={20} />
                    </div>
                )}
            </div>

            {required && (
                <div style={{ height: '16px' }}>
                    {hasError && (
                        <span style={{ color: 'red', fontSize: '12px' }}>
                            {label.split('(')?.[0] || name} required
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

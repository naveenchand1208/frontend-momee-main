'use client';
import './page.css';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Input({
    iconPath,
    placeholder,
    type = 'text',
    value,
    onChange,
    name,
    label = '',
    required = false,
    formSubmitted = false,
    disabled = false,
    commonFilter = false,
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
                <input
                    id={name}
                    type={type}
                    name={name}
                    value={value}
                    placeholder={placeholder}
                    onChange={onChange}
                    disabled={disabled}
                    onBlur={() => setTouched(true)}
                    style={{
                        height: commonFilter ? '30px' : '40px', // Proper height
                        width: '100%',
                        border: hasError ? '1px solid red' : '2px solid #DBDBDB',
                        borderRadius: '5px',
                        paddingLeft: '10px',
                        paddingRight: iconPath ? '35px' : '10px',
                        boxSizing: 'border-box',
                        fontSize: commonFilter ? '12px' : '14px',
                    }}
                />
                {iconPath && (
                    <div style={{ position: 'absolute', right: '10px' }}>
                        <Image src={iconPath} alt="icon" width={20} height={20} />
                    </div>
                )}
                {commonFilter && (
                    <div style={{ position: 'absolute', right: '10px' }}>
                        <Image src={'/assets/icons/search-icon.svg'} alt="icon" width={14} height={14} />
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

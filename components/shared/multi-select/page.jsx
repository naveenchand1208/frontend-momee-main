'use client';

import { useState, useEffect, useRef } from 'react';

export default function MultiSelectDropdown({
    options = [],
    label = '',
    placeholder = '',
    required = false,
    onErrorChange,
    formSubmitted = false,
    disabled = false,
    labelKey = 'label',
    value = [], // initial selected items
    onChange,
}) {
    const [search, setSearch] = useState('');
    const [filtered, setFiltered] = useState([]);
    const [showList, setShowList] = useState(false);
    const [touched, setTouched] = useState(false);
    const [selected, setSelected] = useState([]);
    const [dropdownDirection, setDropdownDirection] = useState('down');
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);
    // Set selected values from parent
    useEffect(() => {
        if (Array.isArray(value)) {
            const matched = value.map(v => {
                if (typeof v === 'object') return v;
                return options.find(opt => opt.value === v || opt[labelKey] === v);
            }).filter(Boolean);
            setSelected(matched);
        }
    }, [value, options, labelKey]);

    // Mark touched on form submit
    useEffect(() => {
        if (formSubmitted) {
            setTouched(true);
        }
    }, [formSubmitted]);

    // Filter options based on search
    // useEffect(() => {
    //     const safeSearch = search ?? '';
    //     setFiltered(
    //         safeSearch.trim() === ''
    //             ? options.filter(opt => !selected.some(sel => sel.value === opt.value))
    //             : options.filter(
    //                 item =>
    //                     item[labelKey]?.toLowerCase().includes(safeSearch.toLowerCase()) &&
    //                     !selected.some(sel => sel.value === item.value)
    //             )
    //     );
    // }, [search, options, selected, labelKey]);

    useEffect(() => {
        const term = (search ?? '').trim().toLowerCase();

        const filteredOptions = options.filter(item => {
            const isAlreadySelected = selected.some(sel => sel.value === item.value);
            const matchesSearch = item[labelKey]?.toLowerCase().includes(term);

            return matchesSearch && !isAlreadySelected;
        });

        setFiltered(filteredOptions);
    }, [search, options, selected, labelKey]);




    // Handle outside click
    useEffect(() => {
        const handleClickOutside = e => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setShowList(false);
                setDropdownDirection("down");
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Show error if required + touched/submitted + no selection + dropdown closed
    const hasError = required && (touched || formSubmitted) && selected.length === 0 && !showList;

    useEffect(() => {
        onErrorChange?.(hasError);
    }, [hasError, onErrorChange]);

    // Check dropdown direction on input focus
    const checkDropdownDirection = () => {
        const rect = wrapperRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const estimatedHeight = Math.min(filtered.length * 40, 180);
        setDropdownDirection(spaceBelow < estimatedHeight + 40 ? 'up' : 'down');
    };

    const handleSelect = (item) => {
        const updated = [...selected, item];
        setSelected(updated);
        onChange?.(updated);
        setSearch('');
        setShowList(false);
        setDropdownDirection("down");
        inputRef.current?.blur();
    };

    const handleRemove = (val) => {
        const updated = selected.filter(item => item.value !== val);
        setSelected(updated);
        onChange?.(updated);
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
            {label && (
                <label style={{ fontWeight: 500, fontSize: '13px', marginBottom: '4px' }}>
                    {label} {required && <span style={{ color: 'red' }}>*</span>}
                </label>
            )}

            {/* Input */}
            <input
                ref={inputRef}
                type="text"
                disabled={disabled}
                value={search}
                placeholder={placeholder}
                onChange={e => {
                    setSearch(e.target.value);
                    setShowList(true);
                }}
                onFocus={() => {
                    setShowList(true);
                    checkDropdownDirection();
                }}
                onBlur={() => {
                    setTimeout(() => setTouched(true), 100);
                }}
                style={{
                    height: '40px',
                    padding: '8px',
                    border: hasError ? '1px solid red' : '2px solid #DBDBDB',
                    borderRadius: '5px',
                    fontSize: '14px',
                    width: '100%',
                    boxSizing: 'border-box',
                }}
            />

            {/* Error shown below dropdown ONLY when dropdown is closed */}
            {!showList && hasError && (
                <div style={{ marginTop: '4px' }}>
                    <span style={{ color: 'red', fontSize: '12px' }}>
                        {label || 'Field'} required
                    </span>
                </div>
            )}

            {/* Selected pills below input */}
            {!hasError && !showList && (
                <div
                    style={{
                        marginTop: '6px',
                        maxHeight: '80px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px',
                    }}
                >
                    {selected.map(item => (
                        <div
                            key={item.value}
                            style={{
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                borderRadius: '5px',
                                padding: '4px 10px',
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: '13px',
                            }}
                        >
                            <span>{item[labelKey]}</span>
                            <span
                                className='cursor'
                                onClick={() => handleRemove(item.value)}
                                style={{
                                    marginLeft: '8px',
                                    fontWeight: 'bold',
                                    // fontSize: '12px'
                                }}
                            >
                                ×
                            </span>
                        </div>
                    ))}
                </div>
            )}
            {/* Dropdown list */}
            {showList && (
                <ul
                    style={{
                        // position: 'absolute',
                        [dropdownDirection === 'down' ? 'top' : 'bottom']: 'calc(100% - 1px)',
                        left: 0,
                        right: 0,
                        background: '#fff',
                        border: '1px solid #ccc',
                        maxHeight: '180px',
                        overflowY: 'auto',
                        zIndex: 10,
                        marginTop: '1px',
                        padding: 0,
                        listStyle: 'none',
                    }}
                >
                    {filtered.length > 0 ? (
                        filtered.map((item, index) => (
                            <li
                                key={index}
                                onMouseDown={e => e.preventDefault()}
                                onClick={() => handleSelect(item)}
                                style={{
                                    padding: '8px',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid #eee',
                                }}
                            >
                                {item[labelKey]}
                            </li>
                        ))
                    ) : (
                        <li style={{ padding: '8px', color: '#888' }}>No options found</li>
                    )}
                </ul>
            )}
        </div>
    );
}

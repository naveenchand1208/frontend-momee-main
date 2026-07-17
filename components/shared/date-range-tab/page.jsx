'use client';
import React, { useState, useRef, useEffect } from 'react';
import '../tab-group/page.css';
import CustomCalendarInput from '../date-range/page';

const defaultOptions = ['7D', 'Custom'];
const moreOptions = ['7D', '15D', '1M', '3M', '6M', '1Y'];

const DateTabGroup = ({ onChange }) => {
    const wrapperRef = useRef(null);
    const [selected, setSelected] = useState('7D');
    const [customDateRange, setCustomDateRange] = useState({ fromDate: '', toDate: '' });
    const [showMoreOptions, setShowMoreOptions] = useState(false);
    const [moreSelected, setMoreSelected] = useState('');
    const [showCustom, setShowCustom] = useState(false);
    const handleClick = (label) => {
        if (label === '7D') {
            if (moreSelected) {
                setShowMoreOptions((prev) => !prev);
            } else if (selected === '7D') {
                setShowMoreOptions((prev) => !prev);
            } else {
                setSelected('7D');
                setCustomDateRange({ fromDate: '', toDate: '' });
                setMoreSelected('');
                setShowMoreOptions(false);
                onChange?.({ type: '7D' });
            }
            return;
        }

        // For Custom or other fixed options
        setSelected(label);
        setMoreSelected('');
        setShowMoreOptions(false);

        if (label === 'Custom') {
            setCustomDateRange({ fromDate: '', toDate: '' });
            setShowCustom(true);
            onChange?.({ type: 'Custom', fromDate: '', toDate: '' });
        } else {
            onChange?.({ type: label });
        }
    };
    const handleCustomSubmit = ({ fromDate, toDate }) => {
        if (!fromDate || !toDate) return;
        onChange?.({ type: 'Custom', fromDate, toDate });
    };
    const handleMoreOptionClick = (option) => {
        setMoreSelected(option);
        setSelected(option);
        setShowMoreOptions(false);
        onChange?.({ type: option });
    };
    const handleClearMore = () => {
        setMoreSelected('');
        setSelected('7D');
        setShowMoreOptions(false);
        onChange?.({ type: '7D' });

    };
    const handleDateChange = ({ fromDate, toDate }) => {
        // const updated = { fromDate, toDate };
        // setCustomDateRange(updated);
        // onChange?.({ type: 'Custom', ...updated });
        setCustomDateRange({ fromDate, toDate });

    };
    const getLabel = (label) => {
        if (label === '7D') {
            return moreSelected || '7D';
        }
        return label;
    };
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowMoreOptions(false);
                setShowCustom(false);
                // if (selected === 'Custom') {
                //     setSelected('7D');
                //     onChange?.({ type: '7D' });
                // }

            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [selected]);
    return (
        <div ref={wrapperRef} className="status-tab-group-wrapper relative">
            <div className="status-tab-group">
                {defaultOptions.map((label) => (
                    <button
                        key={label}
                        className={`status-tab ${selected === label || (moreSelected && label === '7D') ? 'selected' : ''}`}
                        onClick={() => handleClick(label)}
                    >
                        {getLabel(label)}
                    </button>
                ))}
            </div>

            {/* More Options Dropdown */}
            {showMoreOptions && (
                <div
                    className="absolute top-full mt-3 z-10 bg-[#CAE0BC] shadow-md rounded w-[70px] text-center text-xs py-1"
                    style={{ marginLeft: '10px' }}
                >
                    {moreOptions.map((opt) => (
                        <div
                            key={opt}
                            onClick={() => handleMoreOptionClick(opt)}
                            className="px-3 py-1 hover:bg-gray-100 cursor-pointer leading-tight"
                        >
                            {opt}
                        </div>
                    ))}
                    <hr className="my-1" />
                    <div
                        onClick={handleClearMore}
                        className="px-3 py-1 text-red-500 hover:bg-gray-100 cursor-pointer text-center leading-tight"
                    >
                        Clear
                    </div>
                </div>
            )}

            {/* Custom Date Picker */}
            {selected === 'Custom' && showCustom && (
                <div className="absolute top-full mt-3 z-10 shadow-lg"
                    style={{
                        marginLeft: '-265px',
                        backgroundColor: '#CAE0BC',
                        padding: '1rem',
                        borderRadius: '10px',
                        minWidth: '300px'
                    }}>
                    <CustomCalendarInput
                        value={customDateRange}
                        onChange={handleDateChange}
                        onSubmit={handleCustomSubmit}
                        isButton={true} />
                </div>

            )}
        </div>
    );
};

export default DateTabGroup;

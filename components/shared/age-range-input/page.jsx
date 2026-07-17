'use client';
import React, { useEffect, useState } from 'react';
import Button from '../button/page';
import '../age-range-input/page.css';
import { showError } from '@/common/toast/toastService';
export default function TinyAgeRangeInput({ value = {}, onChange }) {
    const [fromAge, setFromAge] = useState('');
    const [toAge, setToAge] = useState('');
    const [error, setError] = useState('');
    useEffect(() => {
        setFromAge(value.fromAge || '');
        setToAge(value.toAge || '');
    }, [value]);

    const handleFromChange = (e) => {
        const val = e.target.value.replace(/\D/g, '');
        setFromAge(val);
        setError('');
        // onChange?.({ fromAge: val, toAge });
    };

    const handleToChange = (e) => {
        const val = e.target.value.replace(/\D/g, '');
        setToAge(val);
        setError('');
        // onChange?.({ fromAge, toAge: val });
    };

    const handleSubmit = () => {
        if (!fromAge && toAge) {          // toAge alone is NOT allowed
            showError('FromAge is required');
            return;
        }
        onChange?.({ fromAge, toAge });
    };

    const handleClear = () => {
        setFromAge('');
        setToAge('');
        setError('');
        onChange?.({ fromAge: '', toAge: '' });
    };
    return (
        <div className="tiny-age-range-wrapper">
            <label className="tiny-age-label">Age Range</label>
            <div className="tiny-age-inputs">
                <input
                    type="text"
                    value={fromAge}
                    onChange={handleFromChange}
                    maxLength={2}
                />
                <span className="tiny-separator">to</span>
                <input
                    type="text"
                    value={toAge}
                    onChange={handleToChange}
                    maxLength={2}
                />
                <Button
                    backgroundColor='black'
                    // label='Submit'
                    iconPath={'/assets/icons/checked-tick-icon.svg'}
                    type='button'
                    size='extraSmall'
                    onClick={handleSubmit}
                    disabled={!fromAge || !toAge}
                >
                </Button>
                <div className="relative group inline-block">
                    <Button
                        backgroundColor="black"
                        // label='Clear'
                        iconPath={'/assets/icons/wrong-icon.svg'}
                        type="button"
                        size="extraSmall"
                        onClick={handleClear}
                    >
                    </Button>
                </div>

            </div>
        </div>
    );
}

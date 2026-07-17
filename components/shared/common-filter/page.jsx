'use client';
import './page.css';
import React, { useState, useEffect } from 'react';
import Input from '../input/page';
import AutoCompleteInput from '../autocomplete/page';
import Button from '../button/page';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import DateRangePicker from "@/components/shared/date-range/page";
import DatePicker from '../date/page';
export default function CommonFilter({
    inputFields = [],
    height = '50px',
    fontSize = '13px',
    onSubmit = () => { },
    initialValues = {},
    onclose = () => { },
}) {
    const [formData, setFormData] = useState(
        inputFields.reduce((acc, item) => {
            acc[item.name] = item.value ?? '';
            return acc;
        }, {})
    );

    useEffect(() => {
        if (initialValues && Object.keys(initialValues).length > 0) {
            console.log('initialValues', initialValues)
            setFormData(prev => ({
                ...prev,
                ...initialValues
            }));
        }
    }, [initialValues]);

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        onSubmit(formData);
    };
    const onClose = () => {
        onclose();
    };
    const handleDateChange = (name, { fromDate, toDate }) => {
        setFormData(prev => ({
            ...prev,
            [name]: { fromDate, toDate },
        }));
    };
    const handleClear = () => {
        const clearedData = inputFields.reduce((acc, field) => {
            acc[field.name] = '';
            return acc;
        }, {});
        setFormData(clearedData);
        onSubmit(clearedData);
    };

    return (
        <div className='position-relative'>
            <div>
                <div className='d-flex justify-content-between gap-4 cursor'
                    style={{
                        // borderBottom: '1px solid black'
                    }}
                >
                    <Button
                        label="Clear"
                        type="button"
                        size="extraSmall"
                        color="#fff"
                        backgroundColor="#212529"
                        onClick={handleClear}
                    />
                    <span className='text-dark fs-5'>Filter</span>
                    <Button
                        label="Done"
                        type="button"
                        size="extraSmall"
                        color="#fff"
                        backgroundColor="#209dff"
                        onClick={handleSubmit}
                    />
                </div>
                <div
                    className="px-4 rounded flex flex-column items-center gap-3 p-4 mb-2"
                    style={{ height: 'max-content', zIndex: 1000, background: '' }}
                >

                    {inputFields.map((field, index) => (
                        <div className='shadow'
                            key={index} style={{ width: '100%', height: 'max-content' }}>
                            {field.inputType === 'text' && (
                                <Input
                                    type={field.type || 'text'}
                                    name={field.name}
                                    placeholder={field.placeholder}
                                    label={field.label}
                                    value={formData[field.name] ?? ''}
                                    // commonFilter="true"
                                    onChange={e => handleChange(field.name, e.target.value)}
                                />
                            )}

                            {field.inputType === 'autocomplete' && (
                                <AutoCompleteInput
                                    name={field.name}
                                    label={field.label}
                                    placeholder={field.placeholder}
                                    options={field.options}
                                    value={formData[field.name] ?? ''}
                                    commonFilter="true"
                                    onSelect={(option) => {
                                        handleChange(field.name, option?.label || '');
                                    }}
                                    onCurrentValueChange={(e => {
                                        handleChange(field.name, e.target.value || '');
                                    })}
                                />
                            )}
                            {field.inputType === 'dateRange' && (
                                <DateRangePicker
                                    onChange={(range) => handleDateChange(field.name, range)}
                                    value={formData[field.name]}
                                />
                            )}

                            {field.inputType === 'date' && (
                                <DatePicker
                                    onChange={(date) => handleChange(field.name, date)}
                                    value={formData[field.name]}
                                />
                            )}

                        </div>
                    ))}
                </div>
            </div>
            {/* <div className='d-flex justify-content-end align-item-center'
                style={{
                    background: 'grey',
                    borderRadius: '50px',
                    padding: '2px',
                    position: 'absolute',
                    bottom: '-3px',
                    right: '-4px',
                    width: '30px',
                    height: '30px',
                }}>
                <CloseIcon
                    onClick={onClose} />
            </div > */}
        </div>

    );
}

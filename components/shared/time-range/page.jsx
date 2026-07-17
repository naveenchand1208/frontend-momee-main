'use client'
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import './page.css';
export default function CustomTimeInput({ onChange, value, required = false, formSubmitted = false }) {
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const startTimeRef = useRef(null);
    const endTimeRef = useRef(null);
    const hasError = required && formSubmitted && (!startTime || !endTime);
    useEffect(() => {
        if (value) {
            setStartTime(value.startTime || "");
            setEndTime(value.endTime || "");
        }
    }, [value]);

    const openStartTime = () => startTimeRef.current?.showPicker?.();
    const openEndTime = () => endTimeRef.current?.showPicker?.();
    const handleStartChange = (e) => {
        setStartTime(e.target.value);
        onChange?.({ startTime: e.target.value, endTime });
    };
    const handleEndChange = (e) => {
        setEndTime(e.target.value);
        onChange?.({ startTime, endTime: e.target.value });
    };
    return (
        <>
            <div className="flex mb-1 px-1 text-sm font-semibold text-gray-600" style={{ fontSize: '12px' }}>
                <label className="common-cursor" style={{ width: '50%' }}>Start Time</label>
                <label className="common-cursor" style={{ width: '50%' }}>End Time</label>
            </div>
            <div style={{
                border: hasError ? '1px solid red' : '1px solid #ccc',
                padding: '10px 20px',
                borderRadius: '6px',
                display: 'flex',
                gap: '30px',
                alignItems: 'center',
                fontSize: '11px',
                width: '100%'
            }}>
                <div className="relative w-full">
                    <input
                        ref={startTimeRef}
                        type="time"
                        value={startTime}
                        onChange={handleStartChange}
                        onClick={openStartTime}
                        className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 w-full text-black cursor pl-8"
                    />
                    <span className="absolute top-1/2 transform -translate-y-1/2 right-2 cursor" onClick={openStartTime} style={{ marginLeft: '-20px' }}>
                        <Image src="/assets/icons/clock-icon.svg" alt="Clock Icon" width={14} height={14} />
                    </span>
                    {startTime && (
                        <span
                            title="Clear"
                            className="absolute top-1/2 transform -translate-y-1/2 right-2 text-gray-400 hover:text-red-500 text-xs cursor"
                            onClick={() => {
                                setStartTime('');
                                onChange?.({ startTime: '', endTime });
                            }}
                        >
                            ✕
                        </span>
                    )}
                </div>
                <span>|</span>
                <div className="relative w-full">
                    <input
                        ref={endTimeRef}
                        type="time"
                        value={endTime}
                        onChange={handleEndChange}
                        onClick={openEndTime}
                        className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 w-full text-black cursor pl-8"
                    />
                    <span className="absolute top-1/2 transform -translate-y-1/2 right-2 cursor" onClick={openEndTime} style={{ marginLeft: '-20px' }}>
                        <Image src="/assets/icons/clock-icon.svg" alt="Clock Icon" width={14} height={14} />
                    </span>
                    {endTime && (
                        <span
                            title="Clear"
                            className="absolute top-1/2 transform -translate-y-1/2 right-2 text-gray-400 hover:text-red-500 text-xs cursor"
                            onClick={() => {
                                setEndTime('');
                                onChange?.({ startTime: '', endTime });
                            }}
                        >
                            ✕
                        </span>
                    )}
                </div>
            </div>
            {hasError && (
                <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                    Both time are required.
                </div>
            )}
        </>
    );
}

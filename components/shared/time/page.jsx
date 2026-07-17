'use client';
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import './page.css'; // make sure this file contains CSS to hide the default icon

export default function CustomTimePicker({ onChange, value = '' }) {
  const [selectedTime, setSelectedTime] = useState(value || '');
  const timeInputRef = useRef(null);

  useEffect(() => {
    if (value) setSelectedTime(value);
  }, [value]);

  const openTimePicker = () => {
    timeInputRef.current?.showPicker?.();
  };

  const handleChange = (e) => {
    const time = e.target.value;
    setSelectedTime(time);
    onChange?.(time);
  };

  return (
    <>
      <label className="text-sm font-semibold text-gray-600 flex flex-start mb-1 px-1" style={{ fontSize: '12px' }}>
        Select Time
      </label>
      <div
        style={{
          border: '1px solid #ccc',
          padding: '10px 20px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          fontSize: '11px',
          width: '100%',
        }}
      >
        <div className="relative w-full">
          <input
            ref={timeInputRef}
            type="time"
            value={selectedTime}
            onChange={handleChange}
            className="custom-time-input bg-transparent border-none outline-none focus:outline-none focus:ring-0 w-full text-black cursor pl-8"
            onClick={openTimePicker}
          />

          <span
            className="absolute top-1/2 transform -translate-y-1/2 right-2 cursor"
            onClick={openTimePicker}
          >
            <Image
              src="/assets/icons/clock-icon.svg"
              alt="Clock Icon"
              width={14}
              height={14}
            />
          </span>
        </div>
      </div>
    </>
  );
}

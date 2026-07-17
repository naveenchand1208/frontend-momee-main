'use client';
import React, { useState } from 'react';
export const DropdownSelect = ({ options = [], onSelect }) => {
  const [selectedLabel, setSelectedLabel] = useState('Select');
  const handleSelect = (option) => {
    setSelectedLabel(option.label);
    onSelect(option.value); // return value
  };
  return (
    <div className="dropdown">
      <button
        className="btn btn-secondary dropdown-toggle"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {selectedLabel}
      </button>
      <ul className="dropdown-menu">
        {options.map((option, index) => (
          <li key={index}>
            <button
              className="dropdown-item"
              type="button"
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

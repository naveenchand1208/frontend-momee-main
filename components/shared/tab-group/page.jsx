'use client';
import React, { useState } from 'react';
import '../tab-group/page.css';
const defaultOptions = ['All', 'Active', 'Inactive'];
const StatusTabGroup = ({ onChange }) => {
  const [selected, setSelected] = useState('All');
  const handleClick = (label) => {
    setSelected(label);
    onChange?.(label);
  };
  return (
    <div className="status-tab-group">
      {defaultOptions.map((label, index) => (
        <button
          key={label}
          className={`status-tab ${selected === label ? 'selected' : ''}`}
          onClick={() => handleClick(label)}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default StatusTabGroup;



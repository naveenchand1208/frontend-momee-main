'use client';
import React, { useState, useRef, useEffect } from 'react';
import '../text-icon-button/page.css';
export default function TextIconButton({
  iconPath,
  label,
  onClick,
  className = '',
  options = [],
}) {
  const [open, setOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const handleLabelClick = () => {
    if (options.length === 0 && onClick) onClick();
  };
  const toggleDropdown = (e) => {
    e.stopPropagation();
    if (options.length > 0) setOpen((prev) => !prev);
  };
  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        className={`flex items-center gap-1 text-sm transition-all rounded px-1 py-0.5 common-cursor ${className}`}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          fontSize: '13px',
          color: '#404040',
          cursor: options.length === 0
            ? "pointer"
            : 'default'
        }}
        onClick={handleLabelClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#f5f5f5';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'none';
        }}
      >
        {iconPath && (
          <img
            src={iconPath}
            alt="icon"
            style={{ width: '0.9em', height: '0.9em' }}
            className="inline-block cursor"
          />
        )}
        {/* <div className="flex items-center gap-1 cursor">
          <span onClick={toggleDropdown}
          >{label}</span> */}
        {/* {options.length > 0 && (
            <img
              className='cursor custom-hover-icon'
              src={'/assets/icons/arrow-down-icon.svg'}
              alt="Arrow Down"
              style={{ width: '0.8em', height: '0.8em', marginTop: '-1px' }}
              onClick={toggleDropdown}
            />
          )} */}
        {/* </div> */}
        <div className="flex items-center gap-1 cursor">
          <span
            onClick={() => {
              if (onClick) onClick();
              if (options.length > 0) setOpen(prev => !prev);
            }}
          >
            {label}
          </span>
          {/* {options.length > 0 && (
    <img
      className='cursor custom-hover-icon'
      src={'/assets/icons/arrow-down-icon.svg'}
      alt="Arrow Down"
      style={{ width: '0.8em', height: '0.8em', marginTop: '-1px' }}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
        setOpen((prev) => !prev);
      }}
    />
  )} */}
        </div>

      </button>
      {open && options.length > 0 && (
        <div className="absolute right-0 mt-1 bg-white border rounded shadow z-10">
          {options.map((option, idx) => (
            <div
              key={idx}
              onClick={() => {
                setOpen(false);
                option.onClick?.();
              }}
              className="px-3 py-1 cursor-pointer dropdown-option cursor"
              style={{ fontSize: '12px' }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

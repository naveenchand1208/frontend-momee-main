// 'use client';
// import React, { useState, useEffect, useRef } from 'react';
// import { createPortal } from 'react-dom';

// export default function AutoCompleteInput({
//   options = [],
//   onSelect,
//   placeholder = '',
//   label = '',
//   required = false,
//   onErrorChange,
//   formSubmitted = false,
//   disabled = false,
//   commonFilter = false,
//   labelKey = 'label',
//   value = '',
// }) {
//   const [search, setSearch] = useState('');
//   const [filtered, setFiltered] = useState([]);
//   const [showList, setShowList] = useState(false);
//   const [selected, setSelected] = useState(null);
//   const [touched, setTouched] = useState(false);
//   const wrapperRef = useRef(null);
//   const inputRef = useRef(null);
//   const [dropdownStyle, setDropdownStyle] = useState({});

//   // Handle outside click
//   useEffect(() => {
//     const handleClickOutside = e => {
//       if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
//         setShowList(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   // Sync filtered list
//   useEffect(() => {
//     const safeSearch = search ?? '';
//     setFiltered(
//       safeSearch.trim() === ''
//         ? options
//         : options.filter(item =>
//           item[labelKey].toLowerCase().includes(safeSearch.toLowerCase())
//         )
//     );
//   }, [search, options]);

//   // On value change from outside
//   useEffect(() => {
//     if (value) {
//       const matched = options.find(item => item[labelKey] === value);
//       if (matched) {
//         setSelected(matched);
//         setSearch(matched[labelKey]);
//       } else {
//         setSearch(value);
//       }
//     } else {
//       setSelected(null);
//       setSearch('');
//     }
//   }, [value, options, labelKey]);

//   // Form submission touch state
//   useEffect(() => {
//     if (formSubmitted) setTouched(true);
//   }, [formSubmitted]);

//   // Error detection
//   const hasError = required && (touched || formSubmitted) && !selected && !showList;
//   useEffect(() => {
//     onErrorChange?.(hasError);
//   }, [hasError]);

//   const handleSelect = item => {
//     console.log('Selected item:', item); // showError('Please upload a valid audio file') log here
//     setSearch(item.label); // showError('Please upload a valid audio file') this sets input value
//     setSelected(item);
//     setShowList(false);
//     setTouched(true);
//     onSelect?.(item);
//   };
//   // When showing list, position it as a portal
//   useEffect(() => {
//     if (showList && inputRef.current) {
//       const rect = inputRef.current.getBoundingClientRect();
//       setDropdownStyle({
//         position: 'absolute',
//         top: rect.bottom + window.scrollY,
//         left: rect.left + window.scrollX,
//         width: rect.width,
//         listStyle: 'none',
//         zIndex: 9999,
//         background: '#fff',
//         border: '1px solid #ccc',
//         maxHeight: '200px',
//         overflowY: 'auto',
//         boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
//       });
//     }
//   }, [showList]);

//   return (
//     <>
//       <div
//         ref={wrapperRef}
//         style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}
//       >
//         {label && (
//           <label style={{ fontWeight: 500, fontSize: '13px', marginBottom: '4px' }}>
//             {label} {required && <span style={{ color: 'red' }}>*</span>}
//           </label>
//         )}
//         <input
//           ref={inputRef}
//           type="text"
//           value={search}
//           placeholder={placeholder}
//           disabled={disabled}
//           onChange={e => {
//             setSearch(e.target.value);
//             setSelected(null);
//             setShowList(true);
//           }}
//           onFocus={() => {
//             setShowList(true);
//             if (search.trim() === '') setFiltered(options);
//           }}
//           onKeyDown={(e) => {
//             if (e.key === 'Enter' && filtered.length > 0) {
//               handleSelect(filtered[0]);
//             }
//           }}
//           style={{
//             width: '100%',
//             height: commonFilter ? '30px' : '40px',
//             padding: '8px',
//             border: hasError ? '1px solid red' : '2px solid #DBDBDB',
//             borderRadius: '5px',
//             fontSize: commonFilter ? '12px' : '14px',
//           }}
//         />
//         <input type="hidden" value={selected?.id || ''} />
//         {required && !showList && hasError && (
//           <span style={{ color: 'red', fontSize: '12px', marginTop: '2px' }}>
//             {label || 'Field'} required
//           </span>
//         )}
//       </div>

//       {/* Render dropdown via portal */}
//       {showList &&
//         createPortal(
//           <ul style={dropdownStyle}>
//             {filtered.length > 0 ? (
//               filtered.map((item, index) => (
//                 <li
//                   key={index}
//                   onMouseDown={e => e.preventDefault()}
//                   onClick={() => handleSelect(item)}
//                   style={{
//                     padding: '8px',
//                     cursor: 'pointer',
//                     borderBottom: '1px solid #eee',
//                     fontSize: commonFilter ? '12px' : '14px',
//                   }}
//                 >
//                   {item[labelKey]}
//                 </li>
//               ))
//             ) : (
//               <li style={{ padding: '8px', color: '#888' }}>No Data</li>
//             )}
//           </ul>,
//           document.body
//         )}
//     </>
//   );
// }


'use client'
import { useState, useEffect, useRef } from 'react';

export default function AutoCompleteInput({
  options = [],
  onSelect,
  placeholder = '',
  label = '',
  required = false,
  onErrorChange,
  formSubmitted = false,
  disabled = false,
  commonFilter = false,
  labelKey = 'label',
  value = '',
  onCurrentValueChange,
}) {
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [showList, setShowList] = useState(false);
  const [selected, setSelected] = useState(null);
  const [touched, setTouched] = useState(false);
  const [dropdownDirection, setDropdownDirection] = useState('down');
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // When parent form submits, mark touched
  useEffect(() => {
    if (formSubmitted) {
      setTouched(true);
    }
  }, [formSubmitted]);

  // Filter options based on search
  useEffect(() => {
    const safeSearch = search ?? '';
    setFiltered(
      safeSearch.trim() === ''
        ? options
        : options.filter(item =>
          item.label.toLowerCase().includes(safeSearch.toLowerCase())
        )
    );
  }, [search, options]);


  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowList(false);
        setDropdownDirection('down');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Only show error if required, after blur or submit, no selection, and dropdown is closed
  const hasError = required && (touched || formSubmitted) && !selected && !showList;

  // Notify parent of error state
  useEffect(() => {
    onErrorChange?.(hasError);
  }, [hasError, onErrorChange]);

  useEffect(() => {
    if (value) {
      const matched = options.find(item => item[labelKey] === value);
      if (matched) {
        setSelected(matched);
        setSearch(matched[labelKey]);
      } else {
        setSearch(value); // fallback to plain value
      }
    } else {
      setSelected(null);
      setSearch('');
    }
  }, [value, options, labelKey]);

  const handleSelect = item => {
    console.log('item', item)
    setSearch(item.label);
    setSelected(item);
    setShowList(false);
    onSelect?.(item);
    setTouched(true);
    setDropdownDirection('down')
    inputRef.current?.blur();
  };

  return (
    <div
      ref={wrapperRef}
      style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}
    >
      {label && dropdownDirection === 'down'  && (
        <label className='common-cursor' style={{ fontWeight: 500, fontSize: '13px', marginBottom: '4px' }}>
          {label} {required && <span style={{ color: 'red' }}>*</span>}
        </label>
      )}

      <input
        ref={inputRef}
        type="text"
        value={search ?? ''}
        placeholder={placeholder}
        disabled={disabled}
        onChange={e => {
          const val = e.target.value;
          setSearch(val);
          setSelected(null);
          setShowList(true);
          onCurrentValueChange?.(e);
        }}
        onFocus={() => {
          setShowList(true);
          if (search.trim() === '') setFiltered(options);
          const rect = wrapperRef.current.getBoundingClientRect();
          const spaceBelow = window.innerHeight - rect.bottom;
          const spaceAbove = rect.top;
          console.log('spaceBelow', spaceBelow)
          const estimatedDropdownHeight = Math.min(filtered.length * 40, 180);

          if (!commonFilter) {
            if (spaceBelow < 300) {
              setDropdownDirection('up');
            } else {
              setDropdownDirection('down');
            }
          } else {
            if (spaceBelow < 300) {
              setDropdownDirection('up');
            } else {
              setDropdownDirection('down');
            }
          }
        }}
        onBlur={() => {
          // Delay marking touched so clicks register
          setTimeout(() => setTouched(true), 100);
        }}
        style={{
          width: '100%',
          // height: commonFilter ? '30px' : '40px',
          height: '40px',
          padding: '8px',
          border: hasError ? '1px solid red' : '2px solid #DBDBDB',
          borderRadius: '5px',
          boxSizing: 'border-box',
          fontSize: commonFilter ? '12px' : '14px',
        }}
      />

      <input type="hidden" value={selected?.id || ''} />

      {showList && (
        <ul 
          style={{
            position: 'absolute',
            // top: 'calc(100% - 1px)', 
            [dropdownDirection === 'down' ? 'top' : 'bottom']: 'calc(100% - 1px)',
            left: 0,
            right: 0,
            background: '#fff',
            border: '1px solid #ccc',
            // borderTop: 'none',
            borderTop: dropdownDirection === 'down' ? 'none' : '1px solid #ccc',
            borderBottom: dropdownDirection === 'up' ? 'none' : '1px solid #ccc',
            maxHeight: commonFilter ? '100px' : '180px',
            overflowY: 'auto',
            zIndex: 100,
            listStyle: 'none',
            marginTop: '1px',
            marginBottom: '5px',
            padding: 0,
            fontSize: commonFilter ? '12px' : '14px',
          }}
        >
          {filtered.length > 0 ? (
            filtered.map((item, index) => (
              <li 
                key={index}
                className={`list-values ${!!selected ? 'selected' : ''} cursor`}
                onMouseDown={e => e.preventDefault()}
                onClick={() => handleSelect(item)}
                style={{
                  padding: '8px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                  overflow: 'auto'
                }}
              >
                {item[labelKey]}
              </li>
            ))
          ) : (
            <li style={{ padding: '8px', color: '#888' }}>No Data</li>
          )}
        </ul>
      )}


      {/* {required && !showList && (
        <div style={{ marginTop: '1px', height: '16px' }}>
          {hasError && (
            <span style={{ color: 'red', fontSize: '12px' }}>
              {label || 'Field'} required
            </span>
          )}
        </div>
      )} */}
      {!showList && hasError && (
        <div style={{ marginTop: '4px' }}>
          <span style={{ color: 'red', fontSize: '12px' }}>
            {label || 'Field'} required
          </span>
        </div>
      )}
    </div>
  );
}
// 'use client';
// import React from 'react';
// import { styled } from '@mui/material/styles';
// import Switch from '@mui/material/Switch';

// // Custom styled switch with green (on) and red (off)
// const ColoredSwitch = styled(Switch)(({ theme }) => ({
//   '& .MuiSwitch-switchBase.Mui-checked': {
//     color: 'green',
//     '& + .MuiSwitch-track': {
//       backgroundColor: 'green',
//     },
//   },
//   '& .MuiSwitch-switchBase': {
//     color: 'red',
//     '& + .MuiSwitch-track': {
//       backgroundColor: 'red',
//     },
//   },
// }));

// export default function ToggleSwitch({ isChecked = false, onToggle }) {
//   const handleChange = (event) => {
//     const newChecked = event.target.checked;
//     if (onToggle) {
//       onToggle(newChecked);
//     }
//   };

//   return (
//     <ColoredSwitch
//       checked={isChecked}
//       onChange={handleChange}
//     />
//   );
// }

'use client';
import React from 'react';
import './page.css'

export default function ToggleSwitch({ isChecked = false, onToggle }) {
  return (
    <label className="mui-switch">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={(e) => onToggle?.(e.target.checked)}
      />
      <span className="mui-slider" />
    </label>
  );
}


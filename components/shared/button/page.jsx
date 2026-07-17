// 'use client';
// import './page.css';
// import React, { useState } from 'react';
// import Image from 'next/image';
// import CircularProgress from '@mui/material/CircularProgress';

// const Button = ({
//   label = '',
//   type = 'button',
//   color = '#fff',
//   backgroundColor = '#0070f3',
//   iconPath,
//   onClick,
//   isLoading = false, // <-- Add isLoading prop
// }) => {
//   const [iconError, setIconError] = useState(false);
//   const showIcon = iconPath && !iconError && !isLoading;
//   const showLabel = label && !isLoading;

//   return (
//     <button
//       type={type}
//       onClick={onClick}
//       disabled={isLoading}
//       style={{
//         color,
//         backgroundColor,
//         padding: '10px 15px',
//         border: 'none',
//         borderRadius: '4px',
//         cursor: isLoading ? 'not-allowed' : 'pointer',
//         display: 'flex',
//         alignItems: 'center',
//         gap: '8px',
//         opacity: isLoading ? 0.7 : 1,
//       }}
//     >
//       {isLoading ? (
//         <CircularProgress size={20} style={{ color: '#fff' }} />
//       ) : (
//         <>
//           {showIcon && (
//             <Image
//               src={iconPath}
//               alt="icon"
//               width={24}
//               height={24}
//               onError={() => setIconError(true)}
//             />
//           )}
//           {showLabel && <span>{label}</span>}
//         </>
//       )}
//     </button>
//   );
// };

// export default Button;


'use client';
import './page.css';
import React, { useState } from 'react';
import Image from 'next/image';
import CircularProgress from '@mui/material/CircularProgress';

const sizeStyles = {
  xxSmall: {
    padding: '2px 4px',
    fontSize: '10px',
    iconSize: 8,
    loaderSize: 12,
    borderRadius: '3px'
  },
  extraSmall: {
    padding: '4px 6px',
    fontSize: '12px',
    iconSize: 10,
    loaderSize: 16,
    borderRadius: '3px'
  },
  small: {
    padding: '6px 10px',
    fontSize: '14px',
    iconSize: 13,
    loaderSize: 16,
    borderRadius: '5px'
  },
  medium: {
    padding: '10px 15px',
    fontSize: '14px',
    iconSize: 20,
    loaderSize: 20,
    borderRadius: '7px'
  },
  large: {
    padding: '14px 20px',
    fontSize: '16px',
    iconSize: 24,
    loaderSize: 24,
    borderRadius: '7px'
  },
};

const Button = ({
  label = '',
  type = 'button',
  color = '#fff',
  backgroundColor = '#0070f3',
  iconPath,
  className,
  onClick,
  isLoading = false,
  disabled = false,
  size = 'small', // 'small' | 'medium' | 'large'
  shape = 'default', // 'default' | 'circle'

}) => {
  const [iconError, setIconError] = useState(false);
  const showIcon = iconPath && !iconError && !isLoading;
  const showLabel = label && !isLoading;
  const isCircle = shape === 'circle';
  const isButtonDisabled = isLoading || disabled;
  const { padding, fontSize, iconSize, loaderSize, borderRadius } = sizeStyles[size] || sizeStyles.medium;

  return (
    <button
      type={type}
      onClick={isButtonDisabled ? undefined : onClick}
      disabled={isButtonDisabled}
      className={!isButtonDisabled ? 'cursor' : ''}      // style={{
      //   color,
      //   backgroundColor,
      //   padding: isCircle ? 0 : padding,
      //   fontSize,
      //   border: 'none',
      //   borderRadius: isCircle ? '50%' : borderRadius,
      //   cursor: isLoading ? 'not-allowed' : 'undefined',
      //   width: isCircle ? '40px' : 'auto',
      //   height: isCircle ? '40px' : 'auto',
      //   display: 'flex',
      //   alignItems: 'center',
      //   gap: '8px',
      //   opacity: isLoading ? 0.7 : 1,
      // }}
      style={{
        color,
        backgroundColor,
        padding: isCircle ? 0 : padding,
        fontSize,
        border: 'none',
        borderRadius: isCircle ? '50%' : borderRadius,
        cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: isCircle ? '40px' : 'auto',
        height: isCircle ? '40px' : 'auto',
        opacity: isButtonDisabled ? 0.7 : 1,
      }}

    >
      {isLoading ? (
        <CircularProgress size={loaderSize} style={{ color: '#fff' }} />
      ) : (
        <>
          {showIcon && (
            <Image
              src={iconPath}
              alt="icon"
              width={iconSize}
              height={iconSize}
              onError={() => setIconError(true)}
            />
          )}
          {showLabel && <span>{label}</span>}
        </>
      )}
    </button>
  );
};

export default Button;

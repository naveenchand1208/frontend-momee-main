// 'use client';

// import React, { useState } from 'react';
// import Dialog from '@mui/material/Dialog';
// import DialogTitle from '@mui/material/DialogTitle';
// import DialogContent from '@mui/material/DialogContent';
// import DialogActions from '@mui/material/DialogActions';
// import IconButton from '@mui/material/IconButton';
// import CloseIcon from '@mui/icons-material/Close';
// export default function CustomDialog({ open, onClose, title, content, actions }) {
//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       aria-labelledby="dynamic-dialog-title"
//     >
//       {title && (
//         <DialogTitle
//           id="dynamic-dialog-title"
//           style={{
//             display: 'flex',
//             justifyContent: 'space-between',
//             alignItems: 'center',
//             paddingRight: '12px' // add some padding to balance spacing
//           }}
//         >
//           <span style={{ fontWeight: 'bold' }}>{title}</span>

//           <IconButton
//             aria-label="close"
//             onClick={onClose}
//             sx={{
//               color: (theme) => theme.palette.grey[600],
//               borderRadius: '4px',
//               padding: '4px',
//               '&:hover': {
//                 backgroundColor: (theme) => theme.palette.grey[200],
//               },
//             }}
//           >
//             <CloseIcon />
//           </IconButton>
//         </DialogTitle>
//       )}

//       <DialogContent>
//         {content} {/* Render the dynamically passed content here */}
//       </DialogContent>
//       {actions && (
//         <DialogActions>
//           {actions} {/* Render the dynamically passed actions (buttons) here */}
//         </DialogActions>
//       )}
//     </Dialog>
//   );
// }





'use client';

import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Grow from '@mui/material/Grow';
import { useTheme } from '@mui/material/styles';

const Transition = React.forwardRef(function Transition(props, ref) {
  return (
    <Grow
      ref={ref}
      {...props}
      style={{ transformOrigin: 'top right' }} // animate from top-right
      timeout={{ enter: 600, exit: 300 }}
    />
  );
});

export default function CustomDialog({
  open,
  onClose,
  title,
  titleColor = '#000',
  backgroundColor = '#ffffff',
  content,
  actions,
  maxWidth = 'md', // 'xs', 'sm', 'md', 'lg', 'xl', or false
}) {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth // Allows maxWidth to be applied
      slots={{
        transition: Transition,
      }}
      slotProps={{
        paper: {
          sx: {
            backgroundColor,
            borderRadius: '10px',
            height: 'max-content',
            maxHeight: '90vh',
            margin: 'auto',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            position: 'absolute',
          },
        },
      }}
      aria-labelledby="dynamic-dialog-title"
    >
      {title && (
        <DialogTitle
          id="dynamic-dialog-title"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingRight: '12px',
            color: titleColor,
            overflow: 'visible',
            fontSize:'14px',
          }}
        >
          <span style={{ fontWeight: 'bold' }}>{title}</span>
          <IconButton
            aria-label="close"
            onClick={onClose}
            className='cursor'
            sx={{
              color: theme.palette.grey[600],
              borderRadius: '4px',
              padding: '4px',
              '&:hover': {
                backgroundColor: theme.palette.grey[200],
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
      )}

      <DialogContent>{content}</DialogContent>

      {/* {actions} */}
    </Dialog>
  );
}

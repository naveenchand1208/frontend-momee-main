import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '../button/page';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';

export default function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title = '',
  message = 'Are you sure you want to proceed?',
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      PaperProps={{ sx: { p: 2 } }}
    >
      <DialogTitle sx={{ m: 0, p: 0 }}>
        {title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
            borderRadius: '4px',
            padding: '2px 6px',
            '&:hover': {
              backgroundColor: (theme) => theme.palette.grey[200],
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 2, pb: 1 }}>
        <Typography
          variant="h6"
          sx={{ fontSize: '16px', mb: 1.5, mt: 3 }}
        >
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', mt: 0.5, pb: 1 }}>
        <Button
          label={cancelLabel}
          backgroundColor="#E0E0E0"
          color="#000"
          onClick={onClose}
          size="small"
        />
        <Button
          label={confirmLabel}
          backgroundColor="#1976D2"
          color="#fff"
          onClick={onConfirm}
          size="small"
        />
      </DialogActions>
    </Dialog>
  );
}

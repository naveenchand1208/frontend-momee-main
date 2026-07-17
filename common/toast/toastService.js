import { toast } from 'react-hot-toast';

export const showSuccess = (message) => {
  toast.success(message || 'Success!', {
    duration: 3000,
    position: 'top-right',
  });
};

export const showError = (message) => {
  toast.error(message || 'Error!', {
    duration: 3000,
    position: 'top-right',
  });
};

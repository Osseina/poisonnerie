import toast from 'react-hot-toast';

export const showSuccess = (message) => {
  toast.success(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      borderRadius: '8px',
      background: '#66BB6A',
      color: '#fff',
      fontFamily: 'Roboto, sans-serif'
    },
    icon: '🐟'
  });
};

export const showError = (message) => {
  toast.error(message, {
    duration: 5000,
    position: 'top-right',
    style: {
      borderRadius: '8px',
      background: '#dc3545',
      color: '#fff',
      fontFamily: 'Roboto, sans-serif'
    }
  });
};

export const showWarning = (message) => {
  toast(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      borderRadius: '8px',
      background: '#FF6F00',
      color: '#fff',
      fontFamily: 'Roboto, sans-serif'
    },
    icon: '⚠️'
  });
};
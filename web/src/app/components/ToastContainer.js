import React, { useState, useEffect } from 'react';
import { useToast } from '../providers/ToastProvider';
import './ToastContainer.css';

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast 
          key={toast.id} 
          toast={toast} 
          onClose={() => removeToast(toast.id)} 
        />
      ))}
    </div>
  );
};

const Toast = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    // Delay the actual removal to allow exit animation
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Remove auto-close - user must manually close the toast

  return (
    <div className={`toast toast-${toast.type} ${isExiting ? 'toast-exiting' : ''}`}>
      <div className="toast-content">
        <div className="toast-message">
          {toast.message}
        </div>
        <button className="toast-close" onClick={handleClose}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ToastContainer;

"use client";

import { useEffect, useCallback, useMemo, memo } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast = memo(({ 
  message, 
  type, 
  isVisible, 
  onClose, 
  duration = 5000 
}: ToastProps) => {
  const getToastStyles = useMemo(() => {
    switch (type) {
      case 'success':
        return 'bg-green-600 border-green-500 text-white';
      case 'error':
        return 'bg-red-600 border-red-500 text-white';
      case 'warning':
        return 'bg-yellow-600 border-yellow-500 text-white';
      case 'info':
      default:
        return 'bg-blue-600 border-blue-500 text-white';
    }
  }, [type]);

  const getIcon = useMemo(() => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-green-200" />;
      case 'error':
        return <FaExclamationCircle className="text-red-200" />;
      case 'warning':
        return <FaExclamationCircle className="text-yellow-200" />;
      case 'info':
      default:
        return <FaInfoCircle className="text-blue-200" />;
    }
  }, [type]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);
  
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(handleClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, handleClose]);

  if (!isVisible) return null;

  return (
    <div className={`
      fixed top-4 right-4 z-50 max-w-sm w-full mx-auto
      transform transition-all duration-300 ease-in-out
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
      <div className={`
        ${getToastStyles}
        rounded-lg shadow-lg border-l-4 p-4
        flex items-center space-x-3
        backdrop-blur-sm
      `}>
        <div className="flex-shrink-0">
          {getIcon}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-5">
            {message}
          </p>
        </div>
        
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 hover:bg-black/20 rounded-full transition-colors"
        >
          <FaTimes className="text-sm opacity-70 hover:opacity-100" />
        </button>
      </div>
    </div>
  );
});

Toast.displayName = 'Toast';

export default Toast;
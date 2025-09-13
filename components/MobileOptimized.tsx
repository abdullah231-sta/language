'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

// Custom hooks for mobile detection
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

export const useIsTouchDevice = () => {
  const [isTouchDevice, setIsTouchDevice] = React.useState(false);

  React.useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  return isTouchDevice;
};

export const useSafeArea = () => {
  const [safeArea, setSafeArea] = React.useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  React.useEffect(() => {
    const updateSafeArea = () => {
      const style = getComputedStyle(document.documentElement);
      setSafeArea({
        top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
        right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
        bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
        left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0'),
      });
    };

    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);
    return () => window.removeEventListener('resize', updateSafeArea);
  }, []);

  return safeArea;
};

// Mobile-optimized button component
interface MobileButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const MobileButton: React.FC<MobileButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
  type = 'button',
}) => {
  const { theme } = useTheme();

  const baseClasses = `
    font-semibold rounded-lg transition-all duration-200 
    touch-manipulation active:scale-95 
    focus:outline-none focus:ring-2 focus:ring-offset-2
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  `;

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[44px]',
    md: 'px-4 py-3 text-base min-h-[48px]',
    lg: 'px-6 py-4 text-lg min-h-[52px]',
  };

  const variantClasses = {
    primary: theme === 'dark' 
      ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
      : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: theme === 'dark'
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 focus:ring-gray-500'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500',
    danger: theme === 'dark'
      ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
      : 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// Mobile-optimized card component
interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: boolean;
}

export const MobileCard: React.FC<MobileCardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = true,
}) => {
  const { theme } = useTheme();

  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const themeClasses = theme === 'dark'
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';

  return (
    <div
      className={`
        rounded-lg border ${shadow ? 'shadow-sm' : ''} 
        ${paddingClasses[padding]} ${themeClasses} ${className}
      `}
    >
      {children}
    </div>
  );
};

// Mobile-optimized input component
interface MobileInputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  autoComplete?: string;
}

export const MobileInput = React.forwardRef<HTMLInputElement, MobileInputProps>(({
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  disabled = false,
  autoComplete,
}, ref) => {
  const { theme } = useTheme();

  const baseClasses = `
    w-full px-4 py-3 rounded-lg border transition-colors duration-200
    min-h-[48px] text-base
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
  `;

  const themeClasses = theme === 'dark'
    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500';

  return (
    <input
      ref={ref}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      autoComplete={autoComplete}
      className={`${baseClasses} ${themeClasses} ${className}`}
      style={{ fontSize: '16px' }}
    />
  );
});

MobileInput.displayName = 'MobileInput';

// Mobile-optimized modal component
interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const MobileModal: React.FC<MobileModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  const overlayClasses = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4';
  
  const modalClasses = theme === 'dark'
    ? 'bg-gray-800 text-white'
    : 'bg-white text-gray-900';

  return (
    <div className={overlayClasses} onClick={onClose}>
      <div
        className={`
          w-full max-w-md rounded-t-lg sm:rounded-lg ${modalClasses}
          shadow-xl transform transition-all duration-300
          max-h-[90vh] overflow-hidden
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// Mobile-optimized list item component
interface MobileListItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  active?: boolean;
}

export const MobileListItem: React.FC<MobileListItemProps> = ({
  children,
  onClick,
  className = '',
  active = false,
}) => {
  const { theme } = useTheme();

  const baseClasses = `
    p-4 transition-colors duration-200 touch-manipulation
    ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}
  `;

  const themeClasses = theme === 'dark'
    ? `${active ? 'bg-gray-700' : 'hover:bg-gray-800'}`
    : `${active ? 'bg-gray-100' : 'hover:bg-gray-50'}`;

  return (
    <div
      onClick={onClick}
      className={`${baseClasses} ${themeClasses} ${className}`}
    >
      {children}
    </div>
  );
};
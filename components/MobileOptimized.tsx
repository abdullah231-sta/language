'use client';

import React from 'react';

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
  const isTouchDevice = useIsTouchDevice();

  const baseClasses = `
    font-semibold rounded-lg transition-all duration-200 
    touch-manipulation active:scale-95 
    focus:outline-none focus:ring-2 focus:ring-offset-2
    flex items-center justify-center
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed transform-none' : 'cursor-pointer hover:scale-105'}
    ${isTouchDevice ? 'active:bg-opacity-80' : ''}
  `;

  const sizeClasses = {
    sm: 'px-4 py-3 text-sm min-h-[44px] min-w-[44px]',
    md: 'px-5 py-4 text-base min-h-[48px] min-w-[48px]',
    lg: 'px-6 py-5 text-lg min-h-[52px] min-w-[52px]',
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white focus:ring-blue-500 shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600 focus:ring-gray-500 shadow-md hover:shadow-lg',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-lg hover:shadow-xl',
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
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      className={`
        rounded-lg border bg-gray-800 border-gray-700 ${shadow ? 'shadow-sm' : ''} 
        ${paddingClasses[padding]} ${className}
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
  const baseClasses = `
    w-full px-4 py-3 rounded-lg border transition-colors duration-200
    min-h-[48px] text-base
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
  `;

  return (
    <input
      ref={ref}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      autoComplete={autoComplete}
      className={`${baseClasses} bg-gray-800 border-gray-600 text-white placeholder-gray-400 ${className}`}
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
  if (!isOpen) return null;

  const overlayClasses = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4';

  return (
    <div className={overlayClasses} onClick={onClose}>
      <div
        className={`
          w-full max-w-md rounded-t-lg sm:rounded-lg bg-gray-800 text-white
          shadow-xl transform transition-all duration-300
          max-h-[90vh] overflow-hidden
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors"
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
  const baseClasses = `
    p-4 transition-colors duration-200 touch-manipulation
    ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}
  `;

  return (
    <div
      onClick={onClick}
      className={`${baseClasses} ${active ? 'bg-gray-700' : 'hover:bg-gray-800'} ${className}`}
    >
      {children}
    </div>
  );
};
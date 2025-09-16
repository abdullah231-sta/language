"use client";

import React from 'react';
import { FaSun, FaMoon, FaDesktop } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <FaSun className="text-yellow-500" />;
      case 'dark':
        return <FaMoon className="text-blue-400" />;
      case 'system':
        return <FaDesktop className="text-gray-500" />;
      default:
        return <FaSun className="text-yellow-500" />;
    }
  };

  const getTooltip = () => {
    switch (theme) {
      case 'light':
        return 'Switch to dark mode';
      case 'dark':
        return 'Switch to system theme';
      case 'system':
        return `System theme (${resolvedTheme}) - Switch to light mode`;
      default:
        return 'Switch theme';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
      title={getTooltip()}
      aria-label="Toggle theme"
    >
      {getIcon()}
    </button>
  );
};

export default ThemeToggle;
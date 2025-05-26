
import React from 'react';

interface IconProps {
  className?: string;
}

export const IconBase: React.FC<React.PropsWithChildren<IconProps>> = ({ children, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={`w-6 h-6 ${className}`}
  >
    {children}
  </svg>
);


import React from 'react';
import { IconBase } from './IconBase';

interface XCircleIconProps {
  className?: string;
}

export const XCircleIcon: React.FC<XCircleIconProps> = ({ className }) => (
  <IconBase className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </IconBase>
);

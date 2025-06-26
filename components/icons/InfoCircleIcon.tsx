import React from 'react';
import { IconBase } from './IconBase';

interface InfoCircleIconProps {
  className?: string;
}

export const InfoCircleIcon: React.FC<InfoCircleIconProps> = ({ className }) => (
  <IconBase className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 9.75h1.5v4.5h-1.5m0-6h1.5m9 3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </IconBase>
);
